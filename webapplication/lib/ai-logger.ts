// AI Usage Logger - Tracks Gemini AI workflow executions
import { db } from '@/db/drizzle';
import { aiUsageLogs } from '@/db/schema';

export interface AIUsageLogData {
  userId: string;
  workflowType: 'GENERATE_AI_PLAN' | 'CREATE_MANUAL_PLAN';
  promptText: string;
  responseText?: string;
  tokensUsed?: number;
  success: boolean;
  errorMessage?: string;
  responseTime: number;
}

/**
 * Log AI workflow execution to database
 * @param data - AI usage log data
 * @returns Promise<void>
 */
export async function logAIUsage(data: AIUsageLogData): Promise<void> {
  try {
    await db.insert(aiUsageLogs).values({
      userId: data.userId,
      workflowType: data.workflowType,
      promptText: data.promptText,
      responseText: data.responseText || null,
      tokensUsed: data.tokensUsed || null,
      success: data.success,
      errorMessage: data.errorMessage || null,
      responseTime: data.responseTime,
    });
  } catch (error) {
    // Log to console but don't fail the request if logging fails
    console.error('Failed to log AI usage:', error);
  }
}

/**
 * Create a log entry helper that tracks timing automatically
 * @param userId - User ID
 * @param workflowType - Type of AI workflow
 * @param promptText - The prompt sent to AI
 * @returns Object with complete() method to finalize the log
 */
export function createAIUsageLogger(
  userId: string,
  workflowType: 'GENERATE_AI_PLAN' | 'CREATE_MANUAL_PLAN',
  promptText: string
) {
  const startTime = Date.now();

  return {
    async complete(options: {
      success: boolean;
      responseText?: string;
      tokensUsed?: number;
      errorMessage?: string;
    }) {
      const responseTime = Date.now() - startTime;
      
      await logAIUsage({
        userId,
        workflowType,
        promptText,
        responseText: options.responseText,
        tokensUsed: options.tokensUsed,
        success: options.success,
        errorMessage: options.errorMessage,
        responseTime,
      });
    },
  };
}
