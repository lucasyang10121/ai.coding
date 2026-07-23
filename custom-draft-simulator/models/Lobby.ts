import mongoose, { Schema, Document, Model } from 'mongoose';

// This model stores each draft lobby and its settings.
export interface ILobby extends Document {
  name: string;
  hostId: string;
  status: string;
  inviteCode: string;
  settings: {
    format: string;
    practiceMode: boolean;
    botOpponents: number;
    capAmount: number;
  };
  participants: string[];
  draftOrder: string[];
  currentPick: number;
  createdAt: Date;
  updatedAt: Date;
}

const LobbySchema = new Schema<ILobby>({
  name: { type: String, required: true },
  hostId: { type: String, required: true },
  status: { type: String, default: 'waiting' },
  inviteCode: { type: String, required: true, unique: true },
  settings: {
    format: { type: String, default: 'salary-cap' },
    practiceMode: { type: Boolean, default: false },
    botOpponents: { type: Number, default: 0 },
    capAmount: { type: Number, default: 100 },
  },
  participants: [{ type: String }],
  draftOrder: [{ type: String }],
  currentPick: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LobbyModel = mongoose.models.Lobby || mongoose.model<ILobby>('Lobby', LobbySchema);

export default LobbyModel;
