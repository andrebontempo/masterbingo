const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

router.get('/organizador/:adminId', async (req, res) => {
  try {
    const rooms = await Room.find({ admin: req.params.adminId }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    // Rooms created in the last 24h that are not finished
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rooms = await Room.find({ 
      status: { $ne: 'finished' },
      createdAt: { $gte: yesterday }
    }).select('roomId adminName gameMode players status');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const generateRoomId = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

router.post('/create', async (req, res) => {
  const { adminId, gameMode, adminEmail } = req.body;
  try {
    const roomId = generateRoomId();
    // Use email before @ as name
    const adminName = adminEmail ? adminEmail.split('@')[0] : 'Organizador';
    
    const initialMessages = [
        { sender: 'SISTEMA', text: '🟢 Sala Aberta!', type: 'system', time: new Date().toLocaleTimeString('pt-BR', { hour12: false }) },
        { sender: 'SISTEMA', text: '⏳ Aguardando Jogadores...', type: 'system', time: new Date().toLocaleTimeString('pt-BR', { hour12: false }) }
    ];

    const room = await Room.create({ roomId, admin: adminId, adminName, gameMode, drawnNumbers: [], messages: initialMessages });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const generateCard = (maxMode) => {
  const colSize = Math.max(5, Math.ceil(maxMode / 5));
  const newCartela = [];
  for (let c = 0; c < 5; c++) {
    let colNums = [];
    while (colNums.length < 5) {
      let maxLimit = Math.min((c + 1) * colSize, maxMode);
      let minLimit = c * colSize + 1;
      let range = maxLimit - minLimit + 1;
      if (range < 5) {
          minLimit = Math.max(1, maxMode - 4);
          maxLimit = maxMode;
      }
      const rn = Math.floor(Math.random() * (maxLimit - minLimit + 1)) + minLimit;
      if (!colNums.includes(rn)) colNums.push(rn);
    }
    colNums.sort((a,b) => a - b);
    if (c === 2) colNums[2] = "FREE";
    newCartela.push(colNums);
  }
  const rows = [];
  for (let r = 0; r < 5; r++) {
    let rowObj = [];
    for (let c = 0; c < 5; c++) rowObj.push(newCartela[c][r]);
    rows.push(rowObj);
  }
  return rows;
};

router.post('/:roomId/join', async (req, res) => {
  const { name, deviceId } = req.body;
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Sala não encontrada.' });
    
    let player = room.players.find(p => p.deviceId === deviceId);
    if (player) return res.json({ name: player.name, card: player.card, messages: room.messages || [] });
    
    if (room.isLocked) return res.status(403).json({ message: 'A sala foi trancada pelo organizador e não aceita mais jogadores.' });

    if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ message: 'Este nome já está em uso nesta sala.' });
    }
    
    const card = generateCard(room.gameMode);
    room.players.push({ name, deviceId, card });
    await room.save();
    
    res.json({ name, card, messages: room.messages || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:roomId/lock', async (req, res) => {
  const { isLocked } = req.body;
  try {
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $set: { isLocked } },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Sala não encontrada.' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:roomId/draw', async (req, res) => {
   const { number } = req.body;
   try {
     const room = await Room.findOneAndUpdate(
       { roomId: req.params.roomId },
       { $push: { drawnNumbers: number }, status: 'playing' },
       { new: true }
     );
     res.json(room);
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
});

router.delete('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Sala não encontrada.' });
    res.json({ message: 'Sala encerrada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
