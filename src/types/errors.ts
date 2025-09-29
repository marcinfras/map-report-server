export interface ErrorMessages {
  AUTH: {
    USER_EXISTS: string;
    INVALID_CREDENTIALS: string;
    FAILED_PROFILE_CREATION: string;
    FAILED_USER_CREATION: string;
    LOGOUT_FAILED: string;
    NOT_FOUND: string;
    NOT_AUTHENTICATED: string;
    FORBIDDEN: string;
  };
  PINS: {
    FAILED_PIN_CREATION: string;
    INVALID_PIN_TYPE: string;
    NOT_FOUND: string;
    FAILED_IMAGE_UPLOAD: string;
    FAILED_PIN_DELETE: string;
  };
  GENERAL: {
    INTERNAL_ERROR: string;
  };
  MULTER: {
    FILE_TOO_LARGE: string;
    INVALID_FILE_TYPE: string;
    LIMIT_UNEXPECTED_FILE: string;
    UPLOAD_ERROR: string;
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
    NOT_AUTHENTICATED: 'User not authenticated',
    FORBIDDEN: 'You do not have permission to perform this action',
  },
  PINS: {
    FAILED_PIN_CREATION: 'Failed to create pin',
    INVALID_PIN_TYPE: 'Invalid pin type',
    NOT_FOUND: 'Pin not found',
    FAILED_IMAGE_UPLOAD: 'Failed to upload image',
    FAILED_PIN_DELETE: 'Failed to delete pin',
  },
  GENERAL: {
    INTERNAL_ERROR: 'Internal server error',
  },
  MULTER: {
    FILE_TOO_LARGE: 'File size too large (max 5MB)',
    INVALID_FILE_TYPE: 'Only image files are allowed',
    LIMIT_UNEXPECTED_FILE: 'Too many files uploaded',
    UPLOAD_ERROR: 'File upload error',
  },
};
