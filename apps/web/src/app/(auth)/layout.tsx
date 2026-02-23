import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE7F9] via-[#E0D6F5] to-[#D5CCF0] relative overflow-hidden font-sans selection:bg-[#8A93E5] selection:text-white">
      {/* Чимэглэлийн blur тойргууд */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#8A93E5]/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-[#FFD166]/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-[#FF9E67]/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[20%] left-[15%] w-[200px] h-[200px] bg-[#8A93E5]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Төвийн card */}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(138,147,229,0.12)] border border-white/60 animation-fade-in">
          {/* LEARNIFY лого */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-10">
            <div className="flex flex-col gap-[3px]">
              <div className="w-5 h-1.5 bg-[#FF6B6B] rounded-full rotate-[-45deg] origin-right ml-1" />
              <div className="w-5 h-1.5 bg-[#2E3035] rounded-full rotate-[-45deg] origin-right" />
              <div className="w-5 h-1.5 bg-[#8A93E5] rounded-full rotate-[-45deg] origin-right" />
            </div>
            <span className="text-xl font-extrabold tracking-wide uppercase text-[#1B1B1B]">
              Learnify
            </span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
