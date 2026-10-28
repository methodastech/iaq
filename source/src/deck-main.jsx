import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import './styles/base.css'
import Presentation from './pages/Presentation.jsx'

/* 8 Oct 2026 (Bazil: "give me the zip file for this page only"). The exhibition deck on its own: deck.html loads this,
   and the package build (vite.config.deck.js, tools/pack-deck-1008.py) ships it with only the files the deck uses.
   A memory router, because the slides hold links that need a router but the deck never changes its address. */
createRoot(document.getElementById('root')).render(
  <MemoryRouter>
    <Routes>
      <Route path="*" element={<Presentation standalone />} />
    </Routes>
  </MemoryRouter>
)
