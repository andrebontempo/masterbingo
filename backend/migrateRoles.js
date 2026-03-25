require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bingo-v2')
  .then(async () => {
    const db = mongoose.connection.db;
    
    const res1 = await db.collection('admins').updateMany(
      { role: 'admin' },
      { $set: { role: 'organizador' } }
    );
    console.log(`Updated ${res1.modifiedCount} admins to organizador.`);
    
    const res2 = await db.collection('admins').updateMany(
      { role: 'superadmin' },
      { $set: { role: 'admin' } }
    );
    console.log(`Updated ${res2.modifiedCount} superadmins to admin.`);
    
    process.exit(0);
  });
