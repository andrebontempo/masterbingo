"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container, Form, Alert, Spinner } from "react-bootstrap";

const API = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

export default function ResetarSenhaPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null=checking, true, false

  // Validate token on mount
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/auth/reset-password/${token}/validate`)
      .then(r => r.json())
      .then(d => setTokenValid(d.valid))
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('As senhas não coincidem.');
      return;
    }
    setLoading(true); setStatus(null);
    try {
      const res = await fetch(`${API}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Senha redefinida com sucesso! Redirecionando...');
        setTimeout(() => router.push('/'), 2500);
      } else {
        setStatus('error');
        setMessage(data.message || 'Erro ao redefinir senha.');
      }
    } catch {
      setStatus('error');
      setMessage('Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container style={{ maxWidth: '440px' }} className="py-5">
        <div className="cyber-panel p-4 p-md-5" style={{ background: 'var(--surface)', border: '2px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '16px' }}>
          
          {tokenValid === null && (
            <div className="text-center py-4 opacity-50">
              <Spinner animation="border" size="sm" className="me-2" />
              Verificando link...
            </div>
          )}

          {tokenValid === false && (
            <>
              <Alert variant="danger" className="rounded-3 bg-transparent border-danger text-danger py-2 small">
                ⚠️ Este link é inválido ou já expirou. Solicite um novo link de redefinição.
              </Alert>
              <button className="btn-cyber w-100 py-2 mt-2 rounded-4" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'white', cursor: 'pointer' }}
                onClick={() => router.push('/esqueceu-senha')}>
                Solicitar novo link
              </button>
            </>
          )}

          {tokenValid === true && (
            <>
              <h3 className="text-light fw-bold mb-1" style={{ fontSize: '1.1rem' }}>Redefinir Senha</h3>
              <p className="opacity-50 small mb-4">Escolha uma nova senha segura para sua conta.</p>

              {status === 'success' && (
                <Alert variant="success" className="rounded-3 bg-transparent border-success text-success py-2 small">
                  ✅ {message}
                </Alert>
              )}
              {status === 'error' && (
                <Alert variant="danger" className="rounded-3 bg-transparent border-danger text-danger py-2 small">
                  {message}
                </Alert>
              )}

              {status !== 'success' && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>Nova Senha</Form.Label>
                    <Form.Control
                      type="password" value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="Mínimo 6 caracteres"
                      style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>Confirmar Nova Senha</Form.Label>
                    <Form.Control
                      type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                      placeholder="Repita a nova senha"
                      style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}
                    />
                  </Form.Group>
                  <button type="submit" disabled={loading} className="btn-cyber btn-primary-cyber w-100 py-3 fw-bold rounded-4 text-uppercase" style={{ letterSpacing: '2px' }}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Redefinir Senha'}
                  </button>
                </Form>
              )}
            </>
          )}

          <div className="mt-4 text-center">
            <span className="small fw-bold" style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => router.push('/')}>
              ← Voltar ao login
            </span>
          </div>
        </div>
      </Container>
    </>
  );
}
