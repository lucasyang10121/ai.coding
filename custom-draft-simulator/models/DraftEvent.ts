import mongoose, { Schema, Document } from 'mongoose';

// This model keeps a record of draft actions.
export interface IDraftEvent extends Document {
  lobbyId: string;
  userId: string;
  type: string;
  playerId: string;
  amount: number;
  message: string;
  createdAt: Date;
}

const DraftEventSchema = new Schema<IDraftEvent>({
  lobbyId: { type: String, required: true },
  userId: { type: String, required: true },
  type: { type: String, required: true },
  playerId: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const DraftEventModel = mongoose.models.DraftEvent || mongoose.model<IDraftEvent>('DraftEvent', DraftEventSchema);

export default DraftEventModel;
