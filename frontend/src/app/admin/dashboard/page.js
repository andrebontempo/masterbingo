"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Spinner } from "react-bootstrap";

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Auth guard
  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (!stored) { router.push("/admin"); return; }
    const data = JSON.parse(stored);
    if (data.role !== "admin") { router.push("/admin"); return; }
    setAdmin(data);
  }, [router]);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/rooms/active`);
      if (res.ok) {
        setRooms(await res.json());
      }
      setLastRefresh(new Date().toLocaleTimeString("pt-BR"));
    } catch (err) {
      console.error("Erro ao buscar salas:", err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (admin) fetchRooms();
  }, [admin, fetchRooms]);

  const closeRoom = async (roomId) => {
    if (!confirm(`Fechar a sala ${roomId}? Esta ação não pode ser desfeita.`)) return;
    setClosing(roomId);
    try {
      await fetch(`${baseUrl}/api/rooms/${roomId}`, { method: "DELETE" });
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setClosing(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminData");
    router.push("/admin");
  };

  const stats = [
    { label: "Salas Ativas", value: rooms.length, color: "#0ea5e9" },
    { label: "Em Jogo", value: rooms.filter(r => r.status === "playing").length, color: "#22c55e" },
    { label: "Aguardando", value: rooms.filter(r => r.status !== "playing").length, color: "#f59e0b" },
    { label: "Jogadores Online", value: rooms.reduce((a, r) => a + (r.players?.length || 0), 0), color: "#a855f7" },
  ];

  return (
    <>
      <Container fluid="lg" className="py-3 py-md-4">

        {/* ─── SUB-HEADER ─── */}
        <div
          className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 p-3 rounded-4"
          style={{ 
            backgroundColor: 'rgba(2,6,23,0.4)',
            border: "1px solid rgba(239,68,68,0.2)",
            backdropFilter: 'blur(10px)'
          }}
        >
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: "1.4rem" }}>🛡️</span>
              <h1 className="mb-0 text-light fw-bold" style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.8rem)", letterSpacing: "1px" }}>
                PAINEL ADMINISTRATIVO
              </h1>
              <span
                className="badge ms-1"
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", fontSize: "0.6rem" }}
              >
                ACESSO TOTAL
              </span>
            </div>
            <p className="mb-0 text-white opacity-40 small">
              {admin?.email}
              {lastRefresh && <> &nbsp;·&nbsp; Atualizado: {lastRefresh}</>}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm fw-bold px-3" style={{ borderRadius: '12px' }} onClick={fetchRooms}>🔄 Atualizar</button>
          </div>
        </div>

        {/* ─── STATS ─── */}
        <Row className="g-3 mb-5">
          {stats.map((s, i) => (
            <Col xs={6} md={3} key={i}>
              <div className="text-center p-3 rounded-4 shadow-sm" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}33`, backdropFilter: 'blur(5px)' }}>
                <div className="fw-bold" style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: s.color }}>
                  {loading ? "—" : s.value}
                </div>
                <div className="text-white opacity-40 small mt-1" style={{ fontFamily: "var(--font-syncopate)", fontSize: "0.6rem" }}>
                  {s.label}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ─── TABELA DE SALAS ─── */}
        <div className="cyber-panel p-4" style={{ borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", background: 'rgba(255,255,255,0.01)' }}>
          <h2 className="text-light fw-bold mb-4" style={{ fontFamily: "var(--font-syncopate)", fontSize: "0.85rem", opacity: 0.6 }}>
            TODAS AS SALAS ATIVAS
          </h2>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
              <p className="text-light opacity-50 mt-3 small">Buscando salas...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-5 opacity-25">
              <p className="fs-1">✅</p>
              <p className="small">Nenhuma sala ativa.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {rooms.map(room => (
                <div
                  key={room.roomId}
                  className="d-flex justify-content-between align-items-center p-3 rounded-4 flex-wrap gap-3 shadow-sm"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="d-flex align-items-center gap-4 flex-wrap">
                    <div>
                      <span className="fw-bold text-info" style={{ fontFamily: "monospace", fontSize: "1.2rem", letterSpacing: "2px" }}>
                        {room.roomId}
                      </span>
                    </div>
                    <div>
                      <div className="text-white small" style={{ textTransform: "capitalize" }}>
                        👤 {room.adminName || "—"}
                      </div>
                      <div className="text-white opacity-50 small">{room.gameMode} bolas · {room.players?.length || 0} jogadores</div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: room.status === "playing" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                        color: room.status === "playing" ? "#22c55e" : "#f59e0b",
                        border: `1px solid ${room.status === "playing" ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                        fontSize: "0.65rem",
                      }}
                    >
                      {room.status === "playing" ? "● EM JOGO" : "● AGUARDANDO"}
                    </span>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm fw-bold px-3"
                    style={{ borderRadius: '10px' }}
                    disabled={closing === room.roomId}
                    onClick={() => closeRoom(room.roomId)}
                  >
                    {closing === room.roomId ? <Spinner animation="border" size="sm" /> : "✕ FECHAR SALA"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-white opacity-20 small mt-4">
          Fechar uma sala remove permanentemente todos os dados associados.
        </p>
      </Container>
    </>
  );
}
