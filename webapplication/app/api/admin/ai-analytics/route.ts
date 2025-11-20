import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/db/drizzle';
import { aiUsageLogs, users } from '@/db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user[0] || user[0].role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Calculate time filter
    let timeFilter;
    const now = new Date();
    switch (timeRange) {
      case '24h':
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        timeFilter = new Date(0); // Beginning of time
        break;
    }

    // Fetch all logs within time range
    const logs = await db
      .select({
        id: aiUsageLogs.id,
        userId: aiUsageLogs.userId,
        workflowType: aiUsageLogs.workflowType,
        promptText: aiUsageLogs.promptText,
        responseText: aiUsageLogs.responseText,
        tokensUsed: aiUsageLogs.tokensUsed,
        success: aiUsageLogs.success,
        errorMessage: aiUsageLogs.errorMessage,
        responseTime: aiUsageLogs.responseTime,
        createdAt: aiUsageLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(aiUsageLogs)
      .leftJoin(users, eq(aiUsageLogs.userId, users.id))
      .where(gte(aiUsageLogs.createdAt, timeFilter))
      .orderBy(desc(aiUsageLogs.createdAt));

    // Calculate overall statistics
    const totalRequests = logs.length;
    const successfulRequests = logs.filter(log => log.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    
    const totalResponseTime = logs.reduce((sum, log) => sum + (log.responseTime || 0), 0);
    const avgResponseTime = totalRequests > 0 ? Math.round(totalResponseTime / totalRequests) : 0;
    
    const totalTokens = logs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0);
    const avgTokensPerRequest = totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0;

    // Workflow breakdown
    const workflowMap = new Map<string, { count: number; successes: number; tokens: number }>();
    logs.forEach(log => {
      const type = log.workflowType || 'UNKNOWN';
      if (!workflowMap.has(type)) {
        workflowMap.set(type, { count: 0, successes: 0, tokens: 0 });
      }
      const stats = workflowMap.get(type)!;
      stats.count++;
      if (log.success) stats.successes++;
      stats.tokens += log.tokensUsed || 0;
    });

    const workflowBreakdown = Array.from(workflowMap.entries()).map(([workflowType, stats]) => ({
      workflowType,
      count: stats.count,
      successRate: stats.count > 0 ? (stats.successes / stats.count) * 100 : 0,
      avgTokens: stats.count > 0 ? Math.round(stats.tokens / stats.count) : 0,
    }));

    // Top users by request count
    const userMap = new Map<string, { name: string; email: string; requests: number; successes: number; tokens: number }>();
    logs.forEach(log => {
      if (!userMap.has(log.userId)) {
        userMap.set(log.userId, {
          name: log.userName || 'Unknown',
          email: log.userEmail || 'unknown@example.com',
          requests: 0,
          successes: 0,
          tokens: 0,
        });
      }
      const userStats = userMap.get(log.userId)!;
      userStats.requests++;
      if (log.success) userStats.successes++;
      userStats.tokens += log.tokensUsed || 0;
    });

    const topUsers = Array.from(userMap.entries())
      .map(([userId, stats]) => ({
        userId,
        userName: stats.name,
        userEmail: stats.email,
        requestCount: stats.requests,
        tokensUsed: stats.tokens,
        successRate: stats.requests > 0 ? (stats.successes / stats.requests) * 100 : 0,
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10);

    // Recent failures
    const recentFailures = logs
      .filter(log => !log.success)
      .slice(0, 10)
      .map(log => ({
        id: log.id,
        userName: log.userName || 'Unknown',
        workflowType: log.workflowType,
        errorMessage: log.errorMessage || 'Unknown error',
        promptText: log.promptText.substring(0, 200) + (log.promptText.length > 200 ? '...' : ''),
        createdAt: log.createdAt.toISOString(),
      }));

    // Time series data (group by day)
    const timeSeriesMap = new Map<string, { requests: number; successes: number; failures: number; tokens: number }>();
    logs.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, { requests: 0, successes: 0, failures: 0, tokens: 0 });
      }
      const dayStats = timeSeriesMap.get(date)!;
      dayStats.requests++;
      if (log.success) {
        dayStats.successes++;
      } else {
        dayStats.failures++;
      }
      dayStats.tokens += log.tokensUsed || 0;
    });

    const timeSeriesData = Array.from(timeSeriesMap.entries())
      .map(([date, stats]) => ({
        date,
        requests: stats.requests,
        successes: stats.successes,
        failures: stats.failures,
        tokens: stats.tokens,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      stats: {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime,
        totalTokens,
        avgTokensPerRequest,
      },
      workflowBreakdown,
      topUsers,
      recentFailures,
      timeSeriesData,
    });

  } catch (error) {
    console.error('AI analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch AI analytics',
        details: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined,
      },
      { status: 500 }
    );
  }
}
