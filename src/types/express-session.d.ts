declare global {
  namespace Express {
    interface Request {
      user?: { dbUser?: DbUser };
    }
  }
}

type DbUser = {
  Id: number;
  Guid: string;
  FirstName: string;
  ProfilePicture: string | null;
  IsAdmin?: boolean;
  IsNewUser: boolean;
};

export { };