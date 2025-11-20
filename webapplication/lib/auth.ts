// lib/auth.ts
import { NextRequest } from 'next/server';
import { getSession, JWTPayload, UserRole } from './jwt';

export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
}

/**
 * Verify authentication from request
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const user = await getSession();
    
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized - No valid session',
      };
    }
    
    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Verify authentication and check for specific role
 */
export async function verifyAuthWithRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  const authResult = await verifyAuth(request);
  
  if (!authResult.success || !authResult.user) {
    return authResult;
  }
  
  if (!allowedRoles.includes(authResult.user.role)) {
    return {
      success: false,
      error: 'Forbidden - Insufficient permissions',
    };
  }
  
  return authResult;
}
