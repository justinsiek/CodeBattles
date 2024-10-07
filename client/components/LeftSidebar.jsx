import { Button } from "@/components/ui/button"
import { Sword, Swords, Code, Users, History } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BattlePopup } from "@/components/battlePopup"

export function LeftSidebar() {
  return (
    <div className="w-64 border-r p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-6 group">
        <Sword className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        <h2 className="font-bold text-xl">CodeBattles</h2>
      </div>
      <nav className="space-y-2 mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start group">
              <Swords className="mr-2 h-4 w-4 transition-all duration-300 ease-in-out group-hover:animate-hop" />
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
    </div>
  )
}