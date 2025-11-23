# SHS Game Hall - Custom Backend

This is a custom backend server that replaces Firebase functionality with a Node.js/Express/Socket.io solution.

## Features

- ✅ REST API for all data operations
- ✅ Real-time WebSocket support (Socket.io)
- ✅ SQLite database (no external dependencies)
- ✅ Contact form message storage
- ✅ Real-time chat system
- ✅ Online user tracking
- ✅ Visitor counter
- ✅ Moderation system (banned users, profanity filter)
- ✅ Friends system
- ✅ Canvas/drawing support
- ✅ Typing indicators

## Installation

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
DB_PATH=./data/database.db
```

### Step 3: Initialize Database

```bash
npm run init-db
```

This will create the SQLite database and all necessary tables.

### Step 4: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Contact Messages
- `POST /api/contact` - Create a new contact message
- `GET /api/contact` - Get all contact messages
- `GET /api/contact/:id` - Get a specific message

### Visitors
- `GET /api/visitors/total` - Get total visitor count
- `POST /api/visitors/increment` - Increment visitor count
- `GET /api/visitors/online` - Get online users

### Moderation
- `GET /api/moderation/banned` - Get all banned users
- `POST /api/moderation/banned` - Ban a user
- `DELETE /api/moderation/banned/:uid` - Unban a user
- `GET /api/moderation/settings` - Get moderation settings
- `GET /api/moderation/profanity` - Get profanity words
- `GET /api/moderation/stats` - Get moderation statistics

### Friends
- `GET /api/friends/:userId` - Get user's friends
- `POST /api/friends` - Add a friend
- `DELETE /api/friends` - Remove a friend

### Canvas
- `GET /api/canvas/strokes` - Get all canvas strokes
- `POST /api/canvas/strokes` - Add a canvas stroke
- `DELETE /api/canvas/strokes` - Clear canvas

## WebSocket Events

### Client → Server
- `chat:send` - Send a chat message
- `chat:typing` - User is typing
- `chat:stop-typing` - User stopped typing
- `chat:reaction` - Add reaction to message
- `canvas:stroke` - Send canvas stroke
- `canvas:clear` - Clear canvas

### Server → Client
- `chat:initial` - Initial chat messages
- `chat:message` - New chat message
- `chat:reaction` - Message reaction updated
- `chat:typing` - Typing users list
- `visitors:online` - Online users list
- `visitors:total` - Total visitor count
- `canvas:stroke` - New canvas stroke
- `canvas:clear` - Canvas cleared

## Database Schema

The database uses SQLite and includes the following tables:

- `contact_messages` - Contact form submissions
- `chat_messages` - Chat messages
- `online_users` - Currently online users
- `visitor_stats` - Visitor statistics
- `banned_users` - Banned user list
- `moderation_settings` - Moderation configuration
- `profanity_words` - Profanity filter words
- `moderation_stats` - Moderation statistics
- `friends` - User friendships
- `user_profiles` - User profile data
- `canvas_strokes` - Canvas drawing strokes
- `typing_indicators` - Current typing users

## Viewing Contact Messages

Contact messages are stored in the SQLite database. You can view them using:

1. **SQLite CLI:**
   ```bash
   sqlite3 backend/data/database.db
   SELECT * FROM contact_messages ORDER BY timestamp DESC;
   ```

2. **Database Browser Tool:**
   - Download [DB Browser for SQLite](https://sqlitebrowser.org/)
   - Open `backend/data/database.db`
   - Browse the `contact_messages` table

3. **API Endpoint:**
   ```bash
   curl http://localhost:3000/api/contact
   ```

## Production Deployment

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start server.js --name shs-backend
pm2 save
pm2 startup
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t shs-backend .
docker run -p 3000:3000 shs-backend
```

## Troubleshooting

### Port Already in Use
Change the PORT in `.env` file or kill the process using the port:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Database Locked
Make sure only one instance of the server is running.

### CORS Issues
Update `CORS_ORIGIN` in `.env` to match your frontend URL.

## Security Notes

- This is a basic implementation. For production, consider:
  - Adding authentication/authorization
  - Rate limiting
  - Input validation and sanitization
  - HTTPS/SSL
  - Database backups
  - Environment variable security

## Support

For issues or questions, check the main project documentation or contact support.

