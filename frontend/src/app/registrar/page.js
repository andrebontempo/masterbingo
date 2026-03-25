"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Spinner, Alert } from "react-bootstrap";
import { toast, Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

export default function RegistrarPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("organizadorData", JSON.stringify(data));
        toast.success("Conta criada! Redirecionando...");
        router.push("/organizador/dashboard");
      } else {
        setError(data.message || "Erro ao criar conta.");
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
                <h2 className="fw-bold mb-1" style={{ fontSize: '1.8rem' }}>Crie sua conta</h2>
                <p className="opacity-50 mb-4 text-sm">Preencha os dados abaixo para ser um organizador.</p>

                {error && <Alert variant="danger" className="bg-danger bg-opacity-10 border-danger text-danger py-2 small">{error}</Alert>}

                <Form onSubmit={handleRegister}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Nome</Form.Label>
                        <Form.Control 
                          name="firstName" value={formData.firstName} onChange={handleChange} required
                          placeholder="Ex: João"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Sobrenome</Form.Label>
                        <Form.Control 
                          name="lastName" value={formData.lastName} onChange={handleChange} required
                          placeholder="Ex: Silva"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="small text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>E-mail</Form.Label>
                    <Form.Control 
                      name="email" type="email" value={formData.email} onChange={handleChange} required
                      placeholder="seu@email.com"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px' }}
                    />
                  </Form.Group>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Senha</Form.Label>
                        <Form.Control 
                          name="password" type="password" value={formData.password} onChange={handleChange} required
                          placeholder="••••••"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Confirmar</Form.Label>
                        <Form.Control 
                          name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required
                          placeholder="••••••"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <button type="submit" disabled={loading} className="btn w-100 py-3 fw-bold text-uppercase mb-4 shadow" style={{ 
                    background: 'linear-gradient(90deg, #00f2ff, #0072ff)', 
                    border: 'none', 
                    color: 'white', 
                    borderRadius: '16px',
                    letterSpacing: '2px'
                  }}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Criar Conta'}
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
                    REGISTRAR COM GOOGLE
                  </button>
                  
                  <div className="mt-4 text-center">
                    <span className="opacity-50 small">Já tem uma conta? </span>
                    <button type="button" onClick={() => router.push('/organizador')} className="btn btn-link text-white p-0 small fw-bold text-decoration-none" style={{ color: 'var(--primary, #00f2ff)' }}>Fazer Login</button>
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
