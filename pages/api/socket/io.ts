import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

import { NextApiResponseServerIO } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  try {
    if (!res.socket?.server) {
      res.status(500).end();
      return;
    }

    if (!res.socket.server.io) {
      const path = "/api/socket/io";
      const httpServer: NetServer = res.socket.server as any;
      const io = new ServerIO(httpServer, {
        path: path,
        addTrailingSlash: false,
        transports: ["websocket", "polling"],
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      // Store voice channel participants per server
      const voiceChannels: Record<string, Record<string, any[]>> = {};

      io.on("connection", (socket) => {
        socket.on("ping-check", (callback: () => void) => {
          if (typeof callback === "function") {
            callback();
          }
        });

        // Voice channel events
        socket.on("voice:join-server", (serverId: string) => {
          socket.join(`voice:${serverId}`);
          // Send current voice state
          if (voiceChannels[serverId]) {
            socket.emit(`voice:${serverId}:update`, voiceChannels[serverId]);
          }
        });

        socket.on("voice:leave-server", (serverId: string) => {
          socket.leave(`voice:${serverId}`);
        });

        socket.on("voice:join-channel", ({ serverId, channelId, participant }) => {
          if (!voiceChannels[serverId]) {
            voiceChannels[serverId] = {};
          }
          if (!voiceChannels[serverId][channelId]) {
            voiceChannels[serverId][channelId] = [];
          }
          
          // Check if already in channel
          const exists = voiceChannels[serverId][channelId].find(
            (p) => p.odId === participant.odId
          );
          
          if (!exists) {
            voiceChannels[serverId][channelId].push(participant);
            io.to(`voice:${serverId}`).emit(`voice:${serverId}:participant-join`, {
              channelId,
              participant,
            });
          }
        });

        socket.on("voice:leave-channel", ({ serverId, channelId, odId }) => {
          if (voiceChannels[serverId]?.[channelId]) {
            voiceChannels[serverId][channelId] = voiceChannels[serverId][channelId].filter(
              (p) => p.odId !== odId
            );
            io.to(`voice:${serverId}`).emit(`voice:${serverId}:participant-leave`, {
              channelId,
              odId,
            });
          }
        });

        socket.on("error", (error) => {
          console.error("[Socket Error]", error);
        });

        socket.on("disconnect", () => {
          // Clean up voice channels when user disconnects
          // This is a simplified version - in production you'd track socket -> user mapping
        });
      });

      io.engine.on("connection_error", (err) => {
        console.error("[Socket Connection Error]", err.message);
      });

      res.socket.server.io = io;
    }
    res.end();
  } catch (error) {
    console.error("[Socket IO Handler Error]", error);
    res.status(500).end();
  }
};

export default ioHandler;
