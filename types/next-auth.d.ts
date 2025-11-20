import 'next-auth';
import { UserRole } from './user';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: UserRole;
      activeProfileId?: string | null;
    };
  }

  interface User {
    role: UserRole;
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    id: string;
    activeProfileId?: string | null;
  }
}

