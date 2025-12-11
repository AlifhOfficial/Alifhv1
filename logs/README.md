# Logs Directory

This directory contains application logs for production environments.

## Log Files

- **app.log** - General application logs
- **error.log** - Error logs and exceptions
- **security.log** - Security events and authentication logs
- **audit.log** - Audit trail for compliance
- **exceptions.log** - Unhandled exceptions
- **rejections.log** - Unhandled promise rejections

## Security Notice

⚠️ **Important**: These log files may contain sensitive information. Ensure proper access controls and encryption in production.

## Log Rotation

In production, implement log rotation using:
- **PM2**: Built-in log rotation
- **Logrotate**: System-level log rotation
- **Cloud logging**: AWS CloudWatch, Google Cloud Logging, etc.

## Retention Policy

- **Security logs**: 2 years
- **Audit logs**: 7 years (compliance)
- **Application logs**: 90 days
- **Error logs**: 90 days