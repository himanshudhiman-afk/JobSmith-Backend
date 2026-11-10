import mongoose from "mongoose";

// Prefer a local/real MongoDB instance for tests (fast, no binary download). Set
// TEST_MONGODB_URI to point elsewhere (e.g. in CI) or fall back to mongodb-memory-server
// if no local Mongo is reachable.
const TEST_URI =
  process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017/jobprep_test";

let mongod;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 3000 });
  } catch {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
