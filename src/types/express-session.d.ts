import 'express-session';

// Extend express-session types for our custom session properties

declare module 'express-session' {
  interface SessionData {
    // userId?: number; // User ID from our database
    // dbUser?: DbUser; // Added for storing DB user info
  }
}

declare module 'express' {
  interface Request {
    // user?: { dbUser?: DbUser }; // Added for storing DB user info
    user?: { dbUser?: DbUser }; // Added for storing DB user info
  }
}

type DbUser = {
  Id: number;
  Guid: string;
  FirstName: string;
  ProfilePicture: string | null;
  IsAdmin?: boolean;
};  

export {};