import mongoose, { Schema } from "mongoose";
import { logger } from "../utils/logger";
import { env } from "../env";

export const dbURI = env.MONGODB_URI;

const options = {
  autoIndex: true,
  minPoolSize: env.DB_MIN_POOL_SIZE,
  maxPoolSize: env.DB_MAX_POOL_SIZE,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 45000,
};

// logger.debug(dbURI);

function setRunValidators() {
  return { runValidators: true };
}

mongoose.set("strictQuery", true);

// Create the database connection
if (env.NODE_ENV !== "test") {
  mongoose
    .plugin((schema: Schema) => {
      schema.pre("findOneAndUpdate", setRunValidators);
      schema.pre("updateMany", setRunValidators);
      schema.pre("updateOne", setRunValidators);
    })
    .connect(dbURI, options)
    .then(() => {
      logger.info("Mongoose connection done");
    })
    .catch((e) => {
      logger.info("Mongoose connection error");
      logger.error(e);
    });
}

mongoose.connection.on("connected", () => {
  logger.debug("Mongoose default connection open to " + dbURI);
});

mongoose.connection.on("error", (err) => {
  logger.error("Mongoose default connection error: " + err);
});

mongoose.connection.on("disconnected", () => {
  logger.info("Mongoose default connection disconnected");
});

process.on("SIGINT", () => {
  mongoose.connection.close().finally(() => {
    logger.info("Mongoose default connection disconnected through app termination");
    process.exit(0);
  });
});

export const connection = mongoose.connection;
