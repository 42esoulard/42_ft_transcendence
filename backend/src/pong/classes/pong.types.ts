export type coordinates = {
  x: number,
  y: number
}

export type gameMode = 'classic' | 'transcendence'

export type joinGameMessage = {userId: number, userName: string, gameMode: gameMode}

export type challengeMessage = {challengerId: number, challengerName: string, gameMode: gameMode, challengeeId: number, challengeeName: string}