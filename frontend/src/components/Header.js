"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Container, Dropdown } from "react-bootstrap";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [roomStatus, setRoomStatus] = useState("Aguardando");
  const [theme, setTheme] = useState("dark");

  const isPlayerPage = pathname?.startsWith('/jogar');
  const isOrganizerRoom = pathname?.includes('/organizador/dashboard') && !!roomId;

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("masterbingo-theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("masterbingo-theme", newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

        // Check user and room status
  useEffect(() => {
    const checkUser = () => {
      // For general user (org/admin)
      const stored = localStorage.getItem("organizadorData") || localStorage.getItem("adminData");
      
      // For player name (saved during join)
      const playerName = localStorage.getItem("mb_player_name");

      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      } else if (playerName) {
        setUser({ firstName: playerName, isPlayer: true });
      } else {
        setUser(null);
      }
    };

    const fetchStatus = async (id) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${id}`);
        if (res.ok) {
          const data = await res.json();
          const statusMap = { 'waiting': 'Aguardando', 'playing': 'Em Jogo', 'closed': 'Encerrada' };
          setRoomStatus(statusMap[data.status] || 'Ativa');
        }
      } catch (e) {
        console.error("Error fetching room status", e);
      }
    };

    if (typeof window !== "undefined") {
      checkUser();
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('room');
      if (id) {
        setRoomId(id);
        if (isPlayerPage) fetchStatus(id);
      } else {
        setRoomId("");
      }
    }
  }, [pathname, isPlayerPage]);

  const handleLogout = () => {
    localStorage.removeItem("organizadorData");
    localStorage.removeItem("adminData");
    setUser(null);
    router.push("/");
  };

  // Logout por inatividade (30 minutos)
  useEffect(() => {
    if (!user || isPlayerPage) return;

    let timeoutId;
    const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        alert("Sua sessão expirou por inatividade. Faça login novamente para continuar.");
      }, INACTIVITY_TIME);
    };

    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Inicia o timer

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, isPlayerPage]);

  return (
    <header className={`${isPlayerPage ? 'py-2' : 'py-3'} border-bottom shadow-sm`} style={{
      borderColor: 'rgba(255,255,255,0.05)',
      backgroundColor: 'rgba(2,6,23,0.9)',
      backdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 1000
    }}>
      <Container className="d-flex justify-content-between align-items-center">
        {/* Logo Section */}
        <div className="d-flex align-items-center gap-2 gap-md-3" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          <img 
            src="/mb_logo_01.png" 
            alt="Master Bingo Logo" 
            style={{ 
              height: isPlayerPage ? '28px' : '42px',
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
          
          {!isPlayerPage ? (
            <h1 className="mb-0 fw-bold d-none d-sm-block text-truncate" style={{
              fontFamily: 'var(--font-syncopate)',
              fontSize: '1.45rem',
              letterSpacing: '4px',
              color: 'var(--primary, #00f2ff)'
            }}>
              MASTER BINGO
            </h1>
          ) : (
            roomId && (
              <div className="d-flex align-items-center gap-2 border-start border-white border-opacity-10 ps-2 ps-md-3">
                <span className="text-white opacity-40 fw-bold" style={{ fontSize: '0.7rem' }}>SALA:</span>
                <span className="text-info fw-bold me-1" style={{ fontSize: '1rem', letterSpacing: '1.5px' }}>{roomId}</span>
              </div>
            )
          )}
        </div>

        {/* Action Section */}
        <div className="d-flex align-items-center gap-3">
          {/* Theme Toggle */}
          {(isPlayerPage || isOrganizerRoom) && (
            <button 
              className="btn btn-link p-2 text-white opacity-60 hover-opacity-100 transition-all border-0 shadow-none d-flex align-items-center" 
              onClick={toggleTheme}
              style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          )}

          {/* User / Auth Section */}
          {!isPlayerPage && (
            <div className="d-flex gap-3 align-items-center">
              {user ? (
                <Dropdown align="end">
                  <Dropdown.Toggle as="div" className="d-flex align-items-center gap-2 text-white text-decoration-none" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                    <i className="bi bi-person-circle text-info" style={{ fontSize: '1.2rem' }}></i>
                    <span className="opacity-70 d-none d-md-inline">
                      Bem vindo(a), {user.firstName || user.name || 'Usuário'} {user.lastName || ''}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="shadow-lg border-0 mt-3 p-2" style={{ borderRadius: '12px' }}>
                    <Dropdown.Item onClick={() => router.push('/organizador/dashboard')}>Painel</Dropdown.Item>
                    <Dropdown.Item onClick={() => router.push('/organizador/perfil')}>Perfil</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">Sair</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div className="d-flex gap-3">
                  <button onClick={() => router.push('/registrar')} className="btn btn-link text-white text-decoration-none p-0 small opacity-70">Cadastro</button>
                  <button onClick={() => router.push('/organizador')} className="btn btn-info btn-sm fw-bold px-3" style={{ borderRadius: '8px' }}>Log In</button>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
