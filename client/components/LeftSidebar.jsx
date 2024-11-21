import { Button } from "@/components/ui/button"
import { Sword, Swords, Code, Users, History } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BattlePopup } from "@/components/battlePopup"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from 'next/router'
import { getSocket } from "@/utils/socketManager"

export function LeftSidebar( {username, rating} ) {
  const router = useRouter()
  const socket = getSocket()

  const handleLogout = () => {
    socket.emit('disconnect')
    localStorage.removeItem('username')
    router.push('/login')
  }

  return (
    <div className="w-64 border-r pt-4 px-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-6">
        <Swords className="h-6 w-6" />
        <h2 className="font-bold text-xl">CodeBattles</h2>
      </div>
      <nav className="space-y-2 mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start group">
              <Sword className="mr-2 h-4 w-4 transition-all duration-300 ease-in-out group-hover:rotate-90" />
              Battle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Battle Options</DialogTitle>
            </DialogHeader>
            <BattlePopup />
          </DialogContent>
        </Dialog>
        <Button variant="ghost" className="w-full justify-start group">
          <Code className="mr-2 h-4 w-4 transition-all duration-300 ease-in-out group-hover:animate-hop" />
          Practice
        </Button>
        <Button variant="ghost" className="w-full justify-start group">
          <Users className="mr-2 h-4 w-4 transition-all duration-300 ease-in-out group-hover:animate-hop" />
          Friends
        </Button>
        <Button variant="ghost" className="w-full justify-start group">
          <History className="mr-2 h-4 w-4 transition-all duration-500 ease-in-out group-hover:rotate-[-360deg]" />
          Battle History
        </Button>
      </nav>
      <div className="mt-auto">
        <div 
          className="flex items-center space-x-4 mb-6 p-2 rounded-lg cursor-pointer transition-colors hover:bg-secondary group"
          onClick={handleLogout}
          role="button"
          title="Click to logout"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src="/avatars/01.png" alt="@username" />
            <AvatarFallback>{username ? username.charAt(0) : ' '}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold group-hover:text-primary">{username}</h2>
            <p className="text-sm text-muted-foreground">Rating: {rating}</p>
          </div>
        </div>
      </div>
    </div>
  )
}