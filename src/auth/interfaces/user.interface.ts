export interface AuthUser {
  userId: string;
  email: string;
  farmIds: string[];
  defaultFarmId: string | null;
  roles: string[];
}

export interface RequestWithUser extends Request {
  user: AuthUser;
}
