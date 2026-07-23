import mongoose from 'mongoose';

// This file connects the app to MongoDB.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

let cached = globalWithMongoose.mongooseCache;

if (!cached) {
  cached = { conn: null, promise: null };
  globalWithMongoose.mongooseCache = cached;
}

async function dbConnect() {
  if (cached!.conn) {
    return cached.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default dbConnect;
