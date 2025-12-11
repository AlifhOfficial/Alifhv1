import { logger, securityLogger, auditLogger } from './logger';

// Example usage in auth middleware
export function logAuthEvent(event: 'success' | 'failure', userData: any, request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  if (event === 'success') {
    securityLogger.authSuccess(
      userData.user.id,
      userData.user.email,
      ip,
      userAgent
    );
    
    auditLogger.userCreated(
      userData.user.id,
      userData.user.email,
      'system'
    );
  } else {
    securityLogger.authFailure(
      userData.email || 'unknown',
      'Invalid credentials',
      ip,
      userAgent
    );
  }
}

// Example usage in API routes
export function logApiRequest(request: Request, response: Response, userId?: string) {
  const startTime = Date.now();
  
  response.on('finish', () => {
    const duration = Date.now() - startTime;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    logger.info('API Request', {
      method: request.method,
      url: request.url,
      statusCode: response.status,
      duration,
      userId,
      ip,
      userAgent: request.headers.get('user-agent'),
    });
  });
}

// Example usage for security events
export function detectSuspiciousActivity(userId: string, activity: string, context: any) {
  const riskFactors = [
    context.unusualLocation,
    context.unusualTime,
    context.multipleFailedAttempts,
    context.rapidRequests
  ].filter(Boolean);

  if (riskFactors.length >= 2) {
    securityLogger.suspiciousActivity(
      userId,
      activity,
      { riskFactors, ...context },
      context.ip
    );
    
    // Trigger additional security measures
    logger.warn('Security alert triggered', {
      userId,
      activity,
      riskScore: riskFactors.length,
    });
  }
}

export { logger, securityLogger, auditLogger };