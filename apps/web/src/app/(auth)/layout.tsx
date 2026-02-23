import { Box } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex font-sans">
      <div className="w-full min-h-screen flex overflow-hidden relative">
        {/* LEFT PANEL - Branding & Visuals (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col w-[45%] bg-[#8A93E5] p-12 relative overflow-hidden shrink-0 text-white justify-between">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
              <Box className="w-5 h-5 text-[#8A93E5]" strokeWidth={2} />
            </div>
            <span className="text-xl font-bold tracking-wide">EduView</span>
          </div>

          <div className="relative z-10 my-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm font-semibold border border-white/20">
              <span className="text-lg">🎓</span> E-Learning Platform
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
              Start your
              <br />
              learning journey
              <br />
              today
            </h1>
            <p className="text-white/80 text-sm font-medium leading-relaxed max-w-[300px]">
              Discover premium courses, track your progress, and join a community of lifelong
              learners.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 mt-auto">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#8A93E5] bg-blue-100 flex items-center justify-center text-xs shadow-sm">
                👨🏻
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#8A93E5] bg-pink-100 flex items-center justify-center text-xs shadow-sm">
                👩🏽
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#8A93E5] bg-green-100 flex items-center justify-center text-xs shadow-sm">
                👨🏾
              </div>
            </div>
            <span className="text-xs font-semibold text-white/90">Join 10k+ active students</span>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-[-5%] left-[-10%] w-72 h-72 rounded-full bg-indigo-900/10 blur-3xl"></div>

          <div className="absolute right-12 top-32 text-8xl opacity-10 rotate-12 drop-shadow-lg font-serif italic font-bold">
            A+
          </div>
          <div className="absolute right-24 bottom-32 text-6xl opacity-20 -rotate-12 drop-shadow-md">
            🚀
          </div>
          <div className="absolute top-24 left-1/2 text-white/30 text-lg">✦</div>
          <div className="absolute bottom-40 right-20 text-white/40 text-sm">✦</div>
        </div>

        {/* RIGHT PANEL - Form Area */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative overflow-y-auto">
          {/* Mobile header (only visible when left panel is hidden) */}
          <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8A93E5] flex items-center justify-center shadow-sm">
              <Box className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-xl font-bold tracking-wide text-gray-900">EduView</span>
          </div>

          <div className="w-full max-w-[420px] mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
