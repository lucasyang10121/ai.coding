import mongoose, { Schema, Document, Model } from 'mongoose';

// This model stores real NFL players that can be drafted.
export interface IPlayer extends Document {
  fullName: string;
  position: string;
  team: string;
  projectedValue: number;
  stats: {
    touchdowns: number;
    rushingYards: number;
    receptions: number;
    passingYards: number;
  };
  isAvailable: boolean;
  createdAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  fullName: { type: String, required: true },
  position: { type: String, required: true },
  team: { type: String, required: true },
  projectedValue: { type: Number, required: true },
  stats: {
    touchdowns: Number,
    rushingYards: Number,
    receptions: Number,
    passingYards: Number,
  },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const PlayerModel = mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);

export default PlayerModel;
