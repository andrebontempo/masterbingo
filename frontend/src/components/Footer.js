"use client";
import React from "react";
import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="py-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(2,6,23,0.5)' }}>
      <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <p className="mb-0 opacity-30 small">© 2026 Master Bingo • Sua plataforma premium de eventos.</p>
        <div className="d-flex gap-4 opacity-50 small">
            <span style={{ cursor: 'pointer' }}>Privacidade</span>
            <span style={{ cursor: 'pointer' }}>Termos</span>
            <span style={{ cursor: 'pointer' }}>Suporte</span>
        </div>
      </Container>
    </footer>
  );
}
