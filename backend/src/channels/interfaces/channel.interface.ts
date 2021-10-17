export class Channel {
  id: number;
  name: string;
  type: string;
  salt: string | null;
  password: string | null;
  owner_id: number;
}
