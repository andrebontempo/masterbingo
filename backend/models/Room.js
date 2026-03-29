const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  adminName: { type: String, default: 'Organizador' },
   gameMode: { type: Number, enum: [30, 75, 90], default: 75 },
  drawnNumbers: [{ type: Number }],
  players: [{
    name: String,
    deviceId: String,
    card: [[mongoose.Schema.Types.Mixed]] // 5x5 grid
  }],
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  isLocked: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false },
  messages: [{
    sender: String,
    text: String,
    type: { type: String },
    time: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', RoomSchema);
