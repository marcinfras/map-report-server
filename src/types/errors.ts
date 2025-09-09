export interface ErrorMessages {
  AUTH: {
    USER_EXISTS: string;
    INVALID_CREDENTIALS: string;
    FAILED_PROFILE_CREATION: string;
    FAILED_USER_CREATION: string;
    LOGOUT_FAILED: string;
    NOT_FOUND: string;
  };
  GENERAL: {
    INTERNAL_ERROR: string;
  };
}

export const ERRORS: ErrorMessages = {
  AUTH: {
    USER_EXISTS: 'User already exists with this email',
    INVALID_CREDENTIALS: 'Invalid email or password',
    FAILED_PROFILE_CREATION: 'Failed to create user profile',
    FAILED_USER_CREATION: 'Failed to create user account',
    LOGOUT_FAILED: 'Failed to logout',
    NOT_FOUND: 'User not found',
  },
  GENERAL: {
    INTERNAL_ERROR: 'Internal server error',
  },
};
