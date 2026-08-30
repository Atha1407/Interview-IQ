import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ParticleBackground from '../ui/ParticleBackground'

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#050708] text-[#F3F1EA] relative selection:bg-[#7C8FB2]/20 selection:text-[#7C8FB2]">
      {/* Global Ambient Particle Atmosphere */}
      <ParticleBackground color="#7C8FB2" particleCount={75} maxDistance={120} className="fixed inset-0 pointer-events-none z-0" />

      <Navbar />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default AppLayout
