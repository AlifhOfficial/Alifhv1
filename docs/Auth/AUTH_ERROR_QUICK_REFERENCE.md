# Quick Reference: Auth Error System

## Adding a New Error Code

**File:** `/apps/web/src/lib/auth/errors.ts`

```typescript
your_error_code: {
  title: "Error Title",
  message: "User-friendly explanation of what happened and what to do next.",
  action: "SIGN_IN" | "SIGN_UP" | "RETRY" | "CONTACT_SUPPORT" | "CLOSE",
  actionLabel: "Button Text",
}
```

---

## Testing an Error

### Method 1: Trigger Real Error
Try to reproduce the actual error condition (e.g., wrong password, expired link).

### Method 2: Direct URL
Navigate to: `/auth/error?error=your_error_code`

### Method 3: Programmatic
```typescript
const errorInfo = getAuthErrorInfo("your_error_code");
actions.setAuthErrorInfo(errorInfo);
actions.setCurrentModal("auth-error");
```

---

## Common Error Codes

| Code | When It Happens | Action |
|------|----------------|--------|
| `account_not_linked` | OAuth email already registered | SIGN_IN |
| `invalid_credentials` | Wrong email/password | RETRY |
| `invalid_callback` | OAuth callback failed | RETRY |
| `state_mismatch` | OAuth state expired | RETRY |
| `session_expired` | Session timed out | SIGN_IN |
| `email_not_verified` | Unverified email tried to sign in | CLOSE |
| `user_not_found` | Account doesn't exist | SIGN_UP |
| `rate_limit_exceeded` | Too many attempts | CLOSE |

---

## Action Types Behavior

| Action | What Happens |
|--------|-------------|
| `SIGN_IN` | Opens sign-in modal |
| `SIGN_UP` | Opens sign-up modal |
| `RETRY` | Returns to sign-in modal |
| `CONTACT_SUPPORT` | Navigates to `/contact` |
| `CLOSE` | Closes modal and returns to home |

---

## How Errors Flow

### OAuth/Redirect Errors:
```
Better Auth Error
    ↓
Redirects to /auth/error?error=code
    ↓
Page reads error param
    ↓
Opens AuthErrorModal
    ↓
User clicks action button
    ↓
Handled by handleErrorAction()
```

### Form-Based Errors:
```
Auth operation fails
    ↓
Flow controller catches error
    ↓
parseAuthError() extracts message
    ↓
getAuthErrorInfo() maps to modal content
    ↓
Opens AuthErrorModal
    ↓
User clicks action button
    ↓
Handled by handleErrorAction()
```

---

## Key Functions

### `getAuthErrorInfo(errorCode: string): AuthErrorInfo`
Maps error code to modal content. Falls back to patterns if exact match not found.

### `parseAuthError(error: any): string | null`
Extracts error message from Better Auth response.

### `handleErrorAction(action: AuthErrorAction): void`
Handles what happens when user clicks modal action button.

---

## Debugging

### Enable Better Auth Debug:
Add to `.env.local`:
```
BETTER_AUTH_DEBUG=true
```

### Check Error in Console:
Flow controller logs all errors:
```javascript
console.error("[AuthFlowController] Flow error", error);
```

### Test All Errors:
Create a test page that shows all error states:
```typescript
Object.keys(AUTH_ERROR_MAP).forEach(code => {
  console.log(`Test: /auth/error?error=${code}`);
});
```

---

## Important Notes

⚠️ **Don't use Better Auth's default error page URL** (`/api/auth/error`)  
✅ Always use `/auth/error` (your custom page)

⚠️ **Don't show raw error messages to users**  
✅ Always map through `getAuthErrorInfo()`

⚠️ **Don't forget to clear error state**  
✅ Call `actions.setAuthErrorInfo(null)` when closing

⚠️ **Don't skip the action handler**  
✅ Implement `handleErrorAction()` for all new actions
