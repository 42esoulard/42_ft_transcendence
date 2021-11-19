export type coordinates = {
  x: number,
  y: number
}

export type gameMode = 'classic' | 'transcendence'

export type joinGameMessage = {userId: number, userName: string, gameMode: gameMode}