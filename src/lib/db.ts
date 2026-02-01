import mongoose from 'mongoose'

function getMongoURI(): string {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL
  if (!uri) {
    throw new Error('MONGODB_URI または DATABASE_URL が .env.local に設定されていません')
  }
  return uri
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoURI()).then((mongoose) => {
      return mongoose
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
