import 'express-session';

// Extend express-session types for our custom session properties

declare module 'express-session' {
  interface SessionData {
    isloggedin: boolean;
    first_name?: string | null;
    profile?: any;
    gear?: GearItem[];
    ropes?: RopeItem[];
    gearId?: number;
    ropeId?: number;
  }
}

export {};