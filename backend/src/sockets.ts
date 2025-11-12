/**
 * sockets.ts
 * Socket.IO configuration and handlers.
 *
 * Handles WebSocket connections for real-time features like notifications,
 * live order updates, and chat functionality.
 */

import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "./config/logger";

let io: Server;

/**
 * Initialize Socket.IO
 */
export function initSockets(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Example: Join tenant room
    socket.on("join-tenant", (tenantId: string) => {
      socket.join(`tenant:${tenantId}`);
      logger.info(`Client ${socket.id} joined tenant ${tenantId}`);
    });

    // Example: Leave tenant room
    socket.on("leave-tenant", (tenantId: string) => {
      socket.leave(`tenant:${tenantId}`);
      logger.info(`Client ${socket.id} left tenant ${tenantId}`);
    });

    // Order update events
    socket.on("order:created", (orderData) => {
      const { tenantId } = orderData;
      io.to(`tenant:${tenantId}`).emit("order:new", orderData);
    });

    socket.on("order:updated", (orderData) => {
      const { tenantId } = orderData;
      io.to(`tenant:${tenantId}`).emit("order:update", orderData);
    });

    // Disconnect
    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  logger.info("Socket.IO initialized");
  return io;
}

/**
 * Emit event to specific tenant
 */
export function emitToTenant(tenantId: string, event: string, data: any) {
  if (io) {
    io.to(`tenant:${tenantId}`).emit(event, data);
  }
}

/**
 * Emit event to specific user
 */
export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Get Socket.IO instance
 */
export function getIO() {
  return io;
}
