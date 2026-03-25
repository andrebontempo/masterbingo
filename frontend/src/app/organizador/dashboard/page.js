"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { Container, Row, Col, Badge, Spinner, Button, InputGroup, Form as RBForm } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { toast, Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const socket = useSocket();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const [gameMode, setGameMode] = useState(75);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastDrawn, setLastDrawn] = useState(null);
  const [autoMode, setAutoMode] = useState(0);
  const [players, setPlayers] = useState([]); // Nova lista de jogadores
  const [isLocked, setIsLocked] = useState(false); // Trancar sala
  const isLockedRef = useRef(isLocked);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  const [messages, setMessages] = useState([]); // Mensagens do Chat
  const [chatInput, setChatInput] = useState(""); // Input de chat
  const [voices, setVoices] = useState([]);
  const [selectedVoiceType, setSelectedVoiceType] = useState('male');
  const [frontendUrl, setFrontendUrl] = useState('');
  const [adminRooms, setAdminRooms] = useState([]); // Histórico de salas do admin
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setFrontendUrl(window.location.origin);
    const stored = localStorage.getItem("organizadorData");
    if (!stored) {
      router.push("/");
    } else {
      setAdmin(JSON.parse(stored));
    }

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    if (typeof window !== "undefined") {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [router]);

  useEffect(() => {
    if (admin?._id && !roomId) {
      const fetchAdminRooms = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/organizador/${admin._id}`);
          if (res.ok) setAdminRooms(await res.json());
        } catch (e) { console.error(e); }
      };
      fetchAdminRooms();
    }
  }, [admin, roomId]);

  useEffect(() => {
    if (socket && roomId) {
      const handleConnect = () => {
        socket.emit('join_room', roomId);
      };

      if (socket.connected) {
        socket.emit('join_room', roomId);
      }

      socket.on('connect', handleConnect);
      socket.on('chat_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });
      socket.on('special_called', (data) => {
        // Usamos o Ref para checar o valor ATUAL e travamos a execução dupla imediatamente
        if (isLockedRef.current === true) {
          isLockedRef.current = false; // Bloqueia execuções subsequentes instantaneamente
          
          // Trava no backend
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${roomId}/lock`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isLocked: false })
          });
          
          setIsLocked(false);
          setAutoMode(0);

          if (socket) {
            socket.emit('chat_message', {
              sender: 'SISTEMA',
              text: '⏸ BINGO PARADO AUTOMATICAMENTE. Aguardem Verificação...',
              type: 'system',
              time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
              roomId
            });
          }
        }
      });
      socket.on('player_joined', (data) => {
        setPlayers(prev => {
          if (prev.some(p => p.name === data.name)) return prev;
          return [...prev, { name: data.name }];
        });
      });

      return () => {
        socket.off('connect', handleConnect);
        socket.off('chat_message');
        socket.off('special_called');
        socket.off('player_joined');
      };
    }
  }, [socket, roomId]);

  const createRoom = async () => {
    try {
      if (!admin) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: admin._id, gameMode, adminEmail: admin.email })
      });
      const data = await res.json();
      setRoomId(data.roomId);
      setCalledNumbers([]);
      setLastDrawn(null);
      setHistory([]);
      setPlayers([]);
      setIsLocked(false);
      setMessages([
        { sender: 'SISTEMA', text: '🟢 Sala Aberta!', type: 'system', time: new Date().toLocaleTimeString('pt-BR', { hour12: false }) },
        { sender: 'SISTEMA', text: '⏳ Aguardando Jogadores...', type: 'system', time: new Date().toLocaleTimeString('pt-BR', { hour12: false }) }
      ]);
      if (socket) socket.emit('join_room', data.roomId);
    } catch (e) {
      console.error(e);
      alert('Backend is currently offline.');
    }
  };

  const getVoice = () => {
    const ptVoices = voices.filter(v => v.lang.toLowerCase().includes("pt"));

    if (ptVoices.length === 0) return voices[0]; // Fallback universal

    if (selectedVoiceType === 'female') {
      const female = ptVoices.find(v =>
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("maria") ||
        v.name.toLowerCase().includes("luciana") ||
        v.name.toLowerCase().includes("google português")
      );
      return female || ptVoices[0];
    } else {
      const male = ptVoices.find(v =>
        v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("daniel") ||
        v.name.toLowerCase().includes("felipe") ||
        v.name.toLowerCase().includes("google português")
      );
      return male || ptVoices[0];
    }
  };

  const speak = (num) => {
    if (selectedVoiceType === 'mute') return;
    const v = getVoice();
    if (!v) return;
    window.speechSynthesis.cancel();
    let text = `${num}`;
    if (gameMode === 75 || gameMode === 90) {
      const cols = ["B", "I", "N", "G", "O"];
      const letter = cols[Math.floor((num - 1) / (gameMode === 75 ? 15 : 18))];
      text = `${letter}. ${num}`;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v;
    u.lang = 'pt-BR'; // Força o motor de fala para português
    u.rate = selectedVoiceType === 'female' ? 1.0 : 0.9;
    u.pitch = selectedVoiceType === 'female' ? 1.1 : 0.8;
    window.speechSynthesis.speak(u);
  };

  const resetGame = async () => {
    if (!window.confirm("Deseja realmente iniciar um Novo Bingo? Isso encerrará a sala atual e removerá todos os jogadores conectados.")) return;

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${roomId}`, { method: 'DELETE' });

    setAutoMode(0);
    setCalledNumbers([]);
    setLastDrawn(null);
    setHistory([]);
    setPlayers([]);
    setIsLocked(false);
    setMessages([
      { sender: 'SISTEMA', text: '🟢 Sala Aberta!', type: 'system', time: new Date().toLocaleTimeString('pt-BR', { hour12: false }) },
      { sender: 'SISTEMA', text: '⏳ Aguardando Jogadores...', type: 'system', time: new Date().toLocaleTimeString('pt-BR', { hour12: false }) }
    ]);
    if (socket) socket.emit('close_room', roomId);
    setRoomId(null);
    if (admin) fetchAdminRooms(admin.id);
  };

  const resumeRoom = async (rid) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${rid}`);
      const data = await res.json();
      if (res.ok) {
        setRoomId(data.roomId);
        setGameMode(data.gameMode);
        setIsLocked(data.isLocked || false);
        setMessages([]); // Mensagens não são persistidas a princípio

        // Mapear drawnNumbers do banco para o estado local
        const drawn = data.drawnNumbers || [];
        setCalledNumbers(drawn);

        // Restaurar histórico
        const hist = drawn.map(n => ({ number: n, time: new Date().toLocaleTimeString() }));
        setHistory(hist);

        // Restaurar jogadores
        setPlayers(data.players || []);

        if (drawn.length > 0) {
          setLastDrawn(drawn[drawn.length - 1]);
        } else {
          setLastDrawn(null);
        }

        if (socket) {
          socket.emit('join_room', data.roomId);
        }
      } else {
        alert(data.message || "Erro ao retomar sala.");
      }
    } catch (e) {
      alert("Erro de conexão ao retomar sala.");
    }
  };

  const toggleLock = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${roomId}/lock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !isLocked })
      });
      if (res.ok) {
        setIsLocked(!isLocked);
        if (!isLocked && socket) {
          socket.emit('chat_message', {
            sender: 'SISTEMA',
            text: '🎯 BINGO EM ANDAMENTO. Boa sorte a Todos!!!',
            type: 'system',
            time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
            roomId
          });
        } else if (isLocked && socket) {
          socket.emit('chat_message', {
            sender: 'SISTEMA',
            text: '⏸ BINGO PARADO. Aguardem...',
            type: 'system',
            time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
            roomId
          });
        }
      }
    } catch (e) { console.error(e); }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    const msg = {
      sender: `👨‍💼 ${admin?.email?.split('@')[0]} (Org)`,
      text: chatInput,
      type: 'admin',
      time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
      roomId
    };
    socket.emit('chat_message', msg);
    setChatInput("");
  };

  const copyRoomUrl = () => {
    const url = `${frontendUrl}/jogar?room=${roomId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const closeRoomManually = async (rid) => {
    if (!window.confirm(`Deseja fechar permanentemente a sala ${rid}?`)) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${rid}`, { method: 'DELETE' });
      setAdminRooms(prev => prev.filter(r => r.roomId !== rid));
    } catch (e) { console.error(e); }
  };

  async function drawNumber() {
    if (!roomId) return alert("Crie uma sala primeiro!");
    if (calledNumbers.length >= gameMode) {
      setAutoMode(0);
      return alert("Todos sorteados!");
    }

    let n;
    do { n = Math.floor(Math.random() * gameMode) + 1; } while (calledNumbers.includes(n));

    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const newCalled = [...calledNumbers, n];
    setCalledNumbers(newCalled);
    setLastDrawn(n);
    setHistory(prev => [{ number: n, time: timeStr }, ...prev]);
    speak(n);

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${roomId}/draw`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: n })
    });

    let displayStr = `${n}`;
    if (gameMode === 75 || gameMode === 90) {
      const cols = ["B", "I", "N", "G", "O"];
      const letter = cols[Math.floor((n - 1) / (gameMode === 75 ? 15 : 18))];
      displayStr = `${letter} ${n}`;
    }
    if (socket) {
      socket.emit('draw_number', { roomId, number: n, display: displayStr });
      socket.emit('chat_message', {
        sender: 'SISTEMA',
        text: `🎱 Bola Sorteada: ${displayStr}`,
        type: 'system',
        time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
        roomId
      });
    }
  };

  useEffect(() => {
    if (autoMode === 0) return;
    if (calledNumbers.length >= gameMode) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      setAutoMode(0);
      return;
    }
    const timer = setTimeout(() => {
      drawNumber();
    }, autoMode);
    return () => clearTimeout(timer);
  }, [autoMode, calledNumbers, gameMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const getDisplayNumber = (num, mMode, locked = false) => {
    if (!num) return (
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 'clamp(1.2rem, 4vw, 2.2rem)',
          fontWeight: '900',
          letterSpacing: '8px',
          color: locked ? 'var(--accent)' : 'var(--primary)',
          textShadow: locked ? '0 0 30px var(--accent)' : '0 0 30px var(--primary)',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-syncopate)',
          lineHeight: '1.4',
          display: 'block'
        }}>
          {locked ? <>BINGO EM<br />ANDAMENTO</> : <>AGUARDANDO<br />JOGADORES</>}
        </span>
      </div>
    );
    if (mMode === 75 || mMode === 90) {
      const cols = ["B", "I", "N", "G", "O"];
      const letter = cols[Math.floor((num - 1) / (mMode === 75 ? 15 : 18))];
      return `${letter} ${num}`;
    }
    return `${num}`;
  };

  const startAutoDraw = (interval) => {
    setAutoMode(interval);
  };

  const drawManual = () => {
    setAutoMode(0);
    drawNumber();
  };

  const renderCols = () => {
    if (gameMode !== 75 && gameMode !== 90) {
      const rowsCount = gameMode / 10;
      const rows = [];
      for (let r = 0; r < rowsCount; r++) {
        const cells = [];
        for (let c = 1; c <= 10; c++) {
          const n = r * 10 + c;
          cells.push(<td key={n} className={calledNumbers.includes(n) ? "highlight" : ""}>{n}</td>);
        }
        rows.push(<tr key={r}>{cells}</tr>);
      }
      return rows;
    } else {
      const rowsCount = gameMode === 75 ? 15 : 18;
      const rows = [];
      for (let r = 1; r <= rowsCount; r++) {
        const cells = [];
        for (let c = 0; c < 5; c++) {
          const n = r + c * rowsCount;
          cells.push(<td key={n} className={calledNumbers.includes(n) ? "highlight" : ""}>{n}</td>);
        }
        rows.push(<tr key={r}>{cells}</tr>);
      }
      return rows;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Container fluid className="py-3 py-md-4 px-3 px-xl-5 mx-auto" style={{ maxWidth: '1600px' }}>
        {!roomId ? (
          <>
            <div className="mb-4 text-center">
              <h1 className="text-light fw-bold mb-0" style={{
                fontFamily: 'var(--font-syncopate)',
                fontSize: '1.2rem',
                letterSpacing: '4px',
                color: 'var(--primary, #00f2ff)'
              }}>
                PAINEL DE CONTROLE
              </h1>
            </div>
            {/* ─── CONTEÚDO PRINCIPAL ─── */}

            {/* ─── CONTEÚDO PRINCIPAL ─── */}
            <Row className="g-4 align-items-stretch">
              {/* TAG 2: INICIAR SALA */}
              <Col lg={7} className="order-2 order-lg-1">
                <div className="board-glass p-4 p-md-5 text-center d-flex flex-column align-items-center justify-content-center h-100" style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', minHeight: '380px' }}>
                  <div className="mb-4 text-info opacity-75">
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zM3 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm2 7a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-1.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
                      <path d="M14 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2z" />
                    </svg>
                  </div>
                  <h2 className="text-light fw-bold mb-3" style={{ fontFamily: 'var(--font-syncopate)', fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>ABRIR NOVA SALA</h2>
                  <p className="text-light opacity-60 mb-2" style={{ maxWidth: '380px' }}>
                    Selecione a quantidade de dezenas e inicie uma nova sala para seus jogadores.
                  </p>

                  <div className="mb-4">
                    <div className="tabs justify-content-center" style={{ background: 'var(--bg-dark)', borderRadius: '16px', padding: '4px' }}>
                      {[30, 75, 80, 90].map(m => (
                        <button key={m} className={gameMode === m ? "active" : ""} onClick={() => switchMode(m)}>{m}</button>
                      ))}
                    </div>
                  </div>

                  <button
                    className="btn-cyber btn-primary-cyber px-5 py-3 w-100 fw-bold rounded-4"
                    style={{ fontSize: '1.2rem', letterSpacing: '2px', boxShadow: 'var(--shadow)', maxWidth: '420px' }}
                    onClick={createRoom}
                  >
                    🎱 INICIAR SALA ({gameMode} Bolas)
                  </button>
                  <p className="mt-3 mb-0 text-light opacity-40 small">
                    Um código e QR Code serão gerados automaticamente.
                  </p>
                </div>
              </Col>

              {/* TAG 3: SUAS SALAS */}
              <Col lg={5} className="order-3 order-lg-2">
                <div className="cyber-panel p-4 h-100" style={{ border: '1px solid var(--border)', borderRadius: '16px', minHeight: '380px' }}>
                  <h3 className="text-light fw-bold mb-4 d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-syncopate)', fontSize: '0.9rem' }}>
                    SUAS SALAS
                    {adminRooms.length > 0 && (
                      <span className="badge bg-info ms-1">{adminRooms.length}</span>
                    )}
                  </h3>
                  <div className="d-flex flex-column gap-3" style={{ maxHeight: '440px', overflowY: 'auto' }}>
                    {adminRooms.length > 0 ? (
                      adminRooms.map(r => (
                        <div key={r.roomId} className="p-3 border rounded-4 bg-dark" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <div className="text-info fw-bold small">🏠 SALA: {r.roomId}</div>
                              <div className="text-white small opacity-75">{r.gameMode} Bolas • {r.players?.length || 0} Jogadores</div>
                            </div>
                            <div className="badge ms-2" style={{ background: r.status === 'playing' ? 'var(--accent)' : 'var(--border)', fontSize: '0.6rem' }}>
                              {r.status === 'playing' ? '● EM JOGO' : '● AGUARDANDO'}
                            </div>
                          </div>
                          <div className="d-flex gap-2 mt-2">
                            <button className="btn-cyber btn-primary-cyber btn-sm fw-bold flex-grow-1 py-2" onClick={() => resumeRoom(r.roomId)}>▶ Retomar</button>
                            <button className="btn-cyber btn-sm fw-bold py-2" style={{ background: 'transparent', border: '1px solid var(--secondary)', color: 'var(--secondary)', borderRadius: '8px', padding: '6px 14px' }} onClick={() => closeRoomManually(r.roomId)}>✕ Fechar</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-5 opacity-25">
                        <p className="fs-1">🧐</p>
                        <p className="small">Nenhuma sala encontrada.<br />Inicie uma nova sala ao lado.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </>
        ) : (
          <>
            {/* Room Sub-header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 p-3 rounded-4" style={{
              backgroundColor: 'rgba(2,6,23,0.4)',
              border: '1px solid rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="d-flex align-items-center gap-3">
                <h1 id="mainTitle" className="mb-0 fw-bold d-flex align-items-center gap-2" style={{
                  fontFamily: 'var(--font-syncopate)',
                  fontSize: '1.4rem',
                  letterSpacing: '2px',
                  color: 'white'
                }}>
                  {roomId ? `SALA: ${roomId}` : 'SETUP'}
                </h1>
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">ONLINE</span>
              </div>

              <button className="btn btn-outline-info fw-bold px-4 py-2" style={{ borderRadius: '12px' }} onClick={() => {
                setRoomId(null);
              }}>PAINEL DE CONTROLE</button>
            </div>

            <Row className="g-4">
              {/* LADO ESQUERDO: SORTEIO E TABELA */}
              <Col lg={12} xl={5}>
                <main>
                  <div
                    className="hero-stage mb-4"
                    style={{
                      minHeight: '260px',
                      padding: '20px'
                    }}
                  >
                    <div className="number-display pop text-center">
                      {getDisplayNumber(lastDrawn, gameMode, isLocked)}
                    </div>
                  </div>

                  {/* CONTROLES MOBILE: MESMA ORDEM E ESTRUTURA DO DESKTOP */}
                  <div className="d-block d-lg-none mb-4">
                    <section className="cyber-panel controls-panel p-3">
                      <div className="control-stack d-flex flex-column gap-2">

                        {/* BOTÃO JOGAR/PARAR (GRANDE) */}
                        <Button
                          variant={isLocked ? "danger" : "outline-info"}
                          className={`btn-cyber w-100 fw-bold mb-2 ${isLocked ? '' : 'glow-blue'}`}
                          onClick={toggleLock}
                          style={{ height: '60px', fontSize: '1.2rem', letterSpacing: '2px' }}
                        >
                          {isLocked ? '⏹ PARAR BINGO' : '▶ JOGAR BINGO'}
                        </Button>

                        {/* 1. NOVO BINGO */}
                        <button className="btn-cyber bg-transparent text-white border-secondary rounded-4 py-2 w-100" onClick={resetGame}>♻️ Novo Bingo</button>

                        {/* 2. AUTO 5S | AUTO 8S E SORTEAR */}
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-warning"
                            className={`flex-grow-1 btn-cyber py-2 ${!isLocked ? 'opacity-25' : ''}`}
                            onClick={() => startAutoDraw(5000)}
                            disabled={!isLocked || autoMode !== 0}
                          >
                            ⚡ Auto 5s
                          </Button>
                          <Button
                            variant="outline-success"
                            className={`flex-grow-1 btn-cyber py-2 ${!isLocked ? 'opacity-25' : ''}`}
                            onClick={() => startAutoDraw(8000)}
                            disabled={!isLocked || autoMode !== 0}
                          >
                            🐢 Auto 8s
                          </Button>
                        </div>

                        {/* 3. SORTEAR BOLA */}
                        {autoMode > 0 ? (
                          <button className="btn-cyber border-danger text-danger bg-transparent rounded-4 w-100 py-3 mt-1 mb-1 fw-bold" onClick={() => setAutoMode(0)}>⏹ Parar Sorteio Auto</button>
                        ) : (
                          <button disabled={!isLocked} className={`btn-cyber rounded-4 w-100 py-3 mt-1 mb-1 fw-bold ${!isLocked ? 'opacity-50' : 'btn-primary-cyber'}`} onClick={drawNumber} style={{ fontSize: '1.2rem', cursor: !isLocked ? 'not-allowed' : 'pointer' }}>SORTEAR BOLA</button>
                        )}

                        {/* 4. VOZ 1 | VOZ 2 | MUDO */}
                        <div className="d-flex gap-1 voice-switch w-100 border border-secondary shadow-sm rounded-4 overflow-hidden">
                          <button className={`flex-grow-1 py-2 ${selectedVoiceType === 'male' ? 'active' : ''}`} style={{ background: selectedVoiceType === 'male' ? 'var(--primary)' : 'transparent', border: 'none', color: 'white' }} onClick={() => setSelectedVoiceType('male')}>Voz 1</button>
                          <button className={`flex-grow-1 py-2 ${selectedVoiceType === 'female' ? 'active' : ''}`} style={{ background: selectedVoiceType === 'female' ? 'var(--primary)' : 'transparent', border: 'none', color: 'white' }} onClick={() => setSelectedVoiceType('female')}>Voz 2</button>
                          <button className={`flex-grow-1 py-2 ${selectedVoiceType === 'mute' ? 'active' : ''}`} style={{ background: selectedVoiceType === 'mute' ? '#dc3545' : 'transparent', border: 'none', color: 'white' }} onClick={() => setSelectedVoiceType('mute')}>Mudo</button>
                        </div>

                      </div>
                    </section>
                  </div>

                  <div className="board-glass p-3">
                    <table className="w-100">
                      <thead>
                        {(gameMode === 75 || gameMode === 90) && (
                          <tr>{["B", "I", "N", "G", "O"].map(c => <th key={c} className="text-center fs-5 pb-3 w-20 text-primary">{c}</th>)}</tr>
                        )}
                        {(gameMode !== 75 && gameMode !== 90) && (
                          <tr>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => <th key={c} className="text-center fs-6 pb-2 text-primary">{c}</th>)}</tr>
                        )}
                      </thead>
                      <tbody>{renderCols()}</tbody>
                    </table>
                  </div>
                </main>
              </Col>

              {/* MEIO: CONTROLES E QR CODE E HISTORICO */}
              <Col lg={6} xl={3}>
                <aside className="d-flex flex-column gap-3 h-100">
                  {/* CONTROLES DESKTOP: DESAPARECEM NO CELULAR PARA NÃO REPETIR */}
                  <section className="cyber-panel controls-panel d-none d-lg-block">
                    <h2 className="mb-3 text-light fw-bold fs-6 opacity-75" style={{ fontFamily: 'var(--font-syncopate)' }}>Controles</h2>
                    <div className="control-stack d-flex flex-column gap-3">
                      {/* JOGAR / PARAR (GRANDE) */}
                      <Button
                        variant={isLocked ? "danger" : "outline-info"}
                        className={`btn-cyber w-100 fw-bold ${isLocked ? '' : 'glow-blue'}`}
                        onClick={toggleLock}
                        style={{ height: '60px', fontSize: '1.2rem', letterSpacing: '2px' }}
                      >
                        {isLocked ? '⏹ PARAR BINGO' : '▶ JOGAR BINGO'}
                      </Button>

                      <button className="btn btn-outline-light btn-cyber py-2 w-100" onClick={resetGame}>
                        ♻️ Novo Bingo
                      </button>

                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-warning"
                          className={`flex-grow-1 btn-cyber py-2 ${!isLocked ? 'opacity-25' : ''}`}
                          onClick={() => startAutoDraw(5000)}
                          disabled={!isLocked || autoDrawActive}
                        >
                          ⚡ Auto 5s
                        </Button>
                        <Button
                          variant="outline-success"
                          className={`flex-grow-1 btn-cyber py-2 ${!isLocked ? 'opacity-25' : ''}`}
                          onClick={() => startAutoDraw(8000)}
                          disabled={!isLocked || autoDrawActive}
                        >
                          🐢 Auto 8s
                        </Button>
                      </div>

                      {autoMode > 0 ? (
                        <button className="btn-cyber border-danger text-danger bg-transparent rounded-4 w-100 py-3 mt-2 mb-2 fw-bold" onClick={() => setAutoMode(0)}>
                          ⏹ Parar Sorteio Auto
                        </button>
                      ) : (
                        <button disabled={!isLocked} className={`btn-cyber rounded-4 w-100 py-3 mt-2 mb-2 fw-bold ${!isLocked ? 'opacity-50' : 'btn-primary-cyber'}`} onClick={drawNumber} style={{ fontSize: '1.2rem', cursor: !isLocked ? 'not-allowed' : 'pointer' }}>
                          SORTEAR BOLA
                        </button>
                      )}

                      <div className="d-flex gap-1 voice-switch w-100 mt-2 border border-secondary shadow-sm rounded-4 overflow-hidden">
                        <button className={`flex-grow-1 py-1 ${selectedVoiceType === 'male' ? 'active' : ''}`} style={{ background: selectedVoiceType === 'male' ? 'var(--primary)' : 'transparent', border: 'none', color: 'white' }} onClick={() => setSelectedVoiceType('male')}>Voz 1</button>
                        <button className={`flex-grow-1 py-1 ${selectedVoiceType === 'female' ? 'active' : ''}`} style={{ background: selectedVoiceType === 'female' ? 'var(--primary)' : 'transparent', border: 'none', color: 'white' }} onClick={() => setSelectedVoiceType('female')}>Voz 2</button>
                        <button className={`flex-grow-1 py-1 ${selectedVoiceType === 'mute' ? 'active' : ''}`} style={{ background: selectedVoiceType === 'mute' ? '#dc3545' : 'transparent', border: 'none', color: 'white' }} onClick={() => setSelectedVoiceType('mute')}>Mudo</button>
                      </div>
                    </div>
                  </section>

                  <section className="cyber-panel qr-panel text-center p-2">
                    <h2 className="text-light fw-bold fs-6 opacity-75 mb-3 pt-2" style={{ fontFamily: 'var(--font-syncopate)' }}>QR CODE E LINK</h2>
                    <div className="d-flex justify-content-center bg-white mx-auto my-2" style={{ borderRadius: '16px', width: '100%', maxWidth: '300px' }}>
                      <QRCodeSVG value={`${frontendUrl}/jogar?room=${roomId}`} size={260} className="w-100 h-auto p-2" />
                    </div>
                    <p className="very-small text-light mb-3 opacity-50">Escaneie para entrar na sala.</p>

                    <div className="px-2 pb-2">
                      <InputGroup className="mb-2">
                        <RBForm.Control
                          readOnly
                          value={`${frontendUrl}/jogar?room=${roomId}`}
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border)',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            borderRadius: '8px 0 0 8px'
                          }}
                        />
                        <Button
                          variant="primary-cyber"
                          className="btn-cyber btn-sm px-3"
                          onClick={copyRoomUrl}
                          style={{ borderRadius: '0 8px 8px 0', fontSize: '0.8rem' }}
                        >
                          COPIAR
                        </Button>
                      </InputGroup>
                    </div>
                  </section>

                  {/* History panel removed as per user request (redundant with chat) */}

                </aside>
              </Col>

              {/* LADO DIREITO: CHAT E JOGADORES */}
              <Col lg={6} xl={4}>
                <aside className="d-flex flex-column gap-3 h-100">
                  {/* CHAT PANEL */}
                  <section className="cyber-panel chat-panel d-flex flex-column" style={{ height: '440px' }}>
                    <h2 className="text-light fw-bold fs-6 opacity-75 mb-3 pt-2" style={{ fontFamily: 'var(--font-syncopate)' }}>CHAT DA SALA</h2>
                    <div ref={chatMessagesRef} className="flex-grow-1 overflow-auto bg-dark p-2 rounded-4 mb-2 shadow-inner" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                      {messages.length > 0 ? messages.map((m, i) => (
                        <div key={i} className={`mb-2 small ${m.type === 'admin' ? 'text-info' : m.type.startsWith('system') ? 'text-warning fw-bold' : 'text-light'}`}>
                          <span className="opacity-50" style={{ fontSize: '0.7rem' }}>[{m.time}] </span>
                          {m.sender !== 'SISTEMA' && <strong>{m.sender}: </strong>}
                          <span>{m.text}</span>
                        </div>
                      )) : (
                        <p className="text-muted small text-center mt-4 pt-2 border-top border-secondary opacity-50">Sala de bate-papo.</p>
                      )}
                    </div>
                    <form onSubmit={sendMessage} className="d-flex gap-2 pb-1">
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        placeholder="Enviar um aviso..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        maxLength="150"
                      />
                      <button type="submit" className="btn btn-sm btn-info fw-bold px-3">ENVIAR</button>
                    </form>
                  </section>

                  {/* PLAYERS PANEL */}
                  <section className="cyber-panel players-panel overflow-hidden">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2 className="text-light fw-bold fs-6 opacity-75 m-0" style={{ fontFamily: 'var(--font-syncopate)' }}>
                        👥 {players.length} JOGADORES
                      </h2>
                    </div>
                    <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {players.length > 0 ? (
                        players.map((p, i) => (
                          <span key={i} className="badge bg-dark border border-secondary text-light px-2 py-2" style={{ borderRadius: '16px', fontSize: '0.8rem' }}>
                            👤 {p.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-light opacity-50 small mb-0 w-100 text-center">Aguardando...</p>
                      )}
                    </div>
                  </section>
                </aside>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
}
