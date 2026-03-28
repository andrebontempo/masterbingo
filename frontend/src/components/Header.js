"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Container, Dropdown } from "react-bootstrap";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  const isPlayerPage = pathname?.startsWith('/jogar');

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("organizadorData") || localStorage.getItem("adminData");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      } else {
        setUser(null);
      }
    };

    if (typeof window !== "undefined") {
      checkUser();
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("organizadorData");
    localStorage.removeItem("adminData");
    setUser(null);
    router.push("/");
  };

  return (
    <header className={`${isPlayerPage ? 'py-2 py-md-3' : 'py-3 py-md-4'} border-bottom shadow-sm`} style={{
      borderColor: 'rgba(255,255,255,0.05)',
      backgroundColor: 'rgba(2,6,23,0.9)',
      backdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 1000
    }}>
      <Container className="d-flex justify-content-between align-items-center">
        {/* Logo */}
        <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          <h1 className="mb-0 fw-bold" style={{
            fontFamily: 'var(--font-syncopate)',
            fontSize: isPlayerPage ? '1.2rem' : '1.8rem',
            letterSpacing: '4px',
            color: 'var(--primary, #00f2ff)'
          }}>
            MASTER BINGO
          </h1>
        </div>

        {/* Auth or User Info (Hidden on player pages for better space) */}
        {!isPlayerPage && (
          <div className="d-flex gap-4 align-items-center">
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="div"
                  className="d-flex align-items-center gap-1 text-white text-decoration-underline fw-bold"
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <span>Bem-vindo(a), {user.firstName || user.name || user.email?.split('@')[0]}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg border-0 py-2 mt-2" style={{
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  minWidth: '160px'
                }}>
                  <Dropdown.Item
                    onClick={() => router.push('/organizador/dashboard')}
                    className="py-2 px-4 text-dark"
                    style={{ fontWeight: 500 }}
                  >
                    Painel do Organizador
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => router.push('/organizador/perfil')}
                    className="py-2 px-4 text-dark"
                    style={{ fontWeight: 500 }}
                  >
                    A Minha Conta
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={handleLogout}
                    className="py-2 px-4 text-dark"
                    style={{ fontWeight: 500 }}
                  >
                    Sair
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <button
                  onClick={() => router.push('/registrar')}
                  className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-0"
                  style={{ fontSize: '0.9rem', fontWeight: 500 }}
                >
                  <span style={{ color: 'var(--primary, #00f2ff)' }}><i className="bi bi-person-plus"></i></span>
                  <span className="opacity-80">Criar uma conta</span>
                </button>
                <button
                  onClick={() => router.push('/organizador')}
                  className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-0"
                  style={{ fontSize: '0.9rem', fontWeight: 500 }}
                >
                  <span style={{ color: 'var(--primary, #00f2ff)' }}><i className="bi bi-box-arrow-in-right"></i></span>
                  <span className="opacity-80">Entre</span>
                </button>
              </>
            )}
          </div>
        )}
      </Container>
    </header>
  );
}
