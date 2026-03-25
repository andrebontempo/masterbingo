require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Admin = require('./models/User');

// ─── Passport Google Strategy ─────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${(process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '')}/api/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let admin = await Admin.findOne({ googleId: profile.id });
      if (!admin) {
        admin = await Admin.findOne({ email: profile.emails[0].value });
      }
      if (admin) {
        if (!admin.googleId) { admin.googleId = profile.id; await admin.save(); }
        return done(null, admin);
      }
      // Create new account via Google
      admin = await Admin.create({
        firstName: profile.name.givenName || '',
        lastName: profile.name.familyName || '',
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value || '',
        authProvider: 'google',
      });
      return done(null, admin);
    } catch (err) {
      return done(err, null);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await Admin.findById(id)); } catch (e) { done(e, null); }
});

const app = express();
const server = http.createServer(app);

// Configures Socket.io for Real-time bingo events
const io = new Server(server, {
  cors: {
    origin: ['https://masterbingo.com.br', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: ['https://masterbingo.com.br', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize()); // Google OAuth (stateless JWT)

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bingo-v2')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));

// Main Root Endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', msg: 'Bingo V2 API is running!' }));

// --- WebSockets Logic ---
io.on('connection', (socket) => {
  console.log('Participant connected:', socket.id);

  // Player/Admin joins a specific game/room
  socket.on('join_room', (data) => {
    if (!data) return;
    const roomId = typeof data === 'string' ? data : data.roomId;
    if (!roomId) return;
    const name = typeof data === 'string' ? null : data.playerName;
    socket.join(roomId);
    if (name) {
      io.to(roomId).emit('player_joined', { name, id: socket.id });
    }
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Admin draws a number and broadcasts to room
  socket.on('draw_number', (data) => {
    // data expected: { roomId, number, letter }
    io.to(data.roomId).emit('number_drawn', data);
  });

  // Universal Event for Achievements (Bingo, Linha, Coluna, Diagonal, Extremidades)
  socket.on('special_called', async (data) => {
    let msgText = '';
    let msgType = 'system-' + data.type;
    const nameStr = data.playerName.toUpperCase();
    
    if (data.type === 'bingo') msgText = `🏆 BINGO! ${nameStr} GRITOU BINGO!`;
    else if (data.type === 'linha') msgText = `⚡ LINHA! ${nameStr} FEZ LINHA!`;
    else if (data.type === 'coluna') msgText = `🎯 COLUNA! ${nameStr} PREENCHEU UMA COLUNA!`;
    else if (data.type === 'diagonal') msgText = `⚔️ DIAGONAL! ${nameStr} FEZ DIAGONAL!`;
    else if (data.type === 'extremidades') msgText = `🔲 EXTREMIDADES! ${nameStr} CERCOU AS EXTREMIDADES!`;
    
    const msg = {
      sender: 'SISTEMA',
      text: msgText,
      type: msgType,
      time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
      roomId: data.roomId
    };
    io.to(data.roomId).emit('chat_message', msg);
    io.to(data.roomId).emit('special_called', data);
    
    try {
      const Room = require('./models/Room');
      if (data.roomId) {
        await Room.updateOne({ roomId: data.roomId }, { $push: { messages: msg } });
      }
    } catch(e) {}
  });

  // Chat message regular
  socket.on('chat_message', async (data) => {
    io.to(data.roomId).emit('chat_message', data);
    try {
      const Room = require('./models/Room');
      if (data.roomId) {
        await Room.updateOne({ roomId: data.roomId }, { $push: { messages: data } });
      }
    } catch(e) {}
  });

  // Start new game / Reset room
  socket.on('start_game', (roomId) => {
    io.to(roomId).emit('game_started');
  });

  socket.on('close_room', (roomId) => {
    io.to(roomId).emit('room_closed');
  });

  socket.on('disconnect', () => {
    console.log('Participant disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 API + Socket.io Server rodando na porta ${PORT}`);
});
