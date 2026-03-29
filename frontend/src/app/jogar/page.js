"use client";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { Container, Card, Form, Alert } from "react-bootstrap";

export default function PlayerHome() {
  const socket = useSocket();
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [lastDrawn, setLastDrawn] = useState(null);
  const [cartela, setCartela] = useState([]);
  const [gameMode, setGameMode] = useState(75);
  const [marked, setMarked] = useState([]);

  const [deviceId, setDeviceId] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let id = localStorage.getItem("bingo_device_id");
    if (!id) {
      id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem("bingo_device_id", id);
    }
    setDeviceId(id);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl && !roomId) setRoomId(roomFromUrl);

    if (socket) {
      const handleConnect = () => {
        if (joined && roomId && name && cartela) {
          socket.emit('join_room', { roomId, playerName: name, card: cartela });
        }
      };

      if (socket.connected && joined && roomId && name && cartela) {
        socket.emit('join_room', { roomId, playerName: name, card: cartela });
      }

      socket.on('connect', handleConnect);
      socket.on('number_drawn', (data) => {
        setLastDrawn(formatLastDrawn([data.number]));
        setMessages(prev => [...prev, {
          sender: 'SISTEMA',
          text: `⚪ Bola Sorteada: ${data.letter} ${data.number}`,
          type: 'system',
          time: new Date().toLocaleTimeString('pt-BR', { hour12: false })
        }]);
      });
      socket.on('chat_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });
      socket.on('game_started', () => {
        setLastDrawn("");
        setMarked([]);
      });
      socket.on('room_closed', () => {
        alert("A sala atual foi encerrada pelo Administrador.");
        window.location.href = '/'; 
      });
      socket.on('room_status_update', (data) => {
        setRoomStatus(data.status);
        if (data.isPaused !== undefined) setIsPaused(data.isPaused);
      });

      return () => {
        socket.off('connect', handleConnect);
        socket.off('number_drawn');
        socket.off('chat_message');
        socket.off('game_started');
        socket.off('room_closed');
        socket.off('room_status_update');
      };
    }
  }, [socket, joined, roomId, name, cartela]);

  const [roomStatus, setRoomStatus] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const getStatusText = () => {
    if (isPaused) return "BINGO PAUSADO";
    switch (roomStatus) {
      case 'waiting': return "AGUARDANDO JOGADORES";
      case 'finished': return "BINGO ENCERRADO";
      case 'playing': return "BINGO EM ANDAMENTO";
      default: return "BINGO MASTER";
    }
  };

  const formatLastDrawn = (numbers) => {
    if (!numbers || numbers.length === 0) return "";
    const n = numbers[numbers.length - 1];
    let letter = "";
    if (n <= 15) letter = "B";
    else if (n <= 30) letter = "I";
    else if (n <= 45) letter = "N";
    else if (n <= 60) letter = "G";
    else letter = "O";
    return `${letter} ${n}`;
  };

  const joinGame = async (e) => {
    e.preventDefault();
    if (!roomId || !name || !deviceId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, deviceId })
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Erro ao entrar na sala");
        return;
      }

      setCartela(data.card);
      setGameMode(data.gameMode || 75);
      setName(data.name);
      localStorage.setItem("mb_player_name", data.name); // Salva para o Header
      setMessages(data.messages || []);
      setRoomStatus(data.status || "waiting");
      setIsPaused(data.isPaused || false);
      setLastDrawn(formatLastDrawn(data.drawnNumbers));
      setJoined(true);
      
      if (socket) {
        socket.emit('join_room', { roomId, playerName: data.name, card: data.card });
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar com o servidor.");
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket || !roomId) return;
    socket.emit('chat_message', { roomId, sender: name, text: chatInput });
    setChatInput("");
  };

  const toggleMark = (num) => {
    if (marked.includes(num)) {
      setMarked(marked.filter(n => n !== num));
    } else {
      setMarked([...marked, num]);
    }
  };

  // Poll room status (fallback)
  useEffect(() => {
    if (!joined || !roomId) return;
    let interval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${roomId}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setRoomStatus(data.isLocked ? "locked" : data.status);
          if (data.drawnNumbers && !lastDrawn.includes(data.drawnNumbers[data.drawnNumbers.length - 1])) {
             setLastDrawn(formatLastDrawn(data.drawnNumbers));
          }
        }
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [joined, roomId, lastDrawn]);

  if (joined) {
    return (
      <Container fluid className="d-flex flex-column align-items-center py-1 mx-auto px-1" style={{ maxWidth: '420px' }}>
        <Card className="cyber-panel player-card w-100 border-0 shadow-lg overflow-hidden" style={{ borderRadius: '24px' }}>
          <Card.Body className="p-2">
            {/* VISOR PERSONALIZADO - STATUS E BOLA LADO A LADO */}
            <div className="visor-compact mb-2 rounded-4 d-flex flex-column overflow-hidden" style={{
              background: 'rgba(2,6,23,0.4)',
              border: '1px solid rgba(255,255,255,0.05)',
              minHeight: '85px',
              position: 'relative'
            }}>
              {/* BARRA SUPERIOR - APENAS NOME */}
              <div className="w-100 d-flex justify-content-center align-items-center px-2 py-2" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-white opacity-40 fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '2px' }}>
                  CARTELA DE {name.toUpperCase()}
                </span>
              </div>

              {/* ÁREA DE CONTEÚDO - STATUS (ESQUERDA) | BOLA (DIREITA) */}
              <div className="flex-grow-1 d-flex align-items-center justify-content-between px-3 py-1">
                {/* STATUS FIXO À ESQUERDA */}
                <div className="text-start" style={{ maxWidth: '45%' }}>
                   <div className="text-white opacity-50 fw-bold" style={{ fontSize: '0.55rem', letterSpacing: '1px', marginBottom: '-2px' }}>STATUS:</div>
                   <div className="text-info fw-bold" style={{ fontSize: '0.75rem', lineHeight: '1.2', letterSpacing: '0.5px' }}>
                     {getStatusText()}
                   </div>
                </div>

                {/* BOLA À DIREITA */}
                <div className="text-end flex-grow-1">
                  <div className="text-info fw-bold" style={{ 
                    fontSize: lastDrawn ? '2.5rem' : '1.3rem', 
                    fontFamily: 'var(--font-syncopate)', 
                    textShadow: lastDrawn ? '0 0 15px rgba(0,242,255,0.4)' : 'none', 
                    lineHeight: '1' 
                  }}>
                    {lastDrawn || 'BINGO!'}
                  </div>
                </div>
              </div>
            </div>

            {/* CARTELA */}
            <div className="table-responsive mb-2 overflow-hidden">
               <table className="w-100 m-0" style={{ borderCollapse: 'separate', borderSpacing: '2px' }}>
                 <thead>
                    {(gameMode === 75 || gameMode === 90) && (
                      <tr className="text-secondary opacity-50 fw-bold" style={{ fontSize: '0.7rem' }}>
                        <th>B</th><th>I</th><th>N</th><th>G</th><th>O</th>
                      </tr>
                    )}
                 </thead>
                 <tbody>
                   {cartela.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => {
                          const isFree = cell === "FREE";
                          const isMarked = isFree || marked.includes(cell);
                          return (
                            <td key={cIdx} className="p-0">
                              <div 
                                onClick={() => !isFree && toggleMark(cell)}
                                className={`d-flex align-items-center justify-content-center mx-auto ${isMarked ? 'pop-active' : ''}`}
                                style={{ 
                                  width: '100%', 
                                  aspectRatio: '1/1',
                                  fontSize: isFree ? '1rem' : 'clamp(0.85rem, 5vw, 1.1rem)', 
                                  fontWeight: 'bold', 
                                  borderRadius: '8px', 
                                  cursor: isFree ? 'default' : 'pointer',
                                  background: isMarked ? 'var(--primary)' : 'var(--glass-bg)',
                                  color: isMarked ? '#050505' : 'var(--text-muted)',
                                  border: isMarked ? '2px solid var(--primary)' : '1px solid var(--border)',
                                  boxShadow: isMarked ? '-2px 2px 0px 0px var(--accent)' : 'none',
                                  transition: 'all 0.1s'
                                }}>
                                {isFree ? "⭐" : cell}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                   ))}
                 </tbody>
               </table>
            </div>
            
            {/* BOTÃO BINGO MAIS COMPACTO */}
            <div className="d-flex justify-content-center mb-2">
              <button 
                className="btn-cyber btn-primary-cyber w-100 py-2 fw-bold shadow-lg" 
                style={{ fontSize: '1.2rem', letterSpacing: '4px', borderRadius: '16px' }} 
                onClick={() => socket && socket.emit('special_called', { roomId, playerName: name, type: 'bingo' })}>
                B I N G O
              </button>
            </div>

            {/* BATE-PAPO UNIFICADO COM PAINEL DE CONTROLE */}
            <div className="cyber-panel chat-panel d-flex flex-column" style={{ height: '220px', borderRadius: '20px', padding: '8px' }}>
              <h2 className="text-light fw-bold opacity-75 mb-2 pt-1 ps-1" style={{ fontFamily: 'var(--font-syncopate)', fontSize: '0.75rem' }}>BATE-PAPO</h2>
              <div ref={chatMessagesRef} className="flex-grow-1 overflow-auto bg-dark p-1 rounded-4 mb-2 shadow-inner" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                {messages.length > 0 ? messages.map((m, i) => {
                  const isAdmin = m.type === 'admin' || m.sender === 'SISTEMA';
                  const isBingo = m.type === 'system-bingo' || m.type === 'system-success' || m.text?.includes('🏆');
                  const isSystem = m.type?.startsWith('system') && !isBingo;
                  return (
                    <div key={i} className={`mb-2 small d-flex align-items-baseline text-start w-100 ${isBingo ? 'text-success fw-bold' : isAdmin ? 'text-info' : isSystem ? 'text-warning fw-bold' : 'text-light'}`}>
                      <span className="opacity-40 me-1" style={{ fontSize: '0.62rem' }}>[{m.time}] </span>
                      {isAdmin ? (
                        <img src="/mb_logo_01.png" style={{ height: '11px', verticalAlign: 'middle', marginRight: '5px', flexShrink: 0 }} alt="Logo" />
                      ) : (
                        <strong className={`${m.sender === name ? 'text-success' : 'text-info'}`} style={{ marginRight: '5px', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{m.sender}: </strong>
                      )}
                      <span className="text-wrap overflow-hidden" style={{ wordBreak: 'break-word', lineHeight: '1.2', fontSize: '0.78rem' }}>{m.text}</span>
                    </div>
                  );
                }) : (
                  <p className="text-muted small text-center mt-2 opacity-50" style={{ fontSize: '0.7rem' }}>Chat vazio</p>
                )}
              </div>
              <form onSubmit={sendMessage} className="d-flex gap-2">
                <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary" placeholder="Chat..." value={chatInput} onChange={e => setChatInput(e.target.value)} maxLength="100" />
                <button type="submit" className="btn btn-info btn-sm">➤</button>
              </form>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="d-flex flex-column align-items-center py-5 mx-auto px-3" style={{ maxWidth: '1600px' }}>
      <Card className="cyber-panel w-100 border-0 shadow-lg" style={{ maxWidth: '400px', borderRadius: '24px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2" style={{ borderRadius: '10px' }}>ENTRAR NA SALA</div>
          </div>
          <Form onSubmit={joinGame}>
            <Form.Group className="mb-4">
              <Form.Label className="text-light fw-bold small opacity-50">Código da Sala</Form.Label>
              <Form.Control type="text" placeholder="CÓDIGO" value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())} required 
                style={{ background: 'var(--glass-bg)', color: 'var(--accent)', border: '1px solid var(--border)', fontSize: '1.4rem', padding: '12px', letterSpacing: '4px', fontWeight: 'bold', textAlign: 'center', borderRadius: '16px' }} />
            </Form.Group>
            <Form.Group className="mb-5">
              <Form.Label className="text-light fw-bold small opacity-50">Seu Apelido</Form.Label>
              <Form.Control type="text" placeholder="Apelido" value={name} onChange={e => setName(e.target.value)} required 
                style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--border)', fontSize: '1.1rem', padding: '12px', textAlign: 'center', borderRadius: '16px' }} />
            </Form.Group>
            <button type="submit" className="btn-cyber btn-primary-cyber w-100 py-3 shadow-lg" style={{ borderRadius: '16px', fontSize: '1.1rem' }}>
              ENTRAR AGORA
            </button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
