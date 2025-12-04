import WinningTasks from '@/components/WinningTasks'
import Sidebar from '@/components/Sidebar'

export default function Page(){
  return (
    <div className="flex min-h-[100svh] md:min-h-[100dvh] text-white bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-[100svh] md:min-h-[100dvh]">
        <WinningTasks />
      </main>
    </div>
  )
}
