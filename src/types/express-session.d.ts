declare module 'express' {
  interface Request {
    user?: { dbUser?: DbUser };
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