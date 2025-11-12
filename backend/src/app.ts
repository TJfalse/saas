
/**
 * app.ts
 * Express app configuration and middleware setup.
 *
 * Routes are registered in src/routes/index.ts
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import errorMiddleware from './middlewares/error.middleware';
import logger from './config/logger';

const app = express();

// global middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

// register routes
app.use('/api/v1', routes);

// error handler (last)
app.use(errorMiddleware);

export default app;
