# ATM Guard Backend API Specification

## Base URL
```
http://localhost:3001/api
```

Configure via `VITE_API_URL` environment variable in `.env` file.

---

## Authentication Endpoints

### 1. Login (Step 1)
**POST** `/auth/login`

Request:
```json
{
  "username": "string",
  "password": "string"
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "Verification code sent to your phone",
  "tempToken": "abc123xyz",
  "username": "admin",
  "email": "admin@atmguard.com",
  "deliveryMethod": "sms"
}
```

Error Response (401):
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

### 2. Verify 2FA (Step 2)
**POST** `/auth/verify-2fa`

Request:
```json
{
  "tempToken": "abc123xyz",
  "code": "123456"
}
```

Success Response (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",  // JWT token
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@atmguard.com",
    "role": "admin",
    "name": "System Administrator"
  }
}
```

Error Response (401):
```json
{
  "success": false,
  "message": "Invalid or expired verification code"
}
```

### 3. Resend 2FA Code
**POST** `/auth/resend-2fa`

Request:
```json
{
  "tempToken": "abc123xyz"
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "New verification code sent"
}
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access: dashboard, ATM control, archive, models, config, audit logs, export |
| `operator` | Dashboard, ATM control, archive, export reports |
| `security` | Dashboard, archive, dispatch security |

---

## Backend Implementation Guide

### Tech Stack Recommendations
- **Node.js** + **Express** + **TypeScript**
- **Database**: PostgreSQL or MongoDB
- **SMS**: Twilio or AWS SNS
- **Email**: SendGrid or AWS SES
- **Cache**: Redis (for OTP storage)
- **Auth**: JWT tokens

### OTP Flow
1. User enters username/password
2. Backend validates credentials
3. Generate 6-digit OTP (random, expires in 5 minutes)
4. Store OTP in Redis with tempToken as key
5. Send OTP via SMS/Email
6. User submits OTP
7. Verify OTP against Redis
8. Issue JWT token on success

### Security Considerations
- Rate limit login attempts (5 per minute)
- OTP expires in 5 minutes
- Max 3 OTP verification attempts
- HTTPS only in production
- Hash passwords with bcrypt
- JWT expires in 24 hours
