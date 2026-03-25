"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Row, Col, Form, Spinner, Alert } from "react-bootstrap";
import { toast, Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check for tokens from Google OAuth or deep links
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      const userData = {
        token,
        email: searchParams.get("email"),
        firstName: searchParams.get("firstName"),
        role: searchParams.get("role")
      };
      localStorage.setItem("organizadorData", JSON.stringify(userData));
      toast.success("Login realizado com sucesso!");
      router.push("/organizador/dashboard");
    }
  }, [searchParams, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("organizadorData", JSON.stringify(data));
        toast.success("Bem-vindo de volta!");
        router.push("/organizador/dashboard");
      } else {
        setError(data.message || "E-mail ou senha inválidos.");
      }
    } catch (err) {
      setError("Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${API}/api/auth/google`;
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ 
      background: 'radial-gradient(circle at top right, #0a192f, #020617)', 
      color: 'white'
    }}>
      <Toaster position="top-right" />

      {/* --- HEADER --- */}
      <header className="py-5 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(10px)' }}>
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <h1 className="mb-0 fw-bold" style={{ 
              fontFamily: 'var(--font-syncopate)', 
              fontSize: '1.8rem', 
              letterSpacing: '4px',
              color: 'var(--primary, #00f2ff)'
            }}>
              MASTER BINGO
            </h1>
          </div>
        </Container>
      </header>

      {/* --- FORM SECTION --- */}
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={6} xl={5}>
              <div className="cyber-panel p-4 p-md-5" style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '24px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}>
                <h2 className="fw-bold mb-1" style={{ fontSize: '1.8rem' }}>Entre no Setup</h2>
                <p className="opacity-50 mb-4 text-sm">Acesse seu painel de organizador.</p>

                {error && <Alert variant="danger" className="bg-danger bg-opacity-10 border-danger text-danger py-2 small">{error}</Alert>}

                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>E-mail</Form.Label>
                    <Form.Control 
                      name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="seu@email.com"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Senha</Form.Label>
                    <Form.Control 
                      name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px' }}
                    />
                  </Form.Group>

                  <button type="submit" disabled={loading} className="btn w-100 py-3 fw-bold text-uppercase mb-4 shadow" style={{ 
                    background: 'linear-gradient(90deg, #00f2ff, #0072ff)', 
                    border: 'none', 
                    color: 'white', 
                    borderRadius: '16px',
                    letterSpacing: '2px'
                  }}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Entrar'}
                  </button>

                  <div className="d-flex align-items-center gap-3 my-4 opacity-30">
                    <hr className="flex-grow-1" />
                    <span className="small">OU</span>
                    <hr className="flex-grow-1" />
                  </div>

                  <button type="button" onClick={loginWithGoogle} className="btn btn-outline-light w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    ENTRAR COM GOOGLE
                  </button>
                  
                  <div className="mt-4 text-center">
                    <span className="opacity-50 small">Ainda não tem conta? </span>
                    <button type="button" onClick={() => router.push('/registrar')} className="btn btn-link text-white p-0 small fw-bold text-decoration-none" style={{ color: 'var(--primary, #00f2ff)' }}>Criar uma conta</button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </main>

      <footer className="py-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(2,6,23,0.5)' }}>
        <Container className="text-center opacity-30 small">
          <p className="mb-0">© 2026 Master Bingo</p>
        </Container>
      </footer>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <LoginContent />
        </Suspense>
    );
}
