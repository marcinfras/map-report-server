export interface SuccessMessages {
  AUTH: {
    REGISTER_SUCCESS: string;
    LOGIN_SUCCESS: string;
    PASSWORD_CHANGED: string;
  };
  PINS: {
    PIN_CREATED: string;
    PIN_UPDATED: string;
    PIN_DELETED: string;
  };
  PROFILE: {
    PROFILE_UPDATED: string;
  };
}

export const SUCCESS: SuccessMessages = {
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    PASSWORD_CHANGED: 'Password changed successfully',
  },
  PINS: {
    PIN_CREATED: 'Pin created successfully',
    PIN_UPDATED: 'Pin updated successfully',
    PIN_DELETED: 'Pin deleted successfully',
  },
  PROFILE: {
    PROFILE_UPDATED: 'Profile updated successfully',
  },
};
