const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/User');
const { sendEmail, welcomeEmail, resetEmail } = require('../services/mailService');

const JWT_SECRET = process.env.JWT_SECRET || 'bingo_secret';
const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  let { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'As senhas não coincidem.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  email = email.trim().toLowerCase();

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'E-mail já cadastrado.' });

    const admin = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      password,
      authProvider: 'local'
    });

    // Welcome email (non-blocking)
    sendEmail({ to: admin.email, subject: 'Bem-vindo ao Master Bingo!', html: welcomeEmail(admin.firstName) })
      .catch(err => console.error('[register] email error:', err.message));

    res.status(201).json({
      _id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  let { email, password } = req.body;
  email = (email || '').trim().toLowerCase();

  try {
    const admin = await User.findOne({ email });
    if (!admin || admin.authProvider !== 'local') {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
    const ok = await admin.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });

    res.json({
      _id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  let { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Informe o e-mail.' });
  email = email.trim().toLowerCase();

  try {
    const admin = await User.findOne({ email });
    if (admin && admin.authProvider === 'local') {
      const token = crypto.randomBytes(32).toString('hex');
      admin.resetPasswordToken = token;
      admin.resetPasswordExpires = Date.now() + 3600000; // 1h
      await admin.save();

      const link = `${BASE_URL}/resetar-senha/${token}`;
      await sendEmail({ to: admin.email, subject: 'Redefinição de senha — Master Bingo', html: resetEmail(link) });
    }
    // Always return success to prevent email enumeration
    res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao processar solicitação.' });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || password !== confirmPassword) {
    return res.status(400).json({ message: 'As senhas não coincidem ou estão vazias.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const admin = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!admin) return res.status(400).json({ message: 'Link inválido ou expirado.' });

    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
});

// ─── VALIDATE RESET TOKEN ─────────────────────────────────────────────────────
router.get('/reset-password/:token/validate', async (req, res) => {
  try {
    const admin = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    res.json({ valid: !!admin });
  } catch {
    res.json({ valid: false });
  }
});

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${BASE_URL}/?error=google_failed`, session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    // Redirect to frontend with token in query (frontend stores it)
    res.redirect(`${BASE_URL}/?token=${token}&email=${encodeURIComponent(req.user.email)}&firstName=${encodeURIComponent(req.user.firstName)}&role=${req.user.role}`);
  }
);

// ─── PROMOTE / LIST (admin management) ───────────────────────────────────────
router.post('/promote', async (req, res) => {
  const { email, secretKey } = req.body;
  if (secretKey !== (process.env.SUPER_ADMIN_KEY || 'bingo_superadmin_2025')) {
    return res.status(403).json({ message: 'Chave secreta inválida.' });
  }
  try {
    const admin = await User.findOneAndUpdate({ email }, { role: 'admin' }, { returnDocument: 'after' });
    if (!admin) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: `${admin.email} promovido a Administrador.`, role: admin.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
