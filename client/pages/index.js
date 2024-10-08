'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Swords } from "lucide-react"
import { useState } from "react"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { BattlePopup } from "@/components/battlePopup"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LeftSidebar } from "@/components/LeftSidebar"
import LoginPage from '@/components/login'

export default function Index() {
  const [username, setUsername] = useState(null)
  const [rating, setRating] = useState(1850)
  const [currentRank, setCurrentRank] = useState("Elite")
  const [nextRank, setNextRank] = useState("Expert")

  const handleLogin = (username) => {
    setUsername(username)
  }

  if (!username) {
    return <LoginPage onLogin={handleLogin} />
  }


  
  const recentMatches = [
    { opponent: "wasd", rating: 1900, result: "Win", ratingChange: 25 },
    { opponent: "demon1", rating: 1800, result: "Loss", ratingChange: -18 },
    { opponent: "target switcher", rating: 1850, result: "Win", ratingChange: 22 },
    { opponent: "jshawty", rating: 1820, result: "Win", ratingChange: 20 },
    { opponent: "tourist", rating: 2200, result: "Loss", ratingChange: -15 },
  ]

  const ratingData = [
    { match: 1, rating: 1850 },
    { match: 2, rating: 1832 },
    { match: 3, rating: 1879 },
    { match: 4, rating: 1861 },
    { match: 5, rating: 1825 },
    { match: 6, rating: 1893 },
    { match: 7, rating: 1847 },
    { match: 8, rating: 1876 },
    { match: 9, rating: 1839 },
    { match: 10, rating: 1902 },
    { match: 11, rating: 1868 },
    { match: 12, rating: 1815 },
    { match: 13, rating: 1884 },
    { match: 14, rating: 1857 },
    { match: 15, rating: 1850 },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <LeftSidebar username={username} rating={rating} />
      {/* Main Content */}
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-4xl font-bold">Welcome back, {username}!</h1>
          <p className="text-muted-foreground mt-2">Ready for your next challenge?</p>
        </header>
        <div className="grid grid-cols-2 gap-6">
          {/* Start Battle Card */}
          <Card className="col-span-2">
            <CardContent className="flex items-center justify-between p-6 bg-secondary">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Ready to Battle?</h2>
                <p className="text-muted-foreground">Challenge opponents and climb the ranks!</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="px-8">
                    <Swords className="mr-2 h-5 w-5" />
                    Find Battle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Battle Options</DialogTitle>
                  </DialogHeader>
                  <BattlePopup />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/*Rating Card*/}
          <Card className="col-span-1 lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-semibold">Your Rating</span>
                <span className="text-4xl font-bold">{rating}</span>
              </div>
              <div className="h-40 mr-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ratingData}>
                    <XAxis dataKey="match" tick={false} />
                    <YAxis domain={['dataMin - 20', 'dataMax + 20']} tick={false} axisLine={false} />
                    <Line type="monotone" dataKey="rating" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Tooltip content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        return (
                          <div className="bg-background p-2 rounded shadow">
                            <p className="text-foreground">{payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-4">
                <span>Current Rank: {currentRank}</span>
                <span>Next Rank: {nextRank}</span>
              </div>
            </CardContent>
          </Card>
          {/* Recent Matches */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                {recentMatches.map((match, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>{match.opponent} <span className="text-muted-foreground">{match.rating}</span></span>
                    <div>
                      <div className="flex items-center">
                        <div className="w-8">
                          <Badge variant={"outline"}>
                            {match.result}
                          </Badge>
                        </div>
                        <div className="w-12 text-right">
                          <span
                            className={`${match.ratingChange > 0 ? "text-green-500" : "text-red-500"}`}>
                            {match.ratingChange > 0 ? `+${match.ratingChange}` : match.ratingChange}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Friends Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                {[
                  { name: "bgates", rating: 2180 },
                  { name: "pandyrew", rating: 2080 },
                  { name: "scarface", rating: 2045 },
                  { name: "auswern", rating: 1990 },
                  { name: "mitsu", rating: 1980 },
                ].map((user, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>
                      {index + 1}. {user.name}
                    </span>
                    <span className="font-semibold">{user.rating}</span>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="w-64 border-l p-4">
        <h3 className="font-semibold mb-4">Top Performers</h3>
        <div className="space-y-4">
          {[
            { name: "tourist", rating: 2200, badge: "Grandmaster" },
            { name: "bgates", rating: 2180, badge: "Master" },
            { name: "blank", rating: 2150, badge: "Expert" },
          ].map((user, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.rating}</div>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {user.badge}
              </Badge>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <h3 className="font-semibold mb-4">Friends</h3>
        <div className="space-y-4">
          {[
            { name: "pandyrew", status: "Online" },
            { name: "scarface", status: "In Battle" },
            { name: "mitsu", status: "Offline" },
          ].map((opponent, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{opponent.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{opponent.name}</div>
                <div className="text-xs text-muted-foreground">{opponent.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}