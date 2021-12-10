export declare type coordinates = {
  x: number;
  y: number;
};
export declare type gameMode = 'classic' | 'transcendence';
export declare type joinGameMessage = {
  userId: number;
  userName: string;
  gameMode: gameMode;
};
export declare type challengeMessage = {
  challengerId: number;
  challengerName: string;
  challengeeId: number;
  challengeeName: string;
  expiry_date: Date;
  gameMode: gameMode;
};
export declare type challengeExport = {
  challengerName: string;
  challengeeName: string;
  expiry_date: Date;
};
