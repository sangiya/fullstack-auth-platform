import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.NODE_ENV = "test";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // The default 10s startup watcher is too tight on this machine -- mongod
  // itself finishes initializing (confirmed via MONGOMS_DEBUG=1 logs) but
  // the "ready" log line isn't observed in time, a real first-run/disk-I/O
  // timing issue, not a broken setup.
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key]!.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
