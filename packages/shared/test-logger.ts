import { logger, securityLogger, auditLogger } from './src';

// Test basic logging
logger.info('Logger test initialized', { 
  test: 'basic_functionality',
  timestamp: new Date().toISOString()
});

// Test security logging
securityLogger.authSuccess(
  'test-user-123',
  'test@example.com',
  '192.168.1.1',
  'Mozilla/5.0 Test Browser'
);

// Test audit logging
auditLogger.userCreated(
  'test-user-123',
  'test@example.com',
  'system'
);

console.log('✅ Logger test completed successfully');
console.log('📝 Check the logs above for proper formatting');