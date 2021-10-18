export interface User {
  id: number;
  username: string;
  forty_two_login: string;
  avatar: string;
  two_fa_enabled: string;
  refresh_token: string;
  expiry_date: Date;
  // created_at: Date;
}