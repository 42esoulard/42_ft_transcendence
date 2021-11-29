export interface PlayerPositions {
  player1: number;
  player2: number;
}

export interface PlayerScores {
  player1: number;
  player2: number;
}

export interface PlayerRacquetRatios {
  player1: number;
  player2: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export type gameMode = "classic" | "transcendence";

export type userType = "player" | "spectator";

export type challengeMessage = {
  challengerId: number;
  challengerName: string;
  gameMode: gameMode;
  challengeeId: number;
  challengeeName: string;
  expiry_date: Date;
};
export type challengeExport = {
  challengerName: string;
  challengeeName: string;
  expiry_date: Date;
};
