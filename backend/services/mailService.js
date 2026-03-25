const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.SMTP_FROM || 'apoioaocliente@inmemoriambrasil.com.br';

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('[MailService] Erro ao enviar email:', err.message);
    throw err;
  }
};

const welcomeEmail = (name) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2>🎱 Bem-vindo ao <strong>Master Bingo</strong>, ${name}!</h2>
    <p>Sua conta de organizador foi criada com sucesso.</p>
    <p>Agora você pode criar salas de bingo para eventos, festas e streams.</p>
    <hr/>
    <small style="color:#999">Master Bingo — O bingo para eventos, festas e streams</small>
  </div>
`;

const resetEmail = (resetLink) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2>🔑 Redefinir senha — Master Bingo</h2>
    <p>Recebemos uma solicitação para redefinir sua senha.</p>
    <p>
      <a href="${resetLink}" style="background:#0ea5e9;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold">
        Redefinir Minha Senha
      </a>
    </p>
    <p><small>Este link expira em 1 hora. Se não solicitou, ignore este email.</small></p>
    <hr/>
    <small style="color:#999">Master Bingo — O bingo para eventos, festas e streams</small>
  </div>
`;

module.exports = { sendEmail, welcomeEmail, resetEmail };
