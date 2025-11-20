import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/db/drizzle';
import { apiUsageLogs, users } from '@/db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || 'all'; // 24h, 7d, 30d, all

    // Calculate date filter
    let dateFilter: Date | undefined;
    const now = new Date();
    if (timeRange === '24h') {
      dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeRange === '7d') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build base query conditions
    const baseCondition = dateFilter ? gte(apiUsageLogs.createdAt, dateFilter) : sql`1=1`;

    // Get total stats - using simpler aggregation
    const totalStats = await db
      .select({
        totalRequests: sql<number>`cast(count(*) as integer)`,
        successfulRequests: sql<number>`cast(sum(case when success = true then 1 else 0 end) as integer)`,
        failedRequests: sql<number>`cast(sum(case when success = false then 1 else 0 end) as integer)`,
        totalCredits: sql<number>`cast(coalesce(sum(credits_used), 0) as integer)`,
        avgResponseTime: sql<number>`cast(coalesce(avg(response_time), 0) as integer)`,
      })
      .from(apiUsageLogs)
      .where(baseCondition);

    // Get requests by category
    const categoryStats = await db
      .select({
        category: apiUsageLogs.category,
        count: sql<number>`cast(count(*) as integer)`,
        credits: sql<number>`cast(coalesce(sum(credits_used), 0) as integer)`,
      })
      .from(apiUsageLogs)
      .where(baseCondition)
      .groupBy(apiUsageLogs.category)
      .orderBy(desc(sql`count(*)`));

    // Get top users by request count
    const topUsers = await db
      .select({
        userId: apiUsageLogs.userId,
        userName: users.name,
        userEmail: users.email,
        requestCount: sql<number>`cast(count(*) as integer)`,
        creditsUsed: sql<number>`cast(coalesce(sum(credits_used), 0) as integer)`,
      })
      .from(apiUsageLogs)
      .innerJoin(users, eq(apiUsageLogs.userId, users.id))
      .where(baseCondition)
      .groupBy(apiUsageLogs.userId, users.name, users.email)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get recent errors
    const errorCondition = dateFilter
      ? and(eq(apiUsageLogs.success, false), gte(apiUsageLogs.createdAt, dateFilter))
      : eq(apiUsageLogs.success, false);

    const recentErrors = await db
      .select({
        id: apiUsageLogs.id,
        query: apiUsageLogs.query,
        errorMessage: apiUsageLogs.errorMessage,
        createdAt: apiUsageLogs.createdAt,
        userName: users.name,
      })
      .from(apiUsageLogs)
      .innerJoin(users, eq(apiUsageLogs.userId, users.id))
      .where(errorCondition)
      .orderBy(desc(apiUsageLogs.createdAt))
      .limit(10);

    // Calculate error rate
    const errorRate =
      totalStats[0]?.totalRequests > 0
        ? ((totalStats[0].failedRequests / totalStats[0].totalRequests) * 100).toFixed(2)
        : '0.00';

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalRequests: totalStats[0]?.totalRequests || 0,
          successfulRequests: totalStats[0]?.successfulRequests || 0,
          failedRequests: totalStats[0]?.failedRequests || 0,
          totalCredits: totalStats[0]?.totalCredits || 0,
          avgResponseTime: totalStats[0]?.avgResponseTime || 0,
          errorRate: parseFloat(errorRate),
        },
        categoryBreakdown: categoryStats || [],
        topUsers: topUsers || [],
        recentErrors: recentErrors || [],
        timeRange,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API usage stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API usage stats', details: error.message },
      { status: 500 }
    );
  }
}
