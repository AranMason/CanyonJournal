import 'express-session';

// Extend express-session types for our custom session properties

declare module 'express-session' {
  interface SessionData {
    userId?: number; // User ID from our database
    dbUser?: DbUser; // Added for storing DB user info
  }
}

type DbUser = {
  Id: number;
  Guid: string;
  FirstName: string;
  ProfilePicture: string | null;
};  

export {};