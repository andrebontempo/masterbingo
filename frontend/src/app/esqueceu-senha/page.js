"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Form, Alert, Spinner } from "react-bootstrap";

const API = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

export default function EsqueceuSenhaPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus(null);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setStatus('success');
      setMessage(data.message || 'Se o e-mail estiver cadastrado, você receberá as instruções.');
    } catch {
      setStatus('error');
      setMessage('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container style={{ maxWidth: '440px' }} className="py-5">
        <div className="cyber-panel p-4 p-md-5" style={{ background: 'var(--surface)', border: '2px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '16px' }}>
          
          <h3 className="text-light fw-bold mb-1" style={{ fontSize: '1.1rem' }}>Esqueceu sua senha?</h3>
          <p className="opacity-50 small mb-4">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>

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
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>E-mail</Form.Label>
                <Form.Control
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="seu@email.com"
                  style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}
                />
              </Form.Group>
              <button type="submit" disabled={loading} className="btn-cyber btn-primary-cyber w-100 py-3 fw-bold rounded-4 text-uppercase" style={{ letterSpacing: '2px' }}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Enviar Link'}
              </button>
            </Form>
          )}

          <div className="mt-4 text-center">
            <span className="opacity-40 small">Lembrou a senha? </span>
            <span className="small fw-bold" style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => router.push('/')}>
              Voltar ao login →
            </span>
          </div>
        </div>
      </Container>
    </>
  );
}
