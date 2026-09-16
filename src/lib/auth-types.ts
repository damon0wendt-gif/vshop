/** Safe, serializable user shape that is allowed to cross to client components. */
export interface SafeUser {
  id: string;
  robloxId: string;
  username: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}
