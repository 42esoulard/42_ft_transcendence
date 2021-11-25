export class JwtPayload {
  sub: number;
  username: string;
  isTwoFAauthenticated?: boolean;
}
