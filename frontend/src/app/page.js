"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";

export default function LandingPage() {
  const router = useRouter();

  return (
    <>
      {/* --- MAIN HERO --- */}
      <section className="d-flex align-items-center py-4">
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
              <p className="fs-5 opacity-60 mb-4 pe-lg-5" style={{ lineHeight: '1.6' }}>
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
      </section>
    </>
  );
}
