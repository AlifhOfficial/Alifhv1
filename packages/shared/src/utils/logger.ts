import winston from 'winston';

// Define log levels for security and compliance
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  security: 3,
  audit: 4,
  debug: 5,
};

// Define colors for log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  security: 'magenta',
  audit: 'cyan',
  debug: 'white',
};

// Custom format for security and audit logs
const securityFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta,
      environment: process.env.NODE_ENV || 'development',
      service: meta.service || 'alifh-platform',
    });
  })
);

// Development format with colors
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ colors: logColors }),
  winston.format.printf(({ timestamp, level, message, service, userId, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    const serviceString = service ? `[${service}]` : '';
    const userString = userId ? `[user:${userId}]` : '';
    
    return `${timestamp} ${level} ${serviceString}${userString} ${message} ${metaString}`;
  })
);

// Create the logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? securityFormat : developmentFormat,
  defaultMeta: {
    service: 'alifh-platform',
    version: process.env.npm_package_version || '0.1.0',
  },
  transports: [
    // Console output for all environments
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
    
    // File transports for production
    ...(process.env.NODE_ENV === 'production' ? [
      // General application logs
      new winston.transports.File({
        filename: 'logs/app.log',
        level: 'info',
      }),
      
      // Error logs
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      
      // Security and audit logs
      new winston.transports.File({
        filename: 'logs/security.log',
        level: 'security',
        format: securityFormat,
      }),
      
      // Audit trail logs
      new winston.transports.File({
        filename: 'logs/audit.log',
        level: 'audit',
        format: securityFormat,
      }),
    ] : []),
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: process.env.NODE_ENV === 'production' ? [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ] : [],
  
  rejectionHandlers: process.env.NODE_ENV === 'production' ? [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ] : [],
});

// Add custom log levels to winston
winston.addColors(logColors);

// Security logging helper functions
export const securityLogger = {
  // Authentication events
  authSuccess: (userId: string, email: string, ip?: string, userAgent?: string) => {
    logger.log('security', 'Authentication successful', {
      userId,
      email,
      ip,
      userAgent,
      event: 'AUTH_SUCCESS',
      risk: 'low',
    });
  },

  authFailure: (email: string, reason: string, ip?: string, userAgent?: string) => {
    logger.log('security', 'Authentication failed', {
      email,
      reason,
      ip,
      userAgent,
      event: 'AUTH_FAILURE',
      risk: 'medium',
    });
  },

  passwordReset: (email: string, ip?: string) => {
    logger.log('security', 'Password reset requested', {
      email,
      ip,
      event: 'PASSWORD_RESET',
      risk: 'medium',
    });
  },

  suspiciousActivity: (userId: string, activity: string, details: Record<string, any>, ip?: string) => {
    logger.log('security', 'Suspicious activity detected', {
      userId,
      activity,
      details,
      ip,
      event: 'SUSPICIOUS_ACTIVITY',
      risk: 'high',
    });
  },

  // Data access events
  dataAccess: (userId: string, resource: string, action: string, resourceId?: string) => {
    logger.log('audit', 'Data access event', {
      userId,
      resource,
      action,
      resourceId,
      event: 'DATA_ACCESS',
    });
  },

  // Administrative actions
  adminAction: (adminId: string, action: string, targetUserId?: string, details?: Record<string, any>) => {
    logger.log('audit', 'Administrative action performed', {
      adminId,
      action,
      targetUserId,
      details,
      event: 'ADMIN_ACTION',
      risk: 'medium',
    });
  },

  // Rate limiting events
  rateLimitExceeded: (ip: string, endpoint: string, limit: number) => {
    logger.log('security', 'Rate limit exceeded', {
      ip,
      endpoint,
      limit,
      event: 'RATE_LIMIT_EXCEEDED',
      risk: 'medium',
    });
  },
};

// Audit logging helper functions
export const auditLogger = {
  // User lifecycle events
  userCreated: (userId: string, email: string, createdBy?: string) => {
    logger.log('audit', 'User account created', {
      userId,
      email,
      createdBy,
      event: 'USER_CREATED',
    });
  },

  userUpdated: (userId: string, updatedFields: string[], updatedBy: string) => {
    logger.log('audit', 'User account updated', {
      userId,
      updatedFields,
      updatedBy,
      event: 'USER_UPDATED',
    });
  },

  userDeleted: (userId: string, deletedBy: string, reason?: string) => {
    logger.log('audit', 'User account deleted', {
      userId,
      deletedBy,
      reason,
      event: 'USER_DELETED',
    });
  },

  // Permission changes
  permissionGranted: (userId: string, permission: string, grantedBy: string) => {
    logger.log('audit', 'Permission granted to user', {
      userId,
      permission,
      grantedBy,
      event: 'PERMISSION_GRANTED',
    });
  },

  permissionRevoked: (userId: string, permission: string, revokedBy: string) => {
    logger.log('audit', 'Permission revoked from user', {
      userId,
      permission,
      revokedBy,
      event: 'PERMISSION_REVOKED',
    });
  },

  // System configuration changes
  configChanged: (setting: string, oldValue: any, newValue: any, changedBy: string) => {
    logger.log('audit', 'System configuration changed', {
      setting,
      oldValue,
      newValue,
      changedBy,
      event: 'CONFIG_CHANGED',
    });
  },
};

// Application logging helper functions
export const appLogger = {
  // API requests
  apiRequest: (method: string, endpoint: string, userId?: string, ip?: string, responseTime?: number) => {
    logger.info('API request processed', {
      method,
      endpoint,
      userId,
      ip,
      responseTime,
      event: 'API_REQUEST',
    });
  },

  // Database operations
  dbOperation: (operation: string, table: string, userId?: string, affectedRows?: number) => {
    logger.info('Database operation performed', {
      operation,
      table,
      userId,
      affectedRows,
      event: 'DB_OPERATION',
    });
  },

  // Performance monitoring
  performance: (operation: string, duration: number, details?: Record<string, any>) => {
    logger.info('Performance metric recorded', {
      operation,
      duration,
      details,
      event: 'PERFORMANCE',
    });
  },

  // Error tracking
  error: (error: Error, context?: Record<string, any>, userId?: string) => {
    logger.error('Application error occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      userId,
      event: 'APPLICATION_ERROR',
    });
  },
};

// Export the main logger and helpers
export { logger };
export default logger;