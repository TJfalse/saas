/**
 * server.ts
 * App bootstrap: starts Express, Socket.IO and connects to queues.
 *
 * This is the first file you should open when understanding the flow.
 * It wires up app.ts (express) and queues/worker bootstrapping.
 */

import { createServer } from "http";
import app from "./app";
import { initSockets } from "./sockets";
import { initQueues } from "./queues/queue.config";
import logger from "./config/logger";

const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);

// init websockets
initSockets(httpServer);

// TODO: Re-enable queues when Redis is ready
// init queues (connect to redis)
// initQueues().catch(err => {
//   logger.error('Queue init failed', err);
//   process.exit(1);
// });

httpServer.listen(PORT, () => {
  logger.info(`API server listening on port ${PORT}`);
});
