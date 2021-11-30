export type coordinates = {
  x: number;
  y: number;
};

export type gameMode = 'classic' | 'transcendence';

export type joinGameMessage = {
  userId: number;
  userName: string;
  gameMode: gameMode;
};

export type challengeMessage = {
  challengerId: number;
  challengerName: string;
  challengeeId: number;
  challengeeName: string;
  expiry_date: Date;
  gameMode: gameMode;
};

export type challengeExport = {
  challengerName: string;
  challengeeName: string;
  expiry_date: Date;
};
