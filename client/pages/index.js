'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Zap, Code, Users, Swords, Sword, History } from "lucide-react";
import { useState } from "react";

export default function Index() {
  const [username, setUsername] = useState("abg slayer");
  const [rating, setRating] = useState(1850);
  const [progress, setProgress] = useState(75);
  const [currentRank, setCurrentRank] = useState("Elite");
  const [nextRank, setNextRank] = useState("Master");

  return (
    (<div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-6">
          <Sword className="h-6 w-6" />
          <h2 className="font-bold text-xl">CodeBattles</h2>
        </div>
        <nav className="space-y-2 mb-6">
          <Button variant="ghost" className="w-full justify-start">
            <Zap className="mr-2 h-4 w-4" />
            Quick Battle
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Code className="mr-2 h-4 w-4" />
            Practice
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Friends
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <History className="mr-2 h-4 w-4" />
            Battle History
          </Button>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Welcome back, {username}!</h1>
          <p className="text-muted-foreground mt-2">Ready for your next challenge?</p>
        </header>
        <div className="grid grid-cols-2 gap-6">
          {/* Start Battle Card */}
          <Card className="col-span-2">
            <CardContent className="flex items-center justify-between p-6 bg-secondary">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Ready to Code?</h2>
                <p className="text-muted-foreground">Challenge opponents and climb the ranks!</p>
              </div>
              <Button size="lg" className="px-8">
                <Swords className="mr-2 h-5 w-5" />
                Start Battle
              </Button>
            </CardContent>
          </Card>

          {/*Rating Card*/}
          <Card className="col-span-1 lg:col-span-2">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-semibold">Your Rating</span>
                  <span className="text-4xl font-bold">{rating}</span>
                </div>
                <Progress value={progress} className="w-full h-3 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Current Rank: {currentRank}</span>
                  <span>Next Rank: {nextRank}</span>
                </div>
            </CardContent>
          </Card>
          {/* Recent Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px]">
                {[
                  { opponent: "pandyrew", rating: 1900, result: "Win", ratingChange: "+25" },
                  { opponent: "scarface", rating: 1800, result: "Loss", ratingChange: "-18" },
                  { opponent: "jshawty", rating: 1850, result: "Win", ratingChange: "+22" },
                  { opponent: "kanade", rating: 1820, result: "Win", ratingChange: "+20" },
                  { opponent: "mitsu", rating: 1780, result: "Loss", ratingChange: "-15" },
                ].map((match, index) => (
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
                            className={`${match.ratingChange.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                            {match.ratingChange}
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
              <CardTitle>Friends Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px]">
                {[
                  { name: "wasd", rating: 2150 },
                  { name: "target switcher", rating: 2080 },
                  { name: "demon1", rating: 2045 },
                  { name: "auswern", rating: 1990 },
                  { name: "Nora", rating: 800 },
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
            { name: "al0rante", rating: 2150, badge: "Expert" },
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
            { name: "Bob", status: "Online" },
            { name: "Alice", status: "In Battle" },
            { name: "Charlie", status: "Offline" },
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
    </div>)
  );
}