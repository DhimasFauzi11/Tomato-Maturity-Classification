import React, { useState } from 'react';
import TomatoDetector from './components/TomatoDetector'; 
import { ScanEye, ScanLine, ArrowRight } from 'lucide-react'; 

function App() {
  // State untuk me-reset komponen detector saat tombol Mulai diklik
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    // TEMA: Background Stone Gelap dengan aksen Merah Maroon
    <div className="relative min-h-screen w-full font-sans overflow-hidden selection:bg-red-900 selection:text-white bg-stone-900">

      {/* --- 1. BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/tomat.jpg" 
          alt="Background Tomat" 
          className="w-full h-full object-cover opacity-80"
        />
        {/* Overlay Gradient: Stone Gelap ke Merah Maroon */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-red-950/60 backdrop-blur-[1px]"></div>
      </div>

      {/* --- 2. NAVBAR --- */}
      <nav className="relative z-50 px-6 py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50">
              <ScanEye className="text-orange-50 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-100 tracking-tight leading-none">
                Tomat<span className="text-red-500">ify</span>
              </h1>
              <p className="text-[10px] text-stone-400 font-medium tracking-wide uppercase mt-1">
                Smart Vision System
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md text-xs font-medium text-red-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              System Online
            </button>
          </div>
        </div>
      </nav>

      {/* --- 3. MAIN CONTENT --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-8 h-full min-h-[calc(100vh-100px)]">
        
        {/* BAGIAN KIRI: Judul & Deskripsi */}
        <div className="w-full lg:w-5/12 text-center lg:text-left space-y-5 pt-4 lg:pt-0">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <ScanLine className="w-3 h-3" />
            Pengolahan Citra Digital
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold text-stone-100 leading-tight">
            Sistem Klasifikasi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-300">
              Tingkat Kematangan Tomat
            </span>
          </h1>
          
          <p className="text-base text-stone-300 leading-relaxed max-w-md mx-auto lg:mx-0">
            Sistem cerdas berbasis pengolahan citra untuk mendeteksi kualitas dan fase kematangan tomat secara presisi menggunakan analisis warna.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-900/40 transition-all w-full sm:w-auto flex items-center justify-center gap-2 border border-red-700/50"
            >
              Mulai Analisis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BAGIAN KANAN: Panel Aplikasi */}
        <div className="w-full lg:w-7/12 mt-6 lg:mt-0">
          <div className="relative group">
            {/* Glow Effect Merah */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-800/30 to-orange-800/30 rounded-2xl blur-lg opacity-50"></div>
            
            {/* Container Kartu */}
            <div className="relative bg-stone-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 shadow-2xl min-h-[450px] flex flex-col">
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-semibold text-stone-100">Panel Deteksi</h3>
                  <p className="text-xs text-stone-400 mt-1">Format didukung: JPG, PNG, JPEG</p>
                </div>
                <div className="px-3 py-1 bg-red-900/30 border border-red-500/20 rounded text-red-300 text-xs font-mono">
                  READY
                </div>
              </div>
              
              {/* Load Komponen Detector */}
              <div className="flex-1 bg-stone-800/40 rounded-xl border-2 border-dashed border-stone-700 hover:border-red-500/40 transition-colors flex flex-col justify-center items-center p-4">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <TomatoDetector key={resetKey} />
                  </div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;