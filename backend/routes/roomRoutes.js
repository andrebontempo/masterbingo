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
  if (maxMode === 30) {
    const card = [];
    const colSize = 10;
    for (let c = 0; c < 3; c++) {
      let colNums = [];
      while (colNums.length < 3) {
        let rn = Math.floor(Math.random() * colSize) + c * colSize + 1;
        if (!colNums.includes(rn)) colNums.push(rn);
      }
      colNums.sort((a,b) => a - b);
      card.push(colNums);
    }
    const rows = [];
    for (let r = 0; r < 3; r++) {
      rows.push([card[0][r], card[1][r], card[2][r]]);
    }
    return rows;
  }

  if (maxMode === 90) {
    const colRanges = [
      [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
      [50, 59], [60, 69], [70, 79], [80, 90]
    ];
    
    let grid;
    let isValid = false;
    
    while (!isValid) {
      grid = Array.from({ length: 3 }, () => Array(9).fill(null));
      
      // Determine columns with 2 numbers (6 cols) and 1 number (3 cols) -> total 15
      const colCounts = new Array(9).fill(1);
      const extraIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 6);
      extraIndices.forEach(idx => colCounts[idx] = 2);
      
      const assignments = []; // Array of [row, col]
      
      for (let c = 0; c < 9; c++) {
        const rowsForCol = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, colCounts[c]);
        rowsForCol.forEach(r => assignments.push([r, c]));
      }
      
      // Randomly redistribute if row counts are not 5, 5, 5
      // This is a simple shuffling check
      let attempt = 0;
      while (attempt < 100) {
        const rowSums = [0, 0, 0];
        assignments.forEach(([r, c]) => rowSums[r]++);
        
        if (rowSums.every(s => s === 5)) {
          isValid = true;
          break;
        }
        
        // If not balanced, reshuffle row assignments within columns
        // (Move one number to a different row if that row has space)
        assignments.forEach((asgn, i) => {
          const r = asgn[0];
          const c = asgn[1];
          if (rowSums[r] > 5) {
            const targetRow = [0, 1, 2].find(tr => tr !== r && rowSums[tr] < 5 && !assignments.some(a => a[0] === tr && a[1] === c));
            if (targetRow !== undefined) {
              rowSums[r]--;
              rowSums[targetRow]++;
              assignments[i][0] = targetRow;
            }
          }
        });
        attempt++;
      }
      
      if (isValid) {
        // Fill grid and sort columns
        assignments.forEach(([r, c]) => {
          grid[r][c] = true; // Placeholder
        });
        
        for (let c = 0; c < 9; c++) {
          const [min, max] = colRanges[c];
          const count = colCounts[c];
          const nums = [];
          while (nums.length < count) {
            const n = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!nums.includes(n)) nums.push(n);
          }
          nums.sort((a, b) => a - b);
          
          let ni = 0;
          for (let r = 0; r < 3; r++) {
            if (grid[r][c] === true) {
              grid[r][c] = nums[ni++];
            }
          }
        }
      }
    }
    
    return grid;
  }

  // DEFAULT (75-ball)
  const colSize = 15;
  const newCartela = [];
  for (let c = 0; c < 5; c++) {
    let colNums = [];
    while (colNums.length < 5) {
      let rn = Math.floor(Math.random() * colSize) + c * colSize + 1;
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
    if (player) return res.json({ name: player.name, card: player.card, gameMode: room.gameMode, messages: room.messages || [] });
    
    if (room.isLocked) return res.status(403).json({ message: 'A sala foi trancada pelo organizador e não aceita mais jogadores.' });

    if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ message: 'Este nome já está em uso nesta sala.' });
    }
    
    const card = generateCard(room.gameMode);
    room.players.push({ name, deviceId, card });
    await room.save();
    
    res.json({ name, card, gameMode: room.gameMode, messages: room.messages || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:roomId/lock', async (req, res) => {
  const { isLocked, status } = req.body;
  try {
    const update = { isLocked };
    if (status) update.status = status;
    
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $set: update },
      { returnDocument: 'after' }
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
       { returnDocument: 'after' }
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
