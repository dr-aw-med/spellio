export type UserRole = 'PARENT' | 'CHILD';

export type SchoolLevel = 
  | 'CP' 
  | 'CE1' 
  | 'CE2' 
  | 'CM1' 
  | 'CM2' 
  | '6EME' 
  | '5EME' 
  | '4EME' 
  | '3EME';

export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  schoolLevel: SchoolLevel;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface CreateChildProfileInput {
  name: string;
  avatar?: string | null;
  schoolLevel: SchoolLevel;
}

export interface UpdateChildProfileInput {
  name?: string;
  avatar?: string | null;
  schoolLevel?: SchoolLevel;
  isActive?: boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  activeProfileId?: string | null;
}

