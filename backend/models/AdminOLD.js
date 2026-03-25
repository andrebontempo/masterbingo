const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
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

  role: { type: String, enum: ['organizador', 'admin'], default: 'organizador' },

  resetPasswordToken:   { type: String, index: true },
  resetPasswordExpires: Date,

}, { timestamps: true });

// Hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

AdminSchema.methods.fullName = function () {
  return `${this.firstName} ${this.lastName}`.trim();
};

module.exports = mongoose.model('Admin', AdminSchema);
