import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkReviewEligibility } from '@/lib/review-eligibility';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a guide
    if (authResult.user.role !== 'GUIDE') {
      return NextResponse.json(
        { success: false, error: 'Only guides can access this endpoint' },
        { status: 403 }
      );
    }

    const userId = authResult.user.userId;
    const { id: tripId } = await params;

    // Check review eligibility
    const eligibility = await checkReviewEligibility(tripId, userId, 'GUIDE');

    return NextResponse.json({
      success: true,
      eligibility,
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check review eligibility' },
      { status: 500 }
    );
  }
}
