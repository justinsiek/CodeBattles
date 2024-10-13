'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Users, Swords } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"


export function BattlePopup({ socket }) {
  const [ratingRange, setRatingRange] = useState([1700, 2000])
  const [friendUsername, setFriendUsername] = useState("")

  const handleSendInvite = () => {
    console.log("sending invite to", friendUsername)
    socket.emit("sendInvite", { username: friendUsername })
  }

  useEffect(() => {
    // Check if socket exists and is connected
    if (socket && socket.connected) {
      console.log("BattlePopup: Socket is connected")
    } else {
      console.log("BattlePopup: Socket is not connected or undefined")
    }
  }, [socket])





  return (
    <div className="w-full">
      <Tabs defaultValue="random" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="random">Random Opponent</TabsTrigger>
          <TabsTrigger value="friend">Friend Battle</TabsTrigger>
        </TabsList>
        <TabsContent value="random">
          <Card>
            <CardHeader>
              <CardTitle>Battle Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-12">
              <div className="space-y-4">
                <Label htmlFor="ratingRange">Rating Range</Label>
                <div className="space-y-2">
                  <Slider
                    id="ratingRange"
                    min={0}
                    max={3000}
                    step={50}
                    value={ratingRange}
                    onValueChange={setRatingRange}
                    className="w-full" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{ratingRange[0]}</span>
                    <span>{ratingRange[1]}</span>
                  </div>
                </div>
              </div>
              <Button className="w-full" asChild>
                <a>
                  <Swords className="mr-2 h-4 w-4" />
                  Find Battle
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="friend">
          <Card>
            <CardHeader>
              <CardTitle>Invite a Friend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="friendUsername">Friend's Username</Label>
                <Input id="friendUsername" placeholder="Enter username" value={friendUsername} onChange={(e) => setFriendUsername(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Rated Battle?</Label>
              </div>
              <Button className="w-full" onClick={handleSendInvite}>
                <Users className="mr-2 h-4 w-4" />
                Send Invite
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}