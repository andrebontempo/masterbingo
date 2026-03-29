"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("organizadorData") || localStorage.getItem("adminData");
    if (stored) setIsLoggedIn(true);
  }, []);

  const handleCreateRoom = () => {
    if (isLoggedIn) {
      router.push('/organizador/dashboard');
    } else {
      alert("Para criar uma sala, você deve ter uma conta e estar logado.");
      router.push('/registrar');
    }
  };

  return (
    <>
      {/* --- MAIN HERO --- */}
      <section className="d-flex align-items-center py-4">
        <Container>
          <Row className="gy-5 align-items-center">

            {/* LEFT: Presentation */}
            <Col lg={6} className="text-center text-lg-start pe-lg-5">
              <h1 className="fw-bold mb-4" style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                lineHeight: '1.1',
                textShadow: '0 0 40px rgba(0, 242, 255, 0.2)'
              }}>
                Master Bingo<br />
                <span style={{
                  background: 'linear-gradient(90deg, #ddff00, #00f2ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Festas, Eventos e Lives</span>
              </h1>
              <p className="fs-5 opacity-60 mb-4 pe-lg-5" style={{ lineHeight: '1.6' }}>
                A plataforma completa para gerenciar bingos em festas, conferências e transmissões ao vivo.
                Gere cartelas digitais instantaneamente e controle tudo em tempo real.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <button
                  onClick={handleCreateRoom}
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
                  Criar Uma Sala de Bingo
                </button>

                {/* 
                <button className="btn btn-outline-light px-5 py-3 fw-bold text-uppercase" style={{ borderRadius: '16px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Ver Exemplos
                </button>
                */}

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
                <div className="ratio ratio-16x9 position-relative overflow-hidden shadow-2xl" style={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <video
                    controls
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  >
                    <source src="/video_masterbingo.mp4" type="video/mp4" />
                    Seu navegador não suporta vídeos.
                  </video>
                </div>

              </div>
            </Col>

          </Row>
        </Container>
      </section>
    </>
  );
}
