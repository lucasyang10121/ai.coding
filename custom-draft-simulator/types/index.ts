// Shared TypeScript types for the app.

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Lobby {
  _id: string;
  name: string;
  hostId: string;
  status: 'waiting' | 'active' | 'finished';
  inviteCode: string;
  settings: {
    format: string;
    practiceMode: boolean;
    botOpponents: number;
    capAmount: number;
  };
}

export interface Player {
  _id: string;
  fullName: string;
  position: string;
  team: string;
  projectedValue: number;
}
