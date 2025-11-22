/**
 * app.ts
 * Express app configuration and middleware setup.
 *
 * Routes are registered in src/routes/index.ts
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import errorMiddleware from "./middlewares/error.middleware";
import logger from "./config/logger";
import { corsOptions } from "./config/cors.config";

const app = express();

// global middlewares
// Configure helmet to skip redundant/legacy headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Let browser defaults apply, not needed for API
    xssFilter: false, // Modern browsers have XSS protection built-in,
  })
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// register routes
app.use("/api/v1", routes);

// error handler (last)
app.use(errorMiddleware);

export default app;
