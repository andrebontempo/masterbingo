"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import { Toaster, toast } from "react-hot-toast";

export default function PerfilOrganizador() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("organizadorData");
    if (!stored) {
      router.push("/");
    } else {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Erro ao carregar dados", e);
        router.push("/");
      }
    }
  }, [router]);

  if (!user) return null;

  return (
    <>
      <Toaster position="top-right" />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="cyber-panel p-4 p-md-5" style={{ 
              borderRadius: '24px', 
              background: 'rgba(2,6,23,0.7)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: 'var(--shadow)'
            }}>
              
              {/* Header do Perfil */}
              <div className="d-flex align-items-center gap-4 mb-5 flex-wrap">
                <div className="profile-avatar shadow-lg d-flex align-items-center justify-content-center" style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, var(--primary, #0ea5e9), var(--accent, #22d3ee))',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {(user.firstName?.[0] || user.name?.[0] || 'O').toUpperCase()}
                </div>
                <div>
                  <h1 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-syncopate)', fontSize: '1.5rem', color: 'white' }}>
                    {user.name || `${user.firstName} ${user.lastName || ''}`}
                  </h1>
                  <p className="text-info mb-0 opacity-75 fw-medium">{user.email}</p>
                  <div className="d-flex gap-2 mt-2">
                    <Badge bg="primary" style={{ background: 'rgba(14, 165, 233, 0.2)', border: '1px solid rgba(14, 165, 233, 0.4)', color: 'var(--primary)' }}>Organizador</Badge>
                    <Badge bg="success" style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80' }}>Conta Ativa</Badge>
                  </div>
                </div>
              </div>

              {/* Detalhes da Conta */}
              <div className="account-details mb-5">
                <h3 className="section-title mb-4" style={{ fontFamily: 'var(--font-syncopate)', fontSize: '0.9rem', letterSpacing: '2px', color: 'var(--text-muted)' }}>
                  DADOS DA CONTA
                </h3>
                <Row className="g-4">
                  <Col md={6}>
                    <div className="detail-item p-3 rounded-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="d-block small text-muted text-uppercase mb-1" style={{ letterSpacing: '1px' }}>ID do Organizador</span>
                      <span className="text-white fw-bold">{user._id || user.id}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="detail-item p-3 rounded-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="d-block small text-muted text-uppercase mb-1" style={{ letterSpacing: '1px' }}>Nível de Acesso</span>
                      <span className="text-white fw-bold">Master Organizador</span>
                    </div>
                  </Col>
                  <Col md={12}>
                    <div className="detail-item p-3 rounded-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="d-block small text-muted text-uppercase mb-1" style={{ letterSpacing: '1px' }}>Endereço de E-mail Verificado</span>
                      <span className="text-white fw-bold d-flex align-items-center gap-2">
                        {user.email}
                        <i className="bi bi-patch-check-fill text-info"></i>
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Ações */}
              <div className="pt-4 d-flex gap-3 flex-wrap">
                <Button 
                  variant="primary-cyber" 
                  className="px-4 py-2 fw-bold rounded-3"
                  onClick={() => router.push('/organizador/dashboard')}
                >
                  <i className="bi bi-grid-fill me-2"></i>
                  IR PARA O DASHBOARD
                </Button>
                <Button 
                  variant="outline-secondary" 
                  className="px-4 py-2 fw-bold rounded-3 opacity-50"
                  disabled
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  EDITAR PERFIL (BREVE)
                </Button>
              </div>

            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
