import ManagerNavbar from "@/src/components/manager-navbar";
import { getUnreadMessagesCount } from "../../actions/messages";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessagesCount();

  return (
    <div className="min-h-screen bg-[#faf8ff] flex">
      {/* Fixed Sidebar */}
      <ManagerNavbar unreadCount={unreadCount} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 w-full h-20 bg-white/60 backdrop-blur-xl border-b border-white/40 flex items-center justify-between px-10 shadow-sm">
          <div className="flex-1 max-w-xl relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors">🔍</span>
            <input 
              type="text" 
              placeholder="Cerca prenotazioni, pulizie o ticket..." 
              className="w-full bg-slate-100/50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/10 transition-all outline-none text-slate-600 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                <span className="text-xl">⚙️</span>
                <span className="text-xs font-semibold uppercase tracking-wider hidden lg:block">Impostazioni</span>
             </div>
             <div className="w-[1px] h-6 bg-slate-200" />
             <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-bold text-slate-900 leading-none">Roberto Corradino</p>
                   <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-widest mt-1">Property Manager</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold shadow-lg">
                   RC
                </div>
             </div>
          </div>
        </header>

        {/* Dashboard Main View */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
