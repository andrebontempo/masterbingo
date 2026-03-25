"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Spinner } from "react-bootstrap";

export default function GestaoSalas() {
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
    if (!stored) {
      router.push("/admin");
      return;
    }
    setAdmin(JSON.parse(stored));
  }, [router]);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/rooms/active`);
      const data = await res.json();
      setRooms(data);
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
    if (!confirm(`Tem certeza que deseja fechar a sala ${roomId}? Esta ação não pode ser desfeita.`)) return;
    try {
      setClosing(roomId);
      await fetch(`${baseUrl}/api/rooms/${roomId}`, { method: "DELETE" });
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
    } catch (err) {
      alert("Erro ao fechar sala: " + err.message);
    } finally {
      setClosing(null);
    }
  };

  const statusColor = (status) => {
    if (status === "playing") return "#0ea5e9";
    if (status === "finished") return "#ef4444";
    return "#6b7280";
  };

  const statusLabel = (status) => {
    if (status === "playing") return "● EM JOGO";
    if (status === "finished") return "● ENCERRADA";
    return "● AGUARDANDO";
  };

  return (
    <div className="min-vh-100" style={{ background: "var(--bg-dark)", color: "white" }}>
      <Container fluid="lg" className="py-4 py-md-5">

        {/* ─── HEADER ─── */}
        <header className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5 border-bottom border-secondary border-opacity-25 pb-4">
          <div>
            <h1 className="mb-0 text-light fw-bold" style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.8rem)", letterSpacing: "1px" }}>
              GESTÃO DE SALAS
            </h1>
            <p className="mb-0 text-white opacity-50 small mt-1">
              Organizador: {admin?.email?.split("@")[0].replace(".", " ")} &nbsp;·&nbsp;
              {lastRefresh && <>Última atualização: {lastRefresh}</>}
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-info btn-sm fw-bold px-3" onClick={fetchRooms}>
              🔄 Atualizar
            </button>
            <button
              className="btn btn-outline-secondary btn-sm fw-bold px-3"
              onClick={() => router.push("/admin/dashboard")}
            >
              ← Painel
            </button>
          </div>
        </header>

        {/* ─── STATS ─── */}
        <Row className="g-3 mb-5">
          {[
            { label: "Salas Abertas", value: rooms.length, color: "#0ea5e9" },
            { label: "Em Jogo", value: rooms.filter(r => r.status === "playing").length, color: "#22c55e" },
            { label: "Aguardando", value: rooms.filter(r => r.status !== "playing").length, color: "#f59e0b" },
            { label: "Jogadores Online", value: rooms.reduce((acc, r) => acc + (r.players?.length || 0), 0), color: "#a855f7" },
          ].map((stat, i) => (
            <Col xs={6} md={3} key={i}>
              <div
                className="text-center p-3 rounded-3"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${stat.color}33`, borderRadius: "16px" }}
              >
                <div className="fw-bold" style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: stat.color }}>
                  {loading ? "—" : stat.value}
                </div>
                <div className="text-white opacity-50 small mt-1" style={{ fontFamily: "var(--font-syncopate)", fontSize: "0.65rem" }}>
                  {stat.label}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ─── LISTA DE SALAS ─── */}
        <div className="cyber-panel p-4" style={{ borderRadius: "24px", border: "1px solid var(--border)" }}>
          <h2 className="text-light fw-bold mb-4" style={{ fontFamily: "var(--font-syncopate)", fontSize: "0.9rem", opacity: 0.75 }}>
            TODAS AS SALAS ATIVAS
          </h2>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="info" />
              <p className="text-light opacity-50 mt-3 small">Buscando salas...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-5 opacity-25">
              <p className="fs-1">✅</p>
              <p className="small">Nenhuma sala ativa no momento.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="w-100" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
                <thead>
                  <tr className="text-white opacity-40 small" style={{ fontFamily: "var(--font-syncopate)", fontSize: "0.65rem" }}>
                    <th className="pb-2 ps-2">CÓDIGO</th>
                    <th className="pb-2">ORGANIZADOR</th>
                    <th className="pb-2">MODO</th>
                    <th className="pb-2">JOGADORES</th>
                    <th className="pb-2">STATUS</th>
                    <th className="pb-2 text-end pe-2">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr
                      key={room.roomId}
                      className="text-white"
                      style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}
                    >
                      <td className="py-3 ps-3 rounded-start-3">
                        <span className="fw-bold text-info" style={{ fontFamily: "monospace", fontSize: "1.1rem", letterSpacing: "2px" }}>
                          {room.roomId}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-white opacity-85" style={{ textTransform: "capitalize" }}>
                          {room.adminName || "—"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="badge" style={{ background: "rgba(14,165,233,0.15)", color: "#0ea5e9", border: "1px solid #0ea5e930" }}>
                          {room.gameMode} bolas
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-white opacity-75">
                          👤 {room.players?.length || 0}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="small fw-bold" style={{ color: statusColor(room.status) }}>
                          {statusLabel(room.status)}
                        </span>
                      </td>
                      <td className="py-3 pe-3 rounded-end-3 text-end">
                        <button
                          className="btn btn-sm btn-outline-danger fw-bold"
                          style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
                          disabled={closing === room.roomId}
                          onClick={() => closeRoom(room.roomId)}
                        >
                          {closing === room.roomId ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "✕ FECHAR SALA"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── FOOTER NOTE ─── */}
        <p className="text-center text-white opacity-25 small mt-4">
          Fechar uma sala remove todos os jogadores e dados associados permanentemente.
        </p>
      </Container>
    </div>
  );
}
