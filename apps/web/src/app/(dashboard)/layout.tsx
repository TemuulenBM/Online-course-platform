import { Bell, Box, Home, LayoutGrid, Lock, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#2E3035] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 text-white shrink-0">
        <div className="flex items-center gap-3 w-[250px]">
          <div className="w-10 h-10 rounded-full bg-[#8A93E5] flex items-center justify-center shadow-inner">
            <Box className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-bold tracking-wide">EduView</span>
        </div>

        <nav className="flex items-center bg-[#1E1F23] rounded-full p-1.5 gap-1 shadow-inner">
          <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors shadow-sm">
            <Home className="w-4 h-4 text-[#8A93E5]" strokeWidth={2.5} />
            Dashboard
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
            <Lock className="w-4 h-4" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </nav>

        <div className="flex items-center justify-end gap-6 w-[250px]">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold tracking-wide">Hello, Jacob</span>
              <div className="flex items-center text-[11px] text-gray-400 gap-1 mt-0.5 font-medium">
                <span className="text-[#8A93E5] font-bold text-xs leading-none">⚡</span>
                Progress: 76%
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FFE5D3] overflow-hidden border-2 border-[#2E3035] shadow-sm flex items-center justify-center text-lg">
              👨🏼
            </div>
          </div>
          <button className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-gray-300 transition-colors border border-gray-600/50">
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FF6B6B] rounded-full ring-2 ring-[#2E3035]"></div>
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-white rounded-[2rem] md:rounded-[2.5rem] mx-2 md:mx-4 mb-2 md:mb-4 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 h-full">{children}</div>
      </main>
    </div>
  );
}
