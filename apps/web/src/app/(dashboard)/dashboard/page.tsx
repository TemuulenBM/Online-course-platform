import { ArrowRight, BookOpen, Clock, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans">
      {/* LEFT COLUMN */}
      <div className="lg:col-span-4 flex flex-col gap-5 pb-8">
        {/* Olympiad Banner */}
        <div className="bg-[#8A93E5] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-sm h-[240px] flex flex-col">
          <div className="relative z-10 w-3/4">
            <h2 className="text-3xl font-bold leading-tight mb-2">
              A series of
              <br />
              Olympiads
            </h2>
            <p className="text-white/90 text-xs mb-4 leading-relaxed max-w-[200px] font-medium">
              A series of <span className="text-[#FFE5D3] font-bold">Olympiads</span> for erudite
              people from all over the world
            </p>
          </div>
          <button className="mt-auto w-12 h-12 bg-[#2E3035] rounded-full flex items-center justify-center hover:bg-black transition-colors z-10 shadow-lg">
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

          {/* Trophy placeholder & decorations */}
          <div className="absolute right-0 top-6 text-7xl rotate-12 drop-shadow-2xl z-0">🏆</div>
          <div className="absolute right-20 bottom-10 text-xl text-white/40 font-serif italic font-bold">
            y = ?
          </div>
          <div className="absolute top-6 right-1/2 text-white/60 text-lg">✦</div>
          <div className="absolute bottom-10 right-8 text-white/60 text-sm">✦</div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative bg-white rounded-[2rem] p-5 shadow-sm flex flex-col border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[1rem] bg-[#FFE5D3] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Lessons
              </span>
            </div>
            <div className="text-[2.5rem] font-bold text-center mt-2 tracking-tight">78</div>
          </div>

          <div className="relative bg-[#EBEDF9] rounded-[2rem] p-5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] flex flex-col border border-gray-50 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[1rem] bg-indigo-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#8A93E5]" />
              </div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Hours
              </span>
            </div>
            <div className="text-[2.5rem] font-bold text-center mt-2 tracking-tight">43</div>
          </div>
        </div>

        {/* Subjects Row */}
        <div className="flex items-center justify-between px-3 py-1 bg-white rounded-full text-sm font-medium shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-full cursor-pointer transition-colors">
            <span className="text-lg">📚</span>
            <span className="text-gray-800 text-xs font-semibold">Literature</span>
          </div>
          <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-full cursor-pointer transition-colors">
            <span className="text-lg">🧮</span>
            <span className="text-gray-800 text-xs font-semibold">Math</span>
          </div>
          <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-full cursor-pointer transition-colors">
            <span className="text-lg">🧬</span>
            <span className="text-gray-800 text-xs font-semibold">Biology</span>
          </div>
        </div>

        {/* Gray Course Card */}
        <div className="bg-[#2E3035] rounded-[2rem] p-6 text-white relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FFE5D3]"></div>
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/10 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 mb-4 mt-1">
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full border border-[1.5px] border-[#FFE5D3]"></div>
            </div>
            <span className="text-[9px] font-bold tracking-widest text-[#FFE5D3] uppercase">
              Geometry in action
            </span>
          </div>

          <h3 className="text-[22px] font-bold mb-8 pr-8 leading-[1.15] text-[#F4F5FA]">
            Creative approaches to
            <br />
            plane shapes
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-3">
              <div className="w-9 h-9 rounded-full border-2 border-[#2E3035] bg-blue-100 flex items-center justify-center text-sm shadow-sm">
                👨🏻
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-[#2E3035] bg-pink-100 flex items-center justify-center text-sm shadow-sm">
                👩🏽
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-[#2E3035] bg-green-100 flex items-center justify-center text-sm shadow-sm">
                👨🏾
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-[#2E3035] bg-gray-700 flex items-center justify-center text-xs font-medium text-white shadow-sm z-10">
                +43
              </div>
            </div>

            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-md group-hover:scale-105 transition-transform z-10">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Decorative swirl background */}
          <div className="absolute -bottom-16 -right-10 w-48 h-48 border-[24px] border-white/[0.03] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-4 w-48 h-48 border-[24px] border-white/[0.03] rounded-full pointer-events-none"></div>
        </div>

        {/* Purple Course Card */}
        <div className="bg-[#CAD2FF] rounded-[2rem] p-6 relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer pb-8">
          <div className="absolute top-5 right-5 bg-[#2E3035] rounded-full p-2 text-white group-hover:scale-105 transition-transform shadow-md">
            <ExternalLink className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-xs bg-white/30">
              🧬
            </div>
            <span className="text-[9px] font-bold tracking-widest text-black/60 uppercase">
              The microcosm around us
            </span>
          </div>

          <h3 className="text-[22px] font-bold text-gray-900 leading-tight">Discoveries in cell</h3>

          {/* Bottom decorative waves */}
          <div className="absolute -bottom-4 right-0 text-6xl opacity-30 pointer-events-none">
            🌊
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between mt-2 pt-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Progress</h1>
          <button className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-95">
            <div className="w-5 h-5 bg-[#EBEDF9] rounded flex items-center justify-center">
              <div className="w-3 h-3 border-t-2 border-b-2 border-[#8A93E5]"></div>
            </div>
            All subjects
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Orange Chart Card */}
        <div className="bg-[#FF9E67] rounded-[2rem] p-7 text-[#5B3E31] relative overflow-hidden shadow-sm h-[320px] flex flex-col pt-7 mt-2">
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full border-[60px] border-white/10 opacity-60 pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10 mb-8">
            <div className="w-12 h-12 bg-[#2E3035] rounded-full flex items-center justify-center text-white shadow-xl shadow-black/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-4" />
              </svg>
            </div>
            <div className="bg-[#5B3E31]/20 rounded-full p-1.5 flex relative shadow-inner backdrop-blur-sm">
              <div className="absolute left-1.5 top-1.5 w-[85px] h-[34px] bg-[#2E3035] rounded-full transition-all shadow-md"></div>
              <button className="relative z-10 w-[85px] h-[34px] text-xs font-bold text-white tracking-wide uppercase">
                Weekly
              </button>
              <button className="relative z-10 w-[85px] h-[34px] text-xs font-bold text-[#5B3E31] tracking-wide uppercase hover:bg-black/5 transition-colors rounded-full rounded-l-none">
                Month
              </button>
            </div>
          </div>

          <div className="flex items-end gap-6 relative z-10 mb-6 border-b border-[#5B3E31]/10 pb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-[2.75rem] font-extrabold tracking-tight leading-none">48</span>
              <span className="font-bold opacity-80 text-sm">lessons</span>
            </div>
            <div className="h-10 w-px bg-[#5B3E31]/15 mb-1"></div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight leading-none">12</span>
              <span className="font-bold opacity-80 text-sm">hours</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 flex items-end justify-between px-2 relative z-10 mt-1">
            {/* Bar 1 */}
            <div className="flex flex-col items-center gap-2 group w-12">
              <div className="bg-[#5B3E31]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-0 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                39
              </div>
              <div className="w-10 h-[90px] bg-[#5B3E31]/40 rounded-full relative overflow-hidden group-hover:bg-[#5B3E31]/50 transition-colors shadow-inner flex flex-col justify-end">
                <div className="w-full h-[60%] bg-[#5B3E31] rounded-b-full rounded-t-[4px]"></div>
              </div>
              <span className="text-[11px] font-bold opacity-60">Mon</span>
            </div>
            {/* Bar 2 */}
            <div className="flex flex-col items-center gap-2 group w-12">
              <div className="bg-[#5B3E31]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-0 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                14
              </div>
              <div className="w-10 h-[40px] bg-[#5B3E31]/40 rounded-full relative overflow-hidden group-hover:bg-[#5B3E31]/50 transition-colors shadow-inner flex flex-col justify-end">
                <div className="w-full h-[100%] bg-[#5B3E31] rounded-full"></div>
              </div>
              <span className="text-[11px] font-bold opacity-60">Tue</span>
            </div>
            {/* Bar 3 (Active) */}
            <div className="flex flex-col items-center gap-2 group relative -top-3 w-12">
              <div className="bg-[#5B3E31] text-white text-[11px] font-extrabold px-3 py-1 rounded-full mb-0 shadow-lg shadow-black/20 translate-y-1 z-20">
                48
              </div>
              <div className="w-12 h-[130px] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.15),rgba(255,255,255,0.15)_6px,transparent_6px,transparent_12px)] bg-[#5B3E31] rounded-[14px] shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform origin-bottom">
                {/* Stripes inner wrapper */}
                <div className="w-[85%] h-[97%] rounded-[10px] bg-[repeating-linear-gradient(45deg,rgba(255,158,103,0.3),rgba(255,158,103,0.3)_4px,transparent_4px,transparent_8px)]"></div>
              </div>
              <span className="text-[11px] font-bold text-white mt-1">Wed</span>
            </div>
            {/* Bar 4 */}
            <div className="flex flex-col items-center gap-2 group w-12">
              <div className="bg-[#5B3E31]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-0 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                24
              </div>
              <div className="w-10 h-[70px] bg-[#5B3E31]/40 rounded-full relative overflow-hidden group-hover:bg-[#5B3E31]/50 transition-colors shadow-inner flex flex-col justify-end">
                <div className="w-full h-[50%] bg-[#5B3E31] rounded-b-full rounded-t-[4px]"></div>
              </div>
              <span className="text-[11px] font-bold opacity-60">Thr</span>
            </div>
            {/* Bar 5 */}
            <div className="flex flex-col items-center gap-2 group w-12">
              <div className="bg-[#5B3E31]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-0 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                22
              </div>
              <div className="w-10 h-[100px] bg-[#5B3E31]/40 rounded-full relative overflow-hidden group-hover:bg-[#5B3E31]/50 transition-colors shadow-inner flex flex-col justify-end">
                <div className="w-full h-[70%] bg-[#5B3E31] rounded-b-full rounded-t-[4px]"></div>
              </div>
              <span className="text-[11px] font-bold opacity-60">Fri</span>
            </div>
          </div>
        </div>

        {/* Rating of Students */}
        <div className="bg-[#F4F5FA] rounded-full p-2.5 pl-3 flex items-center justify-between border border-gray-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)] cursor-pointer hover:bg-gray-100 hover:shadow-sm transition-all active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#FFD166] rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="white"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="flex flex-col -mt-0.5">
              <div className="text-[15px] font-extrabold text-gray-900 tracking-tight">
                Rating of students
              </div>
              <div className="text-xs text-gray-500 font-semibold tracking-wide mt-0.5">
                10 best students
              </div>
            </div>
          </div>
          <div className="flex -space-x-2.5 pr-2">
            <div className="w-[34px] h-[34px] rounded-full border-2 border-[#F4F5FA] bg-pink-100 flex items-center justify-center text-sm shadow-sm z-30">
              👩🏽
            </div>
            <div className="w-[34px] h-[34px] rounded-full border-2 border-[#F4F5FA] bg-blue-100 flex items-center justify-center text-sm shadow-sm z-20">
              👨🏻
            </div>
            <div className="w-[34px] h-[34px] rounded-full border-2 border-[#F4F5FA] bg-green-100 flex items-center justify-center text-sm shadow-sm z-10">
              👨🏾
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div className="flex flex-col gap-2 flex-1 justify-end pb-2">
          {/* Lesson 1 */}
          <div className="flex items-center justify-between p-3 rounded-[1.5rem] hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFE5D3] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="text-xl">🔍</span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-[15px] font-extrabold text-gray-900">Introduction</div>
                <div className="text-xs text-gray-500 font-semibold mt-0.5 tracking-wide">
                  1 lesson
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[#8A93E5] pr-2 bg-[#8A93E5]/10 px-3 py-1.5 rounded-full font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] tracking-wider translate-y-px">4:54</span>
            </div>
          </div>

          {/* Lesson 2 */}
          <div className="flex items-center justify-between p-3 rounded-[1.5rem] hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E4E8FA] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8A93E5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-[15px] font-extrabold text-gray-900">Base part</div>
                <div className="text-xs text-gray-500 font-semibold mt-0.5 tracking-wide">
                  4 lesson
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[#8A93E5] pr-2 bg-[#8A93E5]/10 px-3 py-1.5 rounded-full font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] tracking-wider translate-y-px">3:00</span>
            </div>
          </div>

          {/* Lesson 3 */}
          <div className="flex items-center justify-between p-3 rounded-[1.5rem] hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100 mb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0C2] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="text-xl">🎓</span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-[15px] font-extrabold text-[#2E3035] opacity-60">Test</div>
                <div className="text-xs text-gray-500 font-semibold mt-0.5 tracking-wide opacity-80">
                  1 lesson
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6B6B]/15 text-[#FF6B6B] mr-1 group-hover:bg-[#FF6B6B] group-hover:text-white transition-colors shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Calendar Widget */}
        <div className="flex flex-col mt-2 pt-1 gap-1">
          <h2 className="text-2xl font-black text-gray-900 leading-tight flex items-center gap-2 tracking-tight">
            Today's reading
            <br />
            is ready 📚
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg drop-shadow-sm">📙</span>
            <span className="text-sm font-extrabold text-[#FF8540] tracking-wide">
              Charge your mind
            </span>
          </div>

          <div className="flex items-center justify-between mt-5 bg-white rounded-full px-5 py-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100/50">
            <div className="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-transform">
              <span className="text-[11px] font-extrabold text-gray-400 group-hover:text-gray-900 transition-colors">
                Mon
              </span>
              <span className="text-[22px] font-black text-gray-900">20</span>
              <span className="text-xs drop-shadow-sm">📕</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-transform">
              <span className="text-[11px] font-extrabold text-gray-400 group-hover:text-gray-900 transition-colors">
                Tue
              </span>
              <span className="text-[22px] font-black text-gray-900">21</span>
              <span className="text-xs drop-shadow-sm">📕</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 relative cursor-pointer group hover:-translate-y-1 transition-transform">
              <span className="text-[11px] font-extrabold text-gray-900">Wed</span>
              <span className="text-[22px] font-black text-gray-900">22</span>
              <span className="text-xs drop-shadow-sm">📗</span>
              {/* Active dot */}
              <div className="absolute -top-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm ring-2 ring-white"></div>
            </div>
            <div className="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-transform">
              <span className="text-[11px] font-extrabold text-gray-900">Thr</span>
              <span className="text-[22px] font-black text-gray-900">23</span>
              <span className="text-xs drop-shadow-sm">📗</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-transform">
              <span className="text-[11px] font-extrabold text-gray-900">Fri</span>
              <span className="text-[22px] font-black text-gray-900">24</span>
              <span className="text-xs drop-shadow-sm">📗</span>
            </div>
          </div>
        </div>

        {/* Progress performance */}
        <div className="bg-[#F4F5FA] rounded-[2rem] p-5 border border-gray-50 shadow-sm flex flex-col gap-4 relative overflow-hidden mt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-[15px] tracking-tight">
              Progress performance
            </h3>
            <button className="text-gray-400 hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>

          {/* Chart */}
          <div className="flex items-end justify-between h-[105px] mt-1 gap-2 relative z-10 w-full px-1">
            {/* Background gradient block spanning behind */}
            <div className="absolute bottom-7 left-0 w-full h-8 bg-black/[0.04] rounded-[10px] -z-10"></div>
            <div className="absolute bottom-7 left-0 w-full h-[1px] bg-black/[0.08] -z-10"></div>

            <div className="flex flex-col items-center w-full group">
              <div className="w-full h-[45px] bg-[#FFD166] rounded-t-xl rounded-b-md mb-2 shadow-inner group-hover:bg-[#FFC033] transition-colors relative">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2E3035] text-white text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                  23
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-500">June</span>
              <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                23 lessons
              </span>
            </div>

            <div className="flex flex-col items-center w-full group">
              <div className="w-full h-[85px] bg-[#8A93E5] rounded-t-xl rounded-b-md mb-2 shadow-inner group-hover:bg-[#7C80EF] transition-colors relative shadow-xl shadow-indigo-500/25 z-10 scale-[1.03]">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2E3035] text-white text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                  43
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-900">July</span>
              <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                43 lessons
              </span>
            </div>

            <div className="flex flex-col items-center w-full group">
              <div className="w-full h-[35px] bg-[#D4D6DD] rounded-t-xl rounded-b-md mb-2 shadow-inner group-hover:bg-[#C4C6CD] transition-colors relative">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2E3035] text-white text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                  12
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-500">August</span>
              <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                12 lessons
              </span>
            </div>
          </div>
        </div>

        {/* Reading Routine Banner */}
        <div className="bg-[#8A93E5] rounded-[2rem] p-4 flex items-center gap-4 text-white shadow-[0_4px_20px_-5px_rgba(138,147,229,0.4)] relative overflow-hidden group hover:shadow-[0_8px_25px_-5px_rgba(138,147,229,0.5)] transition-all cursor-pointer border-2 border-transparent hover:border-white/10 mt-1">
          {/* Decor icons */}
          <div className="absolute top-3 right-6 text-white/40 text-lg pointer-events-none">✦</div>
          <div className="absolute bottom-2 left-1/2 text-white/40 text-xs pointer-events-none">
            ✦
          </div>
          <div className="absolute -right-4 -bottom-6 text-6xl opacity-20 pointer-events-none group-hover:rotate-12 transition-transform duration-500">
            📚
          </div>

          <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 ml-1">
            <span className="text-3xl drop-shadow-md -rotate-12">📘</span>
          </div>

          <div className="flex flex-col z-10 py-1">
            <div className="text-[11px] font-bold tracking-widest uppercase text-white/95 mb-0.5">
              Reading routine
            </div>
            <div className="text-base font-extrabold leading-tight mb-2 tracking-tight">
              Increase your memory
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FFD166] bg-black/15 w-fit px-2.5 py-1 rounded-full border border-white/5 shadow-inner">
              <span className="text-xs">🏆</span> Reading 3 days
            </div>
          </div>
        </div>

        {/* Recommended for you */}
        <div className="flex flex-col gap-3 flex-1 justify-end pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-[15px] tracking-tight">
              Recommended for you
            </h3>
            <button className="text-gray-400 hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 h-[185px]">
            {/* Card 1 */}
            <div className="bg-[#F6EFE5] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-[#EBE3D7]/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[12px] font-black uppercase leading-[1.15] text-[#5B3E31] z-10 tracking-[0.08em] pr-2">
                Discovering
                <br />
                the wonders
                <br />
                of science
              </div>

              {/* Illustrations placeholder */}
              <div className="absolute bottom-0 left-0 w-full h-28 pointer-events-none mt-auto">
                {/* Arch background */}
                <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[80%] h-[75%] bg-[#E8CCA6] rounded-t-[40px] opacity-40"></div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[45px] transition-transform group-hover:-translate-y-3 duration-500 drop-shadow-lg z-10 group-hover:rotate-12">
                  🚀
                </div>
                <div className="absolute bottom-3 -left-3 text-[42px] opacity-90 drop-shadow-md">
                  ⏰
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#1C68A6] rounded-3xl p-4 flex flex-col justify-center items-center relative overflow-hidden group cursor-pointer shadow-[0_4px_15px_-3px_rgba(28,104,166,0.3)] hover:shadow-[0_8px_20px_-3px_rgba(28,104,166,0.5)] transition-shadow">
              {/* Background circular shapes overlay */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border-[15px] border-[#2B7DBD]/60 pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full border-[20px] border-[#2B7DBD]/60 pointer-events-none"></div>

              {/* Cloud / Badge shape */}
              <div className="bg-[#FFF8E7] text-[#1C68A6] w-[105%] h-[60%] flex items-center justify-center p-2 text-center -rotate-6 z-10 shadow-xl group-hover:rotate-0 group-hover:scale-105 transition-all duration-400 rounded-[2.5rem] border-[6px] border-white">
                <span className="text-[13px] font-black uppercase leading-[1.1] tracking-[0.08em] block drop-shadow-sm">
                  Welcome back
                  <br />
                  to school
                </span>
              </div>

              {/* Small deco stars */}
              <div className="absolute top-4 left-5 text-[#FFF8E7]/60 text-lg group-hover:rotate-45 transition-transform duration-500">
                ✦
              </div>
              <div className="absolute bottom-4 right-5 text-[#FFF8E7]/60 text-sm group-hover:rotate-90 transition-transform duration-500">
                ✦
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
