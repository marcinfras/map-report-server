import 'express-session';
import { UserRole } from '@models/Profiles/types.js';

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
