# Next-Auth Implementation PRD: Gmail Authentication

## Overview

This document outlines the implementation plan for adding user authentication to the MyHRBuddy application using Next-Auth with Gmail as the authentication provider. The implementation will be based on the existing auth setup from the FinchCRM project.

## Objectives

1. Implement secure user authentication using Next-Auth
2. Enable Gmail authentication for login
3. Restrict access to the application to authorized users
4. Create a clean, simple login interface
5. Integrate with the existing MyHRBuddy application architecture

## Key Components

### 1. Authentication Provider

- **Gmail/Google Authentication**: Allow users to sign in with their Gmail accounts
- **Authorization**: Restrict access to appropriate HR personnel

### 2. Login Interface

- **Simple, Clean Design**: Minimalist login page with Google sign-in button
- **Error Handling**: Clear messaging for authentication errors
- **Loading States**: Visual feedback during authentication process

### 3. Protected Routes

- **Route Protection**: Prevent unauthorized access to application routes
- **Authentication State**: Maintain and verify authentication state
- **Session Management**: Handle user sessions securely

## Implementation Plan

### Phase 1: Setup and Configuration

1. **Update Dependencies**
   - Add Next-Auth 5.0 and related packages
   - Configure Google provider

2. **Create Auth Configuration**
   - Set up auth.ts configuration file
   - Configure Google authentication provider
   - Set up callbacks and event handlers

3. **Set Required Environment Variables**
   - Add Google OAuth credentials
   - Configure Next-Auth secret
   - Set authorized domain(s)

### Phase 2: Login Interface

1. **Create Login Page**
   - Design and implement login UI
   - Add Google sign-in button
   - Implement error handling

2. **Style Login Components**
   - Apply consistent styling with application theme
   - Ensure responsive design
   - Implement loading states

### Phase 3: Route Protection

1. **Implement Middleware**
   - Create middleware for route protection
   - Configure public and protected routes
   - Handle redirect logic for unauthenticated users

2. **Session Management**
   - Configure session strategy (JWT)
   - Implement session expiration and renewal
   - Add session data to user context

### Phase 4: Integration

1. **User Profile**
   - Extract and store relevant user information
   - Display user profile in application
   - Handle user logout

2. **Authorization Logic**
   - Implement role-based access control (if needed)
   - Restrict features based on user permissions
   - Validate user email domains (if required)

## Technical Specifications

### Dependencies

```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.25",
    "@auth/prisma-adapter": "^2.8.0"
  }
}
```

### Auth Configuration

The auth.ts file will include:

- Google provider configuration
- Prisma adapter integration
- JWT session strategy
- Callbacks for session and JWT handling
- Custom pages configuration

### Environment Variables

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret
```

### Database Integration

- Use Prisma adapter to store sessions and user data in the Neon PostgreSQL database
- Add user-related models to the Prisma schema

## Implementation Details

### Auth Configuration File (auth.ts)

The core configuration file will be based on the existing implementation in the FinchCRM project, with adjustments for the MyHRBuddy application. Key components include:

1. **Provider Configuration**: Set up Google authentication provider
2. **Prisma Adapter**: Connect Next-Auth to the Neon PostgreSQL database
3. **Callbacks**: Customize JWT and session handling
4. **Events**: Handle auth events like sign-in and session updates

### Login Page (/app/login/page.tsx)

A simple login page that:
- Displays the application logo/name
- Provides a "Sign in with Google" button
- Shows appropriate loading states and error messages
- Redirects to the dashboard upon successful authentication

### Middleware (middleware.ts)

Middleware to:
- Check authentication state for protected routes
- Redirect unauthenticated users to the login page
- Allow access to public routes without authentication
- Handle API routes authentication

### User Context (optional)

A context provider to:
- Provide user data to components throughout the application
- Handle authentication state changes
- Provide utility functions for auth-related operations

## Reference Implementation

The implementation will be based on the existing auth setup from the FinchCRM project, with specific adjustments for the MyHRBuddy application. Key files to reference:

- `/Users/fredcaseyhousand/crm-tool/finch-crm/src/lib/auth.ts`
- `/Users/fredcaseyhousand/crm-tool/finch-crm/src/middleware.ts`
- `/Users/fredcaseyhousand/crm-tool/finch-crm/src/app/login/page.tsx`

## Resources and References

- [Next-Auth Documentation](https://next-auth.js.org/getting-started/introduction)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Adapter Documentation](https://authjs.dev/reference/adapter/prisma)
- [Next.js App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)