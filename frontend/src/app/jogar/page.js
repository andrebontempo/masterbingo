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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setDeviceId(id);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
        setLastDrawn(data.display || data.number);
      });
      socket.on('chat_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });
      socket.on('game_started', () => {
        setLastDrawn(null);
        setMarked([]);
      });
      socket.on('room_closed', () => {
        alert("A sala atual foi encerrada pelo Administrador.");
        window.location.href = '/'; 
      });

      return () => {
        socket.off('connect', handleConnect);
        socket.off('number_drawn');
        socket.off('chat_message');
        socket.off('game_started');
        socket.off('room_closed');
      };
    }
  }, [socket, joined, roomId, name]);

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
      setMessages(data.messages || []);

      if (socket) {
        socket.emit('join_room', { roomId, playerName: data.name, card: data.card });
        setJoined(true);
      }
    } catch(err) {
      console.log(err);
      alert("Servidor indisponível no momento.");
    }
  };

  const toggleMark = (num) => {
    setMarked(prev => prev.includes(num) ? prev.filter(n=>n!==num) : [...prev, num]);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    const msg = {
      sender: name,
      text: chatInput,
      type: 'user',
      time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
      roomId
    };
    socket.emit('chat_message', msg);
    setChatInput("");
  };

  if (joined) {
    return (
      <Container fluid className="d-flex flex-column align-items-center py-4 mx-auto" style={{ maxWidth: '1600px' }}>
        <h2 className="mb-4 text-center" style={{ fontSize: '1.2rem', fontFamily: 'var(--font-syncopate)', color: 'var(--primary)', letterSpacing: '2px', textShadow: '0 0 20px rgba(14, 165, 233, 0.5)' }}>
          SALA - {roomId}
        </h2>
        
        <div className="d-flex align-items-center justify-content-between bg-dark border shadow-sm rounded-4 w-100 px-4 py-2 mb-4" style={{ maxWidth: '420px', borderColor: 'rgba(255,255,255,0.1)' }}>
          <span className="text-light opacity-75 small fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>ÚLTIMA BOLA:</span>
          <div className="number-display pop m-0" style={{ fontSize: '2.5rem', color: 'var(--accent)', textShadow: '0 0 10px rgba(14,165,233,0.3)', minHeight: '40px' }}>
             {lastDrawn ? lastDrawn : <span style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', letterSpacing: '1px', color: 'var(--text-muted)' }}>AGUARDE</span>}
          </div>
        </div>

        <Card className="cyber-panel w-100 border-0 shadow-lg mb-4" style={{ maxWidth: '420px' }}>
          <Card.Body className="p-3 p-sm-4">
            <h4 className="text-center mb-4 text-light small">Cartela de <span style={{ color: 'var(--accent)' }}>{name}</span></h4>
            
          {/* 90-BALL: VINTAGE CARD LAYOUT */}
          {gameMode === 90 ? (
            <div className="bingo90-card mx-auto mb-4">
              {/* Card header */}
              <div className="bingo90-header">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <div key={n} className="bingo90-col-header">{n === 1 ? '1-9' : `${(n-1)*10}-${n === 9 ? 90 : n*10-1}`}</div>
                ))}
              </div>
              <div className="bingo90-body">
                {cartela.map((row, rIdx) => (
                  <div key={rIdx} className="bingo90-row">
                    {row.map((cell, cIdx) => {
                      const isEmpty = cell === null || cell === undefined;
                      const isMarked = !isEmpty && marked.includes(cell);
                      return (
                        <div
                          key={cIdx}
                          className={`bingo90-cell ${isEmpty ? 'bingo90-empty' : ''} ${isMarked ? 'bingo90-marked' : ''}`}
                          onClick={() => !isEmpty && toggleMark(cell)}
                        >
                          {isEmpty ? '' : cell}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="bingo90-footer">
                <span>BINGO 90 BOLAS</span>
                <span>Cartela de {name}</span>
              </div>
            </div>
          ) : (
            <div className="board-glass p-2 mb-4 mx-auto w-100" style={{ borderRadius: '16px', overflowX: 'hidden' }}>
              <table className="w-100 text-center m-0 p-0" style={{ tableLayout: 'fixed', borderSpacing: '4px', borderCollapse: 'separate' }}>
                <thead>
                  <tr>
                    {gameMode === 30 ? (
                      ["1", "2", "3"].map(l => (
                        <th key={l} className="small pb-2 text-primary fw-bold" style={{ fontFamily: 'var(--font-syncopate)' }}>
                          COL {l}
                        </th>
                      ))
                    ) : (
                      ["B", "I", "N", "G", "O"].map(letter => (
                        <th key={letter} className="small pb-2 text-primary fw-bold" style={{ fontFamily: 'var(--font-syncopate)' }}>
                           {letter}
                        </th>
                      ))
                    )}
                  </tr>
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
                                 fontSize: isFree ? '1.2rem' : 'clamp(1rem, 5vw, 1.4rem)', 
                                 fontWeight: 'bold', 
                                 borderRadius: '16px', 
                                 cursor: isFree ? 'default' : 'pointer',
                                 background: isMarked ? 'var(--primary)' : 'var(--glass-bg)',
                                 color: isMarked ? '#050505' : 'var(--text-muted)',
                                 border: isMarked ? '2px solid var(--primary)' : '1px solid var(--border)',
                                 boxShadow: isMarked ? '-4px 4px 0px 0px var(--accent)' : 'none',
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
          )}
            
            {/* BOTÃO DE DECLARAÇÃO */}
            <button 
              className="btn-cyber btn-primary-cyber w-100 py-4 shadow-sm fw-bold" 
              style={{ fontSize: '1.8rem', letterSpacing: '6px', borderRadius: '20px' }} 
              onClick={() => socket && socket.emit('special_called', { roomId, playerName: name, type: 'bingo' })}>
              B I N G O
            </button>

            {/* CHAT DO JOGADOR */}
            <div className="mt-5 cyber-panel chat-panel d-flex flex-column" style={{ height: '250px', borderRadius: '24px' }}>
              <div className="d-flex justify-content-between mb-3">
                <h5 className="text-light fw-bold fs-6 m-0" style={{ fontFamily: 'var(--font-syncopate)' }}>BATE-PAPO</h5>
              </div>
              <div className="flex-grow-1 overflow-auto bg-dark p-3 rounded-4 mb-3 shadow-inner" ref={chatMessagesRef} style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                {messages.length > 0 ? messages.map((m, i) => (
                  <div key={i} className={`mb-2 small ${m.type === 'admin' ? 'text-info fw-bold' : m.type.startsWith('system') ? 'text-warning fw-bold' : m.sender === name ? 'text-success' : 'text-light'}`}>
                    <span className="opacity-50" style={{ fontSize: '0.65rem' }}>[{m.time}] </span>
                    {m.sender !== 'SISTEMA' && <strong>{m.sender}: </strong>}
                    <span>{m.text}</span>
                  </div>
                )) : (
                  <p className="text-muted small text-center mt-3 pt-2 opacity-50">Diga um oi para todos!</p>
                )}
              </div>
              <form onSubmit={sendMessage} className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="Diga algo..." 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  maxLength="100"
                />
                <button type="submit" className="btn btn-info fw-bold px-4">➤</button>
              </form>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="d-flex flex-column align-items-center py-5 mx-auto" style={{ maxWidth: '1600px' }}>
      {/* Redundant large logo removed as it is now in the global header */}


      <Card className="cyber-panel w-100 border-0 shadow-lg" style={{ maxWidth: '450px' }}>
        <Card.Body className="p-4 p-md-5">
          <Alert variant="info" className="bg-transparent border-info text-info rounded-4 mb-4 text-center" style={{ fontSize: '0.9rem' }}>
            Participe digitando o código da sala.
          </Alert>
          <Form onSubmit={joinGame}>
            <Form.Group className="mb-4">
              <Form.Label className="text-light fw-bold small opacity-50">Código da Sala</Form.Label>
              <Form.Control type="text" placeholder="CÓDIGO" value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())} required 
                style={{ background: 'var(--glass-bg)', color: 'var(--accent)', border: '1px solid var(--border)', fontSize: '1.4rem', padding: '16px', letterSpacing: '4px', fontWeight: 'bold', textAlign: 'center', borderRadius: '16px' }} />
            </Form.Group>
            <Form.Group className="mb-5">
              <Form.Label className="text-light fw-bold small opacity-50">Seu Apelido</Form.Label>
              <Form.Control type="text" placeholder="Ex: André" value={name} onChange={e => setName(e.target.value)} required 
                style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--border)', fontSize: '1.2rem', padding: '16px', textAlign: 'center', borderRadius: '16px' }} />
            </Form.Group>
            <button type="submit" className="btn-cyber btn-primary-cyber w-100 py-3 shadow-lg" style={{ borderRadius: '16px', fontSize: '1.1rem', letterSpacing: '2px' }}>
              ENTRAR NA SALA
            </button>
          </Form>
        </Card.Body>
      </Card>

      {/* Link de administrador oculto para focar na tela do jogador */}
    </Container>
  );
}
