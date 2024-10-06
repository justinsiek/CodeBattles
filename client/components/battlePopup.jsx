'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Users, Swords } from "lucide-react"

export function BattlePopup() {
  const [ratingRange, setRatingRange] = useState([1700, 2000])

  return (
    <div className="w-full">
      <Tabs defaultValue="random" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="random">Random Opponent</TabsTrigger>
          <TabsTrigger value="friend">Friend Battle</TabsTrigger>
        </TabsList>
        <TabsContent value="random">
          <Card>
            <CardHeader>
              <CardTitle>Battle Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="ratingRange">Rating Range</Label>
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
              <Button className="w-full">
                <Swords className="mr-2 h-4 w-4" />
                Find Battle
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="friend">
          <Card>
            <CardHeader>
              <CardTitle>Invite a Friend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="friendUsername">Friend's Username</Label>
                <Input id="friendUsername" placeholder="Enter username" />
              </div>
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Send Invite
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}