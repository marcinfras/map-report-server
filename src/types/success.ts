export interface SuccessMessages {
  AUTH: {
    REGISTER_SUCCESS: string;
    LOGIN_SUCCESS: string;
  };
  PINS: {
    PIN_CREATED: string;
    PIN_UPDATED: string;
    PIN_DELETED: string;
  };
}

export const SUCCESS: SuccessMessages = {
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
  },
  PINS: {
    PIN_CREATED: 'Pin created successfully',
    PIN_UPDATED: 'Pin updated successfully',
    PIN_DELETED: 'Pin deleted successfully',
  },
};
