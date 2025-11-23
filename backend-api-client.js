/**
 * Custom Backend API Client
 * Replaces Firebase SDK with REST API and WebSocket connections
 */

class BackendAPI {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || 'http://localhost:3000/api';
    this.wsUrl = config.wsUrl || 'http://localhost:3000';
    this.socket = null;
    this.connected = false;
    this.connecting = false;
    this.connectionFailed = false; // Track if connection has failed to prevent infinite retries
    this.connectingPromise = null;
    this.listeners = new Map();
    // Generate a unique visitor ID per tab/window (not per browser)
    // Use sessionStorage to ensure each tab gets a unique ID
    // Clear any old localStorage visitorId to prevent conflicts
    if (localStorage.getItem('visitorId')) {
      localStorage.removeItem('visitorId');
      // Cleared old localStorage visitorId
    }
    
    // Generate or reuse visitorId from sessionStorage (unique per tab)
    // Each tab gets its own sessionStorage, so each tab will have a unique ID
    // If no ID exists in sessionStorage, generate a new one
    const storedId = sessionStorage.getItem('visitorId');
    if (storedId) {
      this.visitorId = storedId;
      // Reusing visitorId from sessionStorage
    } else {
      this.visitorId = this.generateVisitorId();
      sessionStorage.setItem('visitorId', this.visitorId);
      // Generated NEW visitorId for this tab
    }
  }

  generateVisitorId() {
    // Generate a truly unique ID with timestamp + high-precision random
    // Add performance.now() for microsecond precision to ensure uniqueness
    const timestamp = Date.now();
    const perf = typeof performance !== 'undefined' ? performance.now() : Math.random() * 1000;
    const random = Math.random().toString(36).substring(2, 15);
    return `visitor_${timestamp}_${perf}_${random}`;
  }

  // Initialize WebSocket connection
  connect(username = 'Anonymous') {
    if (this.socket && this.connected) {
      return Promise.resolve();
    }
    
    // Prevent multiple simultaneous connection attempts
    if (this.connecting && this.connectingPromise) {
      return this.connectingPromise;
    }
    
    // Prevent infinite retries - if we've failed before, don't try again
    if (this.connectionFailed) {
      console.warn('Previous connection failed - running in offline mode');
      return Promise.reject(new Error('Connection previously failed - offline mode'));
    }
    
    this.connecting = true;
    let timeoutCleared = false;
    let errorHandled = false;
    let timeout = null; // Declare timeout variable in outer scope

    this.connectingPromise = new Promise((resolve, reject) => {
      const handleError = (error) => {
        if (errorHandled) return;
        errorHandled = true;
        this.connecting = false;
        this.connectionFailed = true; // Mark as failed to prevent retries
        this.connectingPromise = null;
        if (this.socket) {
          this.socket.io.reconnect = false;
          this.socket.disconnect();
          this.socket = null;
        }
        if (!timeoutCleared && timeout) {
          clearTimeout(timeout);
          timeoutCleared = true;
        }
        console.warn('Backend connection failed - running in offline mode:', error.message || error);
        reject(error);
      };

      const handleSuccess = () => {
        if (errorHandled) return;
        this.connected = true;
        this.connecting = false;
        this.connectingPromise = null;
        this.connectionFailed = false; // Reset on success
        if (!timeoutCleared && timeout) {
          clearTimeout(timeout);
          timeoutCleared = true;
        }
        console.log('Backend API connected');
        resolve();
      };

      try {
        // Use Socket.io client library (loaded from CDN)
        // Configure reconnection to prevent refresh loops
        // Connecting with visitorId and username
        this.socket = io(this.wsUrl, {
          query: {
            visitorId: this.visitorId,
            username: username
          },
          reconnection: false, // DISABLED to prevent refresh loops
          reconnectionDelay: 5000,
          reconnectionDelayMax: 30000,
          reconnectionAttempts: 0, // NO retries
          timeout: 8000, // 8 second timeout
          forceNew: false,
          autoConnect: true,
          // Force polling-only for Replit (WebSockets don't work on free tier)
          transports: ['polling'], // Force polling only - more reliable on Replit
          upgrade: false, // Don't try to upgrade to websocket
          randomizationFactor: 0.5
        });

        this.socket.once('connect', handleSuccess);

        this.socket.on('disconnect', (reason) => {
          this.connected = false;
          console.log('Backend API disconnected:', reason);
          // Disable reconnection completely
          if (this.socket && this.socket.io) {
            this.socket.io.reconnect = false;
          }
        });

        this.socket.once('connect_error', (error) => {
          handleError(new Error('Connection failed: ' + (error.message || error)));
        });

        // Set up event listeners only after successful connection
        this.socket.once('connect', () => {
          this.setupSocketListeners();
        });

        // Timeout after 8 seconds - fail fast
        timeout = setTimeout(() => {
          if (!this.connected && !errorHandled) {
            handleError(new Error('Connection timeout after 8 seconds'));
          }
        }, 8000);
      } catch (error) {
        handleError(error);
      }
    });
    
    return this.connectingPromise;
  }

  setupSocketListeners() {
    // Chat messages
    this.socket.on('chat:initial', (messages) => {
      this.emit('chat:initial', messages);
    });

    this.socket.on('chat:message', (message) => {
      // Received chat:message event
      this.emit('chat:message', message);
    });

    this.socket.on('chat:reaction', (data) => {
      this.emit('chat:reaction', data);
    });

    this.socket.on('chat:typing', (users) => {
      this.emit('chat:typing', users);
    });

    this.socket.on('chat:error', (error) => {
      this.emit('chat:error', error);
    });

    // Visitors
    this.socket.on('visitors:online', (users) => {
      // Received visitors:online event
      this.emit('visitors:online', users);
    });

    this.socket.on('visitors:total', (data) => {
      // Received visitors:total event
      this.emit('visitors:total', data);
    });

    // Canvas
    this.socket.on('canvas:stroke', (data) => {
      if (data) {
        // Emit to all registered listeners
        this.emit('canvas:stroke', data);
      } else {
        console.warn('[Canvas] Received null/undefined stroke data from socket');
      }
    });

    this.socket.on('canvas:clear', (data) => {
      this.emit('canvas:clear', data);
    });

    // Canvas cursor updates
    this.socket.on('canvas:cursor', (data) => {
      this.emit('canvas:cursor', data);
    });

    this.socket.on('canvas:cursor:remove', (data) => {
      this.emit('canvas:cursor:remove', data);
    });

    // Friends
    this.socket.on('friend:added', (data) => {
      this.emit('friend:added', data);
    });

    this.socket.on('friend:removed', (data) => {
      this.emit('friend:removed', data);
    });

    this.socket.on('friend:request:received', (data) => {
      this.emit('friend:request:received', data);
    });

    this.socket.on('friend:request:sent', (data) => {
      this.emit('friend:request:sent', data);
    });
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    // Only log warnings for missing listeners (not for frequent events like visitors:online/total)
    const quietEvents = ['visitors:online', 'visitors:total', 'canvas:cursor', 'canvas:stroke', 'chat:typing'];
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      // Emitting event to listeners
      callbacks.forEach((callback, index) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[BackendAPI] Error in listener ${index + 1} for ${event}:`, error);
        }
      });
    } else if (!quietEvents.includes(event)) {
      // Only warn about missing listeners for non-quiet events
      console.warn(`[BackendAPI] No listeners registered for ${event}`);
    }
  }

  // REST API methods
  async request(endpoint, options = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Contact Messages
  async saveContactMessage(data) {
    return this.request('/contact', {
      method: 'POST',
      body: data
    });
  }

  // Chat Messages
  sendChatMessage(messageData) {
    if (!this.socket || !this.connected) {
      console.warn('Socket not connected, message not sent');
      return;
    }
    this.socket.emit('chat:send', messageData);
  }

  setTypingIndicator() {
    if (this.socket && this.connected) {
      this.socket.emit('chat:typing');
    }
  }

  stopTypingIndicator() {
    if (this.socket && this.connected) {
      this.socket.emit('chat:stop-typing');
    }
  }

  addReaction(messageId, emoji) {
    if (this.socket && this.connected) {
      this.socket.emit('chat:reaction', { messageId, emoji });
    }
  }

  // Visitors
  async getTotalVisitors() {
    return this.request('/visitors/total');
  }

  async incrementVisitors() {
    return this.request('/visitors/increment', { method: 'POST' });
  }

  async getOnlineUsers() {
    return this.request('/visitors/online');
  }

  // Moderation
  async getBannedUsers() {
    return this.request('/moderation/banned');
  }

  async isBanned(uid) {
    const result = await this.request(`/moderation/banned/${uid}`);
    return result.banned;
  }

  async getModerationSettings() {
    return this.request('/moderation/settings');
  }

  async getProfanityWords() {
    return this.request('/moderation/profanity');
  }

  async getModerationStats() {
    return this.request('/moderation/stats');
  }

  async getOnlineUsers() {
    return this.request('/visitors/online');
  }

  // Friends
  async getFriends(userId) {
    return this.request(`/friends/${userId}`);
  }

  async addFriend(userId, friendId) {
    return this.request('/friends', {
      method: 'POST',
      body: { userId, friendId }
    });
  }

  async removeFriend(userId, friendId) {
    return this.request('/friends', {
      method: 'DELETE',
      body: { userId, friendId }
    });
  }

  async getUserProfile(userId) {
    return this.request(`/friends/profile/${userId}`);
  }

  async setUserProfile(userId, profile) {
    return this.request('/friends/profile', {
      method: 'POST',
      body: { userId, profile }
    });
  }

  // Canvas
  sendCanvasStroke(id, strokeData) {
    if (this.socket && this.connected) {
      this.socket.emit('canvas:stroke', { id, strokeData });
    } else {
      console.warn('[Canvas] Cannot send stroke - socket not connected:', { socket: !!this.socket, connected: this.connected });
    }
  }

  clearCanvas(data) {
    if (this.socket && this.connected) {
      this.socket.emit('canvas:clear', data);
    }
  }

  sendCanvasCursor(userId, cursorData) {
    if (this.socket && this.connected) {
      this.socket.emit('canvas:cursor', { userId, cursorData });
    } else {
      console.warn('[Canvas Cursor] Cannot send cursor - socket not connected');
    }
  }

  sendCanvasCursorRemove(userId) {
    if (this.socket && this.connected) {
      this.socket.emit('canvas:cursor:remove', { userId });
    }
  }

  async getCanvasStrokes() {
    return this.request('/canvas/strokes');
  }

  // Firebase-compatible API (for easy migration)
  database() {
    return {
      ref: (path) => {
        return new FirebaseRef(path, this);
      }
    };
  }
}

// Firebase-compatible ref class
class FirebaseRef {
  constructor(path, api) {
    this.path = path;
    this.api = api;
    this.listeners = [];
  }

  push(data) {
    return new Promise((resolve, reject) => {
      if (this.path === 'contactMessages') {
        this.api.saveContactMessage(data).then(result => {
          resolve({ key: result.id });
        }).catch(reject);
      } else if (this.path === 'chat') {
        this.api.sendChatMessage(data);
        resolve({ key: Date.now().toString() });
      } else if (this.path === 'canvas/strokes') {
        // Generate a unique ID for the stroke
        const strokeId = `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        // Send stroke via Socket.io
        this.api.sendCanvasStroke(strokeId, data);
        resolve({ key: strokeId });
      } else {
        reject(new Error(`Unsupported path: ${this.path}`));
      }
    });
  }

  set(data) {
    return new Promise((resolve, reject) => {
      // Handle different paths
      if (this.path.startsWith('online/')) {
        const visitorId = this.path.split('/')[1];
        // Handled by socket connection
        resolve();
      } else if (this.path === 'totalVisitors') {
        this.api.request('/visitors/set', {
          method: 'POST',
          body: { count: data }
        }).then(resolve).catch(reject);
      } else if (this.path === 'canvas/meta/clear' || this.path.startsWith('canvas/meta/')) {
        // Canvas meta data (like clear flag) - just resolve
        // The actual clear is handled via canvas:clear socket event
        resolve();
      } else {
        resolve();
      }
    });
  }

  update(data) {
    // update() is similar to set() but only updates specified fields
    // For now, we'll treat it the same as set() since we don't have partial update endpoints
    return this.set(data);
  }

  once(event, callback) {
    return new Promise((resolve) => {
      if (event === 'value') {
        if (this.path === 'totalVisitors') {
          this.api.getTotalVisitors().then(result => {
            const snapshot = { val: () => result.totalVisitors };
            if (callback) callback(snapshot);
            resolve(snapshot);
          });
        } else if (this.path === '.info/connected') {
          const snapshot = { val: () => this.api.connected };
          if (callback) callback(snapshot);
          resolve(snapshot);
        } else if (this.path.startsWith('online/')) {
          const snapshot = { val: () => ({ online: true, timestamp: Date.now() }) };
          if (callback) callback(snapshot);
          resolve(snapshot);
        } else if (this.path === 'online') {
          // Get online users and convert to snapshot
          this.api.getOnlineUsers().then(users => {
            const onlineObj = {};
            if (Array.isArray(users)) {
              users.forEach(user => {
                const id = user.visitor_id || user.userId || user.visitorId;
                if (id) {
                  onlineObj[id] = {
                    online: true,
                    timestamp: user.timestamp || Date.now(),
                    username: user.username || 'Anonymous'
                  };
                }
              });
            }
            const snapshot = {
              val: () => onlineObj,
              numChildren: () => Object.keys(onlineObj).length
            };
            if (callback) callback(snapshot);
            resolve(snapshot);
          });
        } else if (this.path === 'chat') {
          // For chat, use the Socket.io initial event that was already sent
          // Return empty object for now - chat messages come through 'on' listeners
          // The initial messages are sent via 'chat:initial' event on connection
          const snapshot = { val: () => ({}) };
          if (callback) callback(snapshot);
          resolve(snapshot);
        } else if (this.path === 'canvas/strokes' || this.path === 'canvas/meta') {
          // For canvas, fetch strokes from API
          if (this.path === 'canvas/strokes') {
            this.api.getCanvasStrokes().then(strokes => {
              // Convert array to object format { id: strokeData }
              const strokesObj = {};
              if (Array.isArray(strokes)) {
                strokes.forEach(stroke => {
                  if (stroke.id) {
                    strokesObj[stroke.id] = stroke;
                  }
                });
              }
              const snapshot = { val: () => strokesObj };
              if (callback) callback(snapshot);
              resolve(snapshot);
            }).catch(err => {
              console.error('Error fetching canvas strokes:', err);
              const snapshot = { val: () => ({}) };
              if (callback) callback(snapshot);
              resolve(snapshot);
            });
          } else {
            // For meta, return empty
            const snapshot = { val: () => ({}) };
            if (callback) callback(snapshot);
            resolve(snapshot);
          }
        } else {
          const snapshot = { val: () => null };
          if (callback) callback(snapshot);
          resolve(snapshot);
        }
      } else {
        const snapshot = { val: () => null };
        if (callback) callback(snapshot);
        resolve(snapshot);
      }
    });
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    
    if (event === 'value') {
      if (this.path === 'moderationSettings') {
        this.api.getModerationSettings().then(settings => {
          callback({ val: () => settings });
        });
      } else if (this.path === 'profanityWords') {
        this.api.getProfanityWords().then(words => {
          callback({ val: () => words });
        });
      } else if (this.path === 'moderationStats') {
        this.api.getModerationStats().then(stats => {
          callback({ val: () => stats });
        });
      } else if (this.path === 'bannedUsers') {
        this.api.getBannedUsers().then(banned => {
          const bannedObj = {};
          banned.forEach(user => {
            bannedObj[user.uid] = user;
          });
          callback({ val: () => bannedObj });
        });
      } else if (this.path === 'chat') {
        this.api.on('chat:initial', (messages) => {
          const messagesObj = {};
          messages.forEach(msg => {
            messagesObj[msg.id] = msg;
          });
          callback({ val: () => messagesObj });
        });
      } else if (this.path === 'totalVisitors') {
        // Listen for real-time visitor count updates
        this.api.on('visitors:total', (data) => {
          callback({ val: () => data.totalVisitors });
        });
        // Also get initial value
        this.api.getTotalVisitors().then(result => {
          callback({ val: () => result.totalVisitors });
        });
      } else if (this.path === 'online') {
        // Listen for real-time online users updates
        this.api.on('visitors:online', (users) => {
          // Convert array to object format { userId: { online: true, username: ... } }
          const onlineObj = {};
          if (Array.isArray(users)) {
            users.forEach(user => {
              // Database returns visitor_id, but also check for userId/visitorId
              const id = user.visitor_id || user.userId || user.visitorId;
              if (id) {
                onlineObj[id] = {
                  online: true,
                  timestamp: user.timestamp || Date.now(),
                  username: user.username || 'Anonymous'
                };
              }
            });
          }
          const snapshot = { val: () => onlineObj, numChildren: () => Object.keys(onlineObj).length };
          callback(snapshot);
        });
        // Also get initial value
        this.api.getOnlineUsers().then(users => {
          const onlineObj = {};
          if (Array.isArray(users)) {
            users.forEach(user => {
              // Database returns visitor_id, but also check for userId/visitorId
              const id = user.visitor_id || user.userId || user.visitorId;
              if (id) {
                onlineObj[id] = {
                  online: true,
                  timestamp: user.timestamp || Date.now(),
                  username: user.username || 'Anonymous'
                };
              }
            });
          }
          callback({ val: () => onlineObj, numChildren: () => Object.keys(onlineObj).length });
        });
      } else if (this.path.startsWith('online/')) {
        // Single user online status
        const userId = this.path.split('/')[1];
        this.api.on('visitors:online', (users) => {
          const user = Array.isArray(users) ? users.find(u => {
            const id = u.visitor_id || u.userId || u.visitorId;
            return id === userId;
          }) : null;
          callback({ val: () => user ? { online: true, timestamp: Date.now() } : null });
        });
      } else if (this.path === 'canvas/meta/clear' || this.path.startsWith('canvas/meta/')) {
        // Listen for canvas clear events
        this.api.on('canvas:clear', (data) => {
          if (this.path === 'canvas/meta/clear') {
            callback({ val: () => data || { by: 'anon', time: Date.now() } });
          } else {
            callback({ val: () => null });
          }
        });
      } else if (this.path === 'canvas/cursors') {
        // Listen for canvas cursor updates via Socket.io
        const cursorsData = {};
        this.api.on('canvas:cursor', (data) => {
          if (data && data.userId && data.cursorData) {
            cursorsData[data.userId] = { ...data.cursorData, ...data };
            callback({ val: () => cursorsData });
          }
        });
        this.api.on('canvas:cursor:remove', (data) => {
          if (data && data.userId && cursorsData[data.userId]) {
            delete cursorsData[data.userId];
            callback({ val: () => cursorsData });
          }
        });
      } else if (this.path.startsWith('canvas/cursors/')) {
        // Single cursor update
        const userId = this.path.split('/')[2];
        this.api.on('canvas:cursor', (data) => {
          if (data && data.userId === userId) {
            callback({ val: () => ({ ...data.cursorData, ...data }) });
          }
        });
      }
    } else if (event === 'child_added') {
      if (this.path === 'chat') {
        // Listen for new chat messages (not initial - those come from once('value'))
        this.api.on('chat:message', (message) => {
          callback({ val: () => message, key: message.id });
        });
        // Also handle initial messages from chat:initial event
        let initialMessagesHandled = false;
        this.api.on('chat:initial', (messages) => {
          if (!initialMessagesHandled && Array.isArray(messages)) {
            initialMessagesHandled = true;
            messages.forEach(message => {
              callback({ val: () => message, key: message.id });
            });
          }
        });
      } else if (this.path === 'canvas/strokes') {
        // Listen for new canvas strokes via Socket.io
        // Set up listener immediately when on() is called
        const strokeListener = (data) => {
          console.log('[Canvas] child_added listener received stroke event:', data);
          if (data && data.id && data.strokeData) {
            const snapshot = { val: () => data.strokeData, key: data.id };
            console.log('[Canvas] Calling child_added callback with stroke:', data.id);
            callback(snapshot);
          } else {
            console.warn('[Canvas] Invalid stroke data in child_added callback - missing id or strokeData:', { hasId: !!data?.id, hasStrokeData: !!data?.strokeData, data });
          }
        };
        
        // Register the listener
        console.log('[Canvas] Registering canvas:stroke listener for child_added');
        this.api.on('canvas:stroke', strokeListener);
      } else if (this.path === 'online') {
        // Listen for new users coming online
        this.api.on('visitors:online', (users) => {
          if (Array.isArray(users)) {
            users.forEach(user => {
              // Database returns visitor_id, but also check for userId/visitorId
              const id = user.visitor_id || user.userId || user.visitorId;
              if (id) {
                callback({ val: () => ({ online: true, timestamp: Date.now() }), key: id });
              }
            });
          }
        });
      }
    } else if (event === 'child_removed') {
      if (this.path === 'canvas/strokes') {
        // Listen for removed canvas strokes (clear events)
        this.api.on('canvas:clear', (data) => {
          // When canvas is cleared, call the callback for each existing stroke
          // This is a simplified approach - in a real scenario, we'd need to track individual stroke removals
          callback({ val: () => null, key: null });
        });
      }
    } else if (event === 'child_changed') {
      if (this.path === 'chat') {
        this.api.on('chat:reaction', (data) => {
          callback({ val: () => ({ reactions: data.reactions }), key: data.messageId });
        });
      }
    }
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(l => l.event !== event && l.callback !== callback);
  }

  child(path) {
    // Return a new FirebaseRef with the child path
    const childPath = this.path ? `${this.path}/${path}` : path;
    return new FirebaseRef(childPath, this.api);
  }

  remove() {
    return new Promise((resolve, reject) => {
      if (this.path === 'canvas/strokes') {
        // Clear all canvas strokes
        this.api.clearCanvas({ by: this.api.visitorId || 'anon', time: Date.now() });
        resolve();
      } else if (this.path.startsWith('canvas/strokes/')) {
        // Remove a specific stroke (undo functionality)
        // For now, we'd need backend support for this
        // The stroke will be removed from other clients via child_removed if needed
        resolve();
      } else if (this.path === 'canvas/meta/clear' || this.path.startsWith('canvas/meta/')) {
        // Remove canvas meta (like clearing the clear flag)
        resolve();
      } else {
        resolve();
      }
    });
  }

  transaction(updateFn) {
    return new Promise((resolve) => {
      if (this.path.includes('reactions')) {
        // Handle reaction updates
        resolve({ committed: true, snapshot: { val: () => null } });
      } else if (this.path === 'totalVisitors') {
        this.api.incrementVisitors().then(result => {
          resolve({ committed: true, snapshot: { val: () => result.totalVisitors } });
        });
      } else {
        resolve({ committed: true, snapshot: { val: () => null } });
      }
    });
  }

  limitToLast(limit) {
    // Return self for chaining
    return this;
  }
}

// Create global instance
let backendAPI = null;

// Initialize function
function initializeBackend(config) {
  backendAPI = new BackendAPI(config);
  return backendAPI;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BackendAPI, initializeBackend };
}

