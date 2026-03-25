"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Badge, Spinner } from "react-bootstrap";

export default function SalasExplorer() {
  const [activeRooms, setActiveRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) {
      router.push("/admin");
      return;
    }
    const data = JSON.parse(stored);
    if (data.role !== "admin") {
      router.push("/admin");
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/active`);
        if (res.ok) {
          const data = await res.json();
          setActiveRooms(data);
        }
      } catch (e) {
        console.error("Erro ao carregar salas:", e);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
    const interval = setInterval(fetchRooms, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (rid) => {
    router.push(`/jogar?room=${rid}`);
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'var(--bg-dark)', color: 'white' }}>
      <header className="py-4 border-bottom border-secondary border-opacity-25 mb-5 shadow-sm">
        <Container className="d-flex justify-content-between align-items-center">
            <h1 className="m-0" style={{ 
              fontSize: '1.5rem', 
              fontFamily: 'var(--font-syncopate)', 
              fontWeight: '300', 
              color: 'var(--primary)',
              cursor: 'pointer'
            }} onClick={() => router.push('/')}>
            BINGO <span className="text-white">V2 PRO</span>
            </h1>
            <button className="btn btn-outline-info btn-sm" onClick={() => router.push('/')}>VOLTAR</button>
        </Container>
      </header>

      <Container className="flex-grow-1 mb-5">
        <h2 className="fw-bold mb-4" style={{ fontFamily: 'var(--font-syncopate)', fontSize: '1.4rem' }}>
            SALAS <span className="text-info">ABERTAS</span> AGORA 🕹️
        </h2>

        <Row className="g-4">
            {activeRooms.length > 0 ? (
                activeRooms.map((room) => (
                    <Col key={room.roomId} md={6} lg={4}>
                        <div 
                        onClick={() => handleJoin(room.roomId)}
                        className="p-4 border d-flex justify-content-between align-items-center transition-all hover-scale h-100"
                        style={{ 
                            cursor: 'pointer', 
                            background: 'rgba(255,255,255,0.03)', 
                            borderColor: 'rgba(255,255,255,0.08)',
                            borderRadius: '24px'
                        }}
                        >
                            <div>
                                <h5 className="text-white m-0 fw-bold">BINGO DO {room.adminName.toUpperCase()}</h5>
                                <div className="d-flex flex-column gap-1 mt-2">
                                    <span className="text-info small opacity-75">{room.gameMode} BOLAS</span>
                                    <span className="text-light opacity-50 small">{room.players?.length || 0} JOGADORES</span>
                                </div>
                            </div>
                            <div className="text-end">
                                <Badge bg="dark" className="border border-info text-info mb-2 px-3 py-2 rounded-3" style={{ fontSize: '0.8rem' }}>#{room.roomId}</Badge>
                                <div className="text-accent small fw-bold" style={{ fontSize: '0.6rem' }}>ENTRAR →</div>
                            </div>
                        </div>
                    </Col>
                ))
            ) : (
                <Col xs={12}>
                    <div className="text-center py-5 cyber-panel border-0">
                        {loadingRooms ? (
                             <Spinner animation="border" variant="info" />
                        ) : (
                            <div className="opacity-25 py-5">
                                <p className="fs-1 mb-0">🎱</p>
                                <p className="fw-bold mt-2 text-white">NENHUMA SALA DISPONÍVEL</p>
                                <p className="small mx-auto" style={{ maxWidth: '400px' }}>Um sinal sairá assim que um organizador abrir um novo bingo!</p>
                            </div>
                        )}
                    </div>
                </Col>
            )}
        </Row>
      </Container>

      <footer className="py-4 text-center opacity-25" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
        © 2026 BINGO V2 PRO • LIVE ROOM EXPLORER
      </footer>

      <style jsx>{`
        .hover-scale:hover {
          transform: translateY(-5px);
          background: rgba(14, 165, 233, 0.05) !important;
          border-color: rgba(14, 165, 233, 0.3) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
