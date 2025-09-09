import 'express-session';
import type { UserRole } from '../models/Profiles.js';

declare module 'express-session' {
  interface SessionData {
    user?: {
      _id: string;
      email: string;
      profile: {
        _id: string;
        fullName: string;
        role: UserRole;
        avatar?: string;
      };
    };
  }
}
