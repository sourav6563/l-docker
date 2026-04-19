import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { logger } from "./utils/logger";
import { env } from "./env";
import "./database/db";
import healthCheckRouter from "./routes/healthcheck.route";
import { errorHandler } from "./middlewares/errorhandler.middleware";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import videoRouter from "./routes/video.route";
import likeRouter from "./routes/like.route";
import commentRouter from "./routes/comment.route";
import playlistRouter from "./routes/playlist.route";
import dashboardRouter from "./routes/dashboard.route";
import communityPostRouter from "./routes/communityPost.route";
import followerRouter from "./routes/follower.route";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import swaggerRouter from "./swagger";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, //
  message: "Too many requests , please try again later.",
});
app.use("/api", limiter);
app.use(helmet());

const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  }),
);
//common middleware

app.use(express.static("public"));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cookieParser());
app.use("/health", healthCheckRouter);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/communitypost", communityPostRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/follower", followerRouter);
app.use("/api/v1/docs", swaggerRouter);

app.use(errorHandler);
export { app };
