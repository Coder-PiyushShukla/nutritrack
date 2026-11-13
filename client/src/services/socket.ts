import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

// Native Web BroadcastChannel for instant zero-latency sync between multiple browser tabs/windows
const crossTab = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('nutritrack_realtime_stream')
  : null;

// Registered event listeners for cross-tab + socket unified dispatching
const eventListeners = new Map<string, Set<Function>>();

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: {
    userId: string;
    name: string;
    role: 'dieter' | 'nutritionist' | 'admin';
  };
  message: string;
  timestamp: string;
}

export interface ActivityNotification {
  mealId?: string;
  userName: string;
  userId?: string;
  mealType: string;
  itemsCount: number;
  totalCalories: number;
  loggedAt?: string;
  receivedAt?: string;
}

function dispatchEvent(event: string, payload: any) {
  const set = eventListeners.get(event);
  if (set) {
    set.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error('Error in event listener:', err);
      }
    });
  }
}

// Listen to messages from other browser tabs
if (crossTab) {
  crossTab.onmessage = (e) => {
    const { event, payload } = e.data || {};
    if (event) {
      dispatchEvent(event, payload);
    }
  };
}

export function registerListener(event: string, callback: Function) {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event)!.add(callback);

  const s = getSocket();
  s.on(event, callback as any);

  return () => {
    eventListeners.get(event)?.delete(callback);
    s.off(event, callback as any);
  };
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO Client] Connected to server with ID:', socket?.id);
      dispatchEvent('connection:status', { connected: true, id: socket?.id });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [Socket.IO Client] Disconnected:', reason);
      dispatchEvent('connection:status', { connected: false, reason });
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [Socket.IO Client] Backend offline, cross-tab sync active:', err.message);
      dispatchEvent('connection:status', { connected: false, error: err.message });
    });

    // Mirror server socket events to all local listeners
    const mirrorEvents = [
      'consultation:message_received',
      'consultation:user_typing',
      'consultation:peer_joined',
      'activity:meal_logged',
      'presence:update',
    ];

    mirrorEvents.forEach((ev) => {
      socket?.on(ev, (data: any) => {
        dispatchEvent(ev, data);
      });
    });
  }

  return socket;
}

export function identifyUser(userData: { userId: string; role: string; name: string }) {
  const s = getSocket();
  if (s.connected) {
    s.emit('identify', userData);
  }
  if (crossTab) {
    crossTab.postMessage({ event: 'presence:update', payload: { onlineCount: 2, onlineUsers: [userData] } });
  }
}

export function joinConsultationRoom(roomId: string, user: { userId: string; role: string; name: string }) {
  const s = getSocket();
  if (s.connected) {
    s.emit('consultation:join', { roomId, user });
  }
  if (crossTab) {
    crossTab.postMessage({
      event: 'consultation:peer_joined',
      payload: { user, timestamp: new Date().toISOString() },
    });
  }
}

export function sendConsultationMessage(
  roomId: string,
  message: string,
  sender: { userId: string; name: string; role: 'dieter' | 'nutritionist' | 'admin' }
) {
  const s = getSocket();
  const payload: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    roomId,
    sender,
    message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // 1. Emit to Socket.IO Server (if connected)
  if (s.connected) {
    s.emit('consultation:send_message', { roomId, message, sender });
  }

  // 2. Broadcast to other open browser tabs/windows (cross-tab real-time sync)
  if (crossTab) {
    crossTab.postMessage({
      event: 'consultation:message_received',
      payload,
    });
  }

  // 3. Dispatch to local tab listeners
  dispatchEvent('consultation:message_received', payload);

  return payload;
}

export function sendTypingStatus(
  roomId: string,
  sender: { userId: string; name: string },
  isTyping: boolean
) {
  const s = getSocket();
  const payload = { roomId, sender, isTyping };

  if (s.connected) {
    s.emit('consultation:typing', payload);
  }

  if (crossTab) {
    crossTab.postMessage({
      event: 'consultation:user_typing',
      payload,
    });
  }
}

export function notifyMealLogged(mealData: {
  userName: string;
  mealType: string;
  itemsCount: number;
  totalCalories: number;
}) {
  const s = getSocket();
  const payload = {
    ...mealData,
    receivedAt: new Date().toISOString(),
  };

  if (s.connected) {
    s.emit('client:meal_logged', payload);
  }

  if (crossTab) {
    crossTab.postMessage({
      event: 'activity:meal_logged',
      payload,
    });
  }

  dispatchEvent('activity:meal_logged', payload);
}

export default {
  getSocket,
  registerListener,
  identifyUser,
  joinConsultationRoom,
  sendConsultationMessage,
  sendTypingStatus,
  notifyMealLogged,
};
