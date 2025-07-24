# Authentication System Documentation

This document provides an overview of the JWT authentication system implemented in this React application.

## Overview

The authentication system uses Redux for state management and JWT (JSON Web Tokens) for secure authentication with the backend. It includes:

- Token-based authentication with access and refresh tokens
- Secure token storage (access token in memory, refresh token in localStorage)
- Automatic token refresh mechanism
- Protected routes
- Axios interceptors for automatic token handling
- Error handling and redirects

## Directory Structure

```
src/
├── api/
│   ├── config.js           # API configuration with base URL
│   └── axiosInstance.js    # Configured axios instance with interceptors
├── features/
│   └── auth/
│       ├── authSlice.js    # Redux slice for auth state
│       ├── authThunks.js   # Async thunks for auth operations
│       └── authSelectors.js # Selectors for auth state
├── services/
│   └── authService.js      # Service for auth API calls
├── store/
│   └── index.js            # Redux store configuration
├── components/
│   └── PrivateRoute.jsx    # Route protection component
└── utils/
    ├── tokenUtils.js       # Utilities for token management
    ├── testAuthFlow.js     # Test utilities for authentication flow
    └── authTestScript.js   # Browser console test script
```

## Authentication Flow

1. **Login Flow**:

   - User enters credentials in Login component
   - Login component dispatches login thunk
   - Thunk calls auth service to make API request to `/auth/login/`
   - On success, access token is stored in Redux state, refresh token in localStorage
   - User is redirected to protected route

2. **API Request Flow**:

   - Component makes API request using axios instance
   - Request interceptor adds access token to Authorization header
   - If request fails with 401/403, response interceptor attempts token refresh
   - If refresh succeeds, original request is retried
   - If refresh fails, user is logged out and redirected to login

3. **Token Refresh Flow**:

   - Refresh mechanism checks token expiration before requests
   - If token is expired or about to expire, refresh thunk is dispatched
   - Refresh thunk uses refresh token to get new access token from `/auth/refresh/`
   - Redux state is updated with new access token

4. **Logout Flow**:
   - User triggers logout action
   - Logout thunk is dispatched
   - Auth state is cleared from Redux
   - Refresh token is removed from localStorage
   - User is redirected to login page

## Usage

### Protected Routes

Use the `PrivateRoute` component to protect routes that require authentication:

```jsx
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### Authentication State

Access authentication state in components using selectors:

```jsx
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUser,
} from "../features/auth/authSelectors";

function MyComponent() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // ...
}
```

### Login/Logout

Dispatch login and logout actions:

```jsx
import { useDispatch } from "react-redux";
import { login, logout } from "../features/auth/authThunks";

function LoginComponent() {
  const dispatch = useDispatch();

  const handleLogin = (credentials) => {
    dispatch(login(credentials));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // ...
}
```

## API Endpoints

The authentication system uses the following API endpoints:

- **Login**: `POST /auth/login/`

  - Request: `{ email, password }`
  - Response: `{ tokens: { access, refresh }, user: { id, email, name, ... } }`

- **Refresh Token**: `POST /auth/refresh/`

  - Request: `{ refresh: "refresh_token" }`
  - Response: `{ access: "new_access_token" }`

- **User Data**: `GET /auth/user/`

  - Response: `{ id, email, name, ... }`

- **Logout**: `POST /auth/logout/`

## Security Considerations

- Access token is stored in Redux state and persisted in storage
- Refresh token is stored in storage with proper expiration handling
- Option to use either localStorage (persistent) or sessionStorage (cleared when browser is closed)
- "Remember me" functionality in login form controls storage type
- All API requests are intercepted to add authentication headers
- Token refresh happens automatically before token expiration
- Authentication errors are handled gracefully with proper redirects
- Token validation includes expiration checking

## Testing

Two test utilities are provided to test the authentication flow:

### 1. Advanced Testing Utilities (`src/utils/testAuthFlow.js`)

This file provides comprehensive testing utilities for the authentication flow. It includes functions to test:

- Login
- Token refresh
- Protected API calls
- Logout
- Complete authentication flow

You can import these functions in your components for testing or use them programmatically.

### 2. Browser Console Testing (`src/utils/authTestScript.js`)

This file provides a simple interface for testing the authentication flow directly in the browser console. It's automatically imported in `main.jsx` and available as `authTest` in the browser console.

Usage:

```javascript
// Login with email and password
authTest.login("user@example.com", "password");

// Logout
authTest.logout();

// Refresh token
authTest.refreshToken();

// Check authentication state
authTest.checkAuth();

// Get current auth state from Redux
authTest.getState();

// Get tokens from storage
authTest.getTokens();

// Clear tokens from storage
authTest.clearTokens();

// Show help
authTest.help();
```

This makes it easy to test the authentication flow without writing any code.
