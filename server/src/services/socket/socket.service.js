import { Server as SocketIOServer } from 'socket.io';
import { env } from '../../config/env.js';

let io = null;

// Track active online users: socketId -> { userId, role, name }
const activeUsers = new Map();

/**
 * Initializes Socket.IO with the HTTP server
 * @param {import('http').Server} httpServer
 */
export function initSocketServer(httpServer) {
  const allowedOrigins = env.CLIENT_URL.split(',').map((o) => o.trim());

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] New connection established: ${socket.id}`);

    // 1. Client identification & Room joining
    socket.on('identify', (userData) => {
      const { userId, role, name } = userData || {};
      if (!userId) return;

      activeUsers.set(socket.id, { userId, role, name, socketId: socket.id });

      // Join user personal room and role room
      socket.join(`user:${userId}`);
      if (role) {
        socket.join(`role:${role.toLowerCase()}`);
      }

      console.log(`👤 [Socket.IO] Identified user "${name}" (${role}) in rooms: user:${userId}, role:${role?.toLowerCase()}`);

      // Broadcast active count to all
      io.emit('presence:update', {
        onlineCount: activeUsers.size,
        onlineUsers: Array.from(activeUsers.values()).map(u => ({ userId: u.userId, role: u.role, name: u.name })),
      });
    });

    // 2. Consultation Live Chat Room Joining
    socket.on('consultation:join', ({ roomId, user }) => {
      if (!roomId) return;
      socket.join(`consultation:${roomId}`);
      console.log(`💬 [Socket.IO] User ${user?.name || socket.id} joined consultation:${roomId}`);
      
      socket.to(`consultation:${roomId}`).emit('consultation:peer_joined', {
        user,
        timestamp: new Date().toISOString(),
      });
    });

    // 3. Consultation Message Exchange
    socket.on('consultation:send_message', (messageData) => {
      const { roomId, message, sender } = messageData;
      if (!roomId || !message) return;

      const payload = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        roomId,
        sender,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Emit to everyone in the room (including sender)
      io.to(`consultation:${roomId}`).emit('consultation:message_received', payload);
      console.log(`📩 [Socket.IO] Consultation msg in ${roomId} from ${sender?.name}: ${message}`);
    });

    // 4. Consultation Typing Indicator
    socket.on('consultation:typing', ({ roomId, sender, isTyping }) => {
      if (!roomId) return;
      socket.to(`consultation:${roomId}`).emit('consultation:user_typing', {
        sender,
        isTyping,
      });
    });

    // 5. Real-Time Meal Logging Notification Trigger (Client-initiated or test)
    socket.on('client:meal_logged', (mealData) => {
      console.log(`🥗 [Socket.IO] Client meal_logged event received from ${socket.id}`);
      // Notify all nutritionists in real-time
      io.to('role:nutritionist').emit('activity:meal_logged', {
        ...mealData,
        receivedAt: new Date().toISOString(),
      });
    });

    // 6. Handle Disconnect
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        console.log(`❌ [Socket.IO] User disconnected: ${user.name} (${user.role})`);
        activeUsers.delete(socket.id);
        io.emit('presence:update', {
          onlineCount: activeUsers.size,
          onlineUsers: Array.from(activeUsers.values()).map(u => ({ userId: u.userId, role: u.role, name: u.name })),
        });
      } else {
        console.log(`❌ [Socket.IO] Socket disconnected: ${socket.id}`);
      }
    });
  });

  return io;
}

/**
 * Returns the active Socket.IO server instance
 */
export function getIO() {
  return io;
}

/**
 * Server-side helper to broadcast a meal logged event to nutritionists
 */
export function broadcastMealLogged(mealData) {
  if (io) {
    io.to('role:nutritionist').emit('activity:meal_logged', {
      ...mealData,
      broadcastTime: new Date().toISOString(),
    });
  }
}

