const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, trim: true, default: '' },
  lastName:  { type: String, trim: true, default: '' },

  email: { type: String, required: true, unique: true, lowercase: true, trim: true },

  password: {
    type: String,
    required: function () { return this.authProvider === 'local'; }
  },

  googleId: { type: String, unique: true, sparse: true },

  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  avatar: { type: String, default: '' },

  // "organizador" = usuário normal, "admin" = superadmin do sistema
  role: { type: String, enum: ['organizador', 'admin'], default: 'organizador' },

  resetPasswordToken:   { type: String, index: true },
  resetPasswordExpires: Date,

}, { timestamps: true }); // createdAt e updatedAt automáticos

// ─── Pre-save: hash password ──────────────────────────────────────────────────
// Nota: async sem next() — Mongoose v6+ trata a promise retornada automaticamente
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Métodos ──────────────────────────────────────────────────────────────────
UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

UserSchema.methods.fullName = function () {
  return `${this.firstName} ${this.lastName}`.trim();
};

module.exports = mongoose.model('User', UserSchema);
