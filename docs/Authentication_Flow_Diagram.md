# Authentication Flow Diagram

**Alifh Platform - Better Auth Integration**  
*Complete End-to-End Sign Up & Sign In Flow*

---

## Overview

This document outlines the complete authentication flow for the Alifh platform using Better Auth v1.4.6 with Drizzle ORM and Neon PostgreSQL. The system supports email/password authentication with session management.

---

## Architecture Components

### Frontend (Next.js 16)
- **Auth Client**: `@/lib/auth-client.ts`
- **Auth Test Page**: `/auth-test`
- **API Routes**: `/api/auth/[...all]`

### Backend (Better Auth)
- **Auth Configuration**: `@/lib/auth.ts`
- **Database Adapter**: Drizzle with Neon PostgreSQL
- **Session Management**: Token-based sessions

### Database (Neon PostgreSQL)
- **User Table**: Core identity data
- **Account Table**: Credential storage
- **Session Table**: Active sessions
- **Verification Table**: Email verification tokens

---

## Sign Up Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Auth API
    participant BA as Better Auth
    participant DB as Database

    Note over U,DB: Sign Up Process
    
    U->>F: 1. Enter name, email, password
    F->>F: 2. Validate form inputs
    F->>API: 3. POST /api/auth/sign-up/email
    
    Note over API,BA: Better Auth Processing
    
    API->>BA: 4. Process sign-up request
    BA->>BA: 5. Validate email format
    BA->>BA: 6. Hash password (scrypt)
    BA->>DB: 7. Check if email exists
    
    alt Email already exists
        DB-->>BA: User found
        BA-->>API: Error: User already exists
        API-->>F: 422 - User exists
        F-->>U: Show error message
    else New user
        DB-->>BA: Email available
        
        Note over BA,DB: Create User & Account
        
        BA->>DB: 8. Insert user record
        Note right of DB: user table:<br/>id, email, emailVerified=false,<br/>name, createdAt, updatedAt
        
        BA->>DB: 9. Insert account record
        Note right of DB: account table:<br/>userId, providerId='credential',<br/>password (hashed), accountId
        
        BA->>BA: 10. Create session
        BA->>DB: 11. Insert session record
        Note right of DB: session table:<br/>userId, token, expiresAt,<br/>ipAddress, userAgent
        
        BA-->>API: Success + session data
        API-->>F: 200 - User created
        F->>F: 12. Store session in client
        F-->>U: Show success message
        F->>F: 13. Clear form inputs
    end
```

---

## Sign In Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Auth API
    participant BA as Better Auth
    participant DB as Database

    Note over U,DB: Sign In Process
    
    U->>F: 1. Enter email, password
    F->>F: 2. Validate form inputs
    F->>API: 3. POST /api/auth/sign-in/email
    
    Note over API,BA: Better Auth Processing
    
    API->>BA: 4. Process sign-in request
    BA->>DB: 5. Find user by email
    
    alt User not found
        DB-->>BA: No user found
        BA-->>API: Error: User not found
        API-->>F: 401 - Invalid credentials
        F-->>U: Show error message
    else User exists
        DB-->>BA: User found
        BA->>DB: 6. Find account with providerId='credential'
        
        alt No credential account
            DB-->>BA: No credential account
            BA-->>API: Error: Credential account not found
            API-->>F: 401 - Invalid credentials
            F-->>U: Show error message
        else Credential account exists
            DB-->>BA: Account found with hashed password
            BA->>BA: 7. Verify password (scrypt)
            
            alt Password invalid
                BA-->>API: Error: Invalid password
                API-->>F: 401 - Invalid credentials
                F-->>U: Show error message
            else Password valid
                BA->>BA: 8. Create new session
                BA->>DB: 9. Insert session record
                Note right of DB: session table:<br/>userId, token, expiresAt,<br/>ipAddress, userAgent
                
                BA-->>API: Success + session data
                API-->>F: 200 - Signed in
                F->>F: 10. Store session in client
                F-->>U: Show success message
            end
        end
    end
```

---

## Session Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Auth API
    participant BA as Better Auth
    participant DB as Database

    Note over U,DB: Session Check (useSession hook)
    
    F->>API: 1. GET /api/auth/get-session
    API->>BA: 2. Check session cookie/token
    BA->>DB: 3. Query session by token
    
    alt Session not found or expired
        DB-->>BA: No valid session
        BA-->>API: No session
        API-->>F: null session
        F->>U: Show unauthenticated state
    else Valid session
        DB-->>BA: Valid session found
        BA->>DB: 4. Query user by userId
        DB-->>BA: User data
        BA-->>API: Session + user data
        API-->>F: Complete session object
        F->>U: Show authenticated state
        
        Note over F: Session object contains:<br/>user: { id, email, name, emailVerified }<br/>session: { token, expiresAt }
    end
```

---

## Sign Out Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Auth API
    participant BA as Better Auth
    participant DB as Database

    Note over U,DB: Sign Out Process
    
    U->>F: 1. Click sign out
    F->>API: 2. POST /api/auth/sign-out
    
    API->>BA: 3. Process sign-out request
    BA->>DB: 4. Delete session record
    Note right of DB: Remove session from<br/>session table
    
    BA->>BA: 5. Clear session cookie
    BA-->>API: Success
    API-->>F: 200 - Signed out
    F->>F: 6. Clear client session state
    F->>F: 7. Clear form inputs
    F-->>U: Show success message
    F->>U: Redirect to unauthenticated state
```

---

## Database Schema

### User Table
```sql
CREATE TABLE "user" (
  "id" text PRIMARY KEY,
  "email" text UNIQUE NOT NULL,
  "emailVerified" boolean DEFAULT false,
  "name" text,
  "image" text,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  "deletedAt" timestamp
);
```

### Account Table
```sql
CREATE TABLE "account" (
  "id" text PRIMARY KEY,
  "userId" text REFERENCES "user"("id") CASCADE,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL, -- 'credential' for email/password
  "password" text, -- Hashed password for credential provider
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "expiresAt" timestamp,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);
```

### Session Table
```sql
CREATE TABLE "session" (
  "id" text PRIMARY KEY,
  "userId" text REFERENCES "user"("id") CASCADE,
  "expiresAt" timestamp NOT NULL,
  "token" text UNIQUE NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);
```

### Verification Table
```sql
CREATE TABLE "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL, -- email
  "value" text NOT NULL, -- verification token
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);
```

---

## Error Handling

### Common Error Scenarios

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| "User already exists" | 422 | Email already registered | Use sign-in instead |
| "User not found" | 401 | Email not in database | Register first |
| "Credential account not found" | 401 | No password account for user | Data integrity issue |
| "Invalid password" | 401 | Wrong password | Check credentials |
| "Session expired" | 401 | Token expired | Sign in again |

### Error Flow
```mermaid
graph TD
    A[Auth Request] --> B{Validate Input}
    B -->|Invalid| C[Return 400 - Bad Request]
    B -->|Valid| D{Check Database}
    
    D -->|User Exists - Sign Up| E[Return 422 - User Exists]
    D -->|User Missing - Sign In| F[Return 401 - Not Found]
    D -->|User Found| G{Verify Credentials}
    
    G -->|Invalid Password| H[Return 401 - Invalid]
    G -->|Valid| I[Create/Update Session]
    I --> J[Return Success]
```

---

## Security Features

### Password Security
- **Algorithm**: scrypt (OWASP recommended)
- **Storage**: Hashed in `account.password` field
- **Provider**: `credential` for email/password auth

### Session Security
- **Token**: Cryptographically secure random tokens
- **Expiry**: 7 days (configurable)
- **Storage**: Database-backed sessions
- **Cleanup**: Automatic expiry handling

### Data Protection
- **Email Uniqueness**: Enforced at database level
- **Soft Delete**: `deletedAt` field for user records
- **Cascade Delete**: Sessions/accounts removed with user

---

## Client-Side Implementation

### React Hooks
```typescript
// Get current session
const { data: session, isPending } = useSession();

// Sign up
await signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "User Name"
});

// Sign in
await signIn.email({
  email: "user@example.com", 
  password: "password123"
});

// Sign out
await signOut();
```

### Form State Management
```typescript
// Separate state for each form
const [signUpEmail, setSignUpEmail] = useState('');
const [signUpPassword, setSignUpPassword] = useState('');
const [signUpName, setSignUpName] = useState('');

const [signInEmail, setSignInEmail] = useState('');
const [signInPassword, setSignInPassword] = useState('');
```

---

## Configuration Files

### Better Auth Config (`/lib/auth.ts`)
```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification }
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  }
});
```

### Client Config (`/lib/auth-client.ts`)
```typescript
export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
});
```

---

## Testing Endpoints

### Auth Test Page (`/auth-test`)
- **Sign Up Form**: Name, Email, Password
- **Sign In Form**: Email, Password  
- **Session Display**: User details, session info
- **Sign Out**: Clear session

### API Endpoints
- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-out`
- `GET /api/auth/get-session`

---

## Environment Variables

```bash
# Better Auth
BETTER_AUTH_SECRET=/wwJSmZvMqjx08fGH1Brjiukr3wdpzvbbDi7GeI13Sk=
BETTER_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@host/database

# Client
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Future Enhancements

### Planned Features
- **Email Verification**: Account activation flow
- **Password Reset**: Forgot password functionality
- **OAuth Integration**: Google, Apple sign-in
- **Two-Factor Auth**: Additional security layer
- **Rate Limiting**: Brute force protection

### Monitoring
- **Auth Events**: Login attempts, failures
- **Session Analytics**: Duration, device tracking
- **Security Alerts**: Suspicious activity detection

---

**Last Updated**: December 11, 2025  
**Version**: 1.0  
**Better Auth Version**: 1.4.6