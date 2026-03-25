"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ 
      background: 'radial-gradient(circle at top right, #0a192f, #020617)', 
      color: 'white',
      overflowX: 'hidden'
    }}>
      
      {/* --- HEADER --- */}
      <header className="py-5 border-bottom shadow-sm" style={{ 
          borderColor: 'rgba(255,255,255,0.05)', 
          backgroundColor: 'rgba(2,6,23,0.9)', 
          backdropFilter: 'blur(10px)', 
          position: 'sticky', top: 0, zIndex: 1000 
      }}>
        <Container className="d-flex justify-content-between align-items-center">
          {/* Logo */}
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

          {/* Auth Links (InMemoriam Style) */}
          <div className="d-flex gap-4 align-items-center">
             <button 
                onClick={() => router.push('/registrar')} 
                className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-0"
                style={{ fontSize: '0.9rem', fontWeight: 500 }}
             >
                <span style={{ color: 'var(--primary, #00f2ff)' }}><i className="bi bi-person-plus"></i></span>
                <span className="opacity-80">Criar uma conta</span>
             </button>
             <button 
                onClick={() => router.push('/organizador')} 
                className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-0"
                style={{ fontSize: '0.9rem', fontWeight: 500 }}
             >
                <span style={{ color: 'var(--primary, #00f2ff)' }}><i className="bi bi-box-arrow-in-right"></i></span>
                <span className="opacity-80">Entre</span>
             </button>
          </div>
        </Container>
      </header>

      {/* --- MAIN HERO --- */}
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <Container>
          <Row className="gy-5 align-items-center">
            
            {/* LEFT: Presentation */}
            <Col lg={6} className="text-center text-lg-start pe-lg-5">
              <div className="mb-4 d-inline-block px-3 py-1 rounded-pill" style={{ 
                  background: 'rgba(0, 242, 255, 0.1)', 
                  border: '1px solid rgba(0, 242, 255, 0.2)',
                  fontSize: '0.7rem',
                  letterSpacing: '2px',
                  fontWeight: 600,
                  color: 'var(--primary, #00f2ff)'
              }}>
                A REVOLUÇÃO DO BINGO DIGITAL
              </div>
              <h1 className="fw-bold mb-4" style={{ 
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                  lineHeight: '1.1',
                  textShadow: '0 0 40px rgba(0, 242, 255, 0.2)'
              }}>
                Master Bingo para <br />
                <span style={{ 
                    background: 'linear-gradient(90deg, #ddff00, #00f2ff)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent' 
                }}>Eventos e Lives</span>
              </h1>
              <p className="fs-5 opacity-60 mb-5 pe-lg-5" style={{ lineHeight: '1.6' }}>
                A plataforma completa para gerenciar sorteios profissionais em festas, conferências e transmissões ao vivo. 
                Gere cartelas digitais instantaneamente e controle tudo em tempo real.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                 <button 
                    onClick={() => router.push('/registrar')} 
                    className="btn btn-primary px-5 py-3 fw-bold text-uppercase" 
                    style={{ 
                        borderRadius: '16px', 
                        fontSize: '0.9rem', 
                        letterSpacing: '1px',
                        background: 'linear-gradient(90deg, #00f2ff, #0072ff)',
                        border: 'none',
                        boxShadow: '0 10px 30px rgba(0, 114, 255, 0.4)'
                    }}
                 >
                    Começar Agora
                 </button>
                 <button className="btn btn-outline-light px-5 py-3 fw-bold text-uppercase" style={{ borderRadius: '16px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Ver Exemplos
                 </button>
              </div>
            </Col>

            {/* RIGHT: Video Tutorial / Preview */}
            <Col lg={6}>
              <div className="position-relative p-2" style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '32px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)'
              }}>
                <div className="ratio ratio-16x9 position-relative overflow-hidden" style={{ borderRadius: '24px' }}>
                   {/* Video Placeholder */}
                   <div 
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                      style={{ 
                          background: 'linear-gradient(135deg, rgba(0, 114, 255, 0.2), rgba(0, 242, 255, 0.1))',
                          border: '2px dashed rgba(255,255,255,0.1)',
                          borderRadius: '24px'
                      }}
                   >
                      <div className="mb-3 opacity-20" style={{ fontSize: '4rem' }}>📺</div>
                      <h4 className="fw-bold opacity-30 text-uppercase" style={{ letterSpacing: '4px' }}>Video Tutorial</h4>
                   </div>
                   <div className="position-absolute top-50 left-50 translate-middle" style={{ cursor: 'pointer' }}>
                      <div className="p-4 rounded-circle bg-white text-dark shadow-lg d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', transition: 'all 0.3s' }}>
                         <span style={{ fontSize: '1.5rem', color: '#0072ff' }}>▶</span>
                      </div>
                   </div>
                </div>
                {/* Status indicator */}
                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-n3 px-4 py-2 rounded-pill shadow-lg border" style={{ 
                    background: '#020617', 
                    borderColor: 'rgba(0, 242, 255, 0.3)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--primary, #00f2ff)'
                }}>
                  ● VÍDEO TUTORIAL RÁPIDO (1:45)
                </div>
              </div>
            </Col>

          </Row>
        </Container>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(2,6,23,0.5)' }}>
        <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="mb-0 opacity-30 small">© 2026 Master Bingo • Sua plataforma premium de eventos.</p>
          <div className="d-flex gap-4 opacity-50 small">
              <span style={{ cursor: 'pointer' }}>Privacidade</span>
              <span style={{ cursor: 'pointer' }}>Termos</span>
              <span style={{ cursor: 'pointer' }}>Suporte</span>
          </div>
        </Container>
      </footer>

      {/* Link to Bootstrap Icons in layout.js should be present. */}
    </div>
  );
}
