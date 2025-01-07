import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, X, Swords } from "lucide-react"

export function InviteAlert({ invite, onAccept, onDecline }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 30000) 

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <Card className="fixed bottom-4 right-4 w-72 shadow-lg animate-in slide-in-from-bottom-5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {invite.sender && invite.sender.length > 0 ? invite.sender[0].toUpperCase() : <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{invite.sender || 'Friend'}</h4>
              <p className="text-sm text-muted-foreground">Rating: {invite.senderRating || 'N/A'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onDecline} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm mb-4">has challenged you to a duel!</p>
        <p className="text-sm text-muted-foreground mb-4">
          {invite.isRated ? "Rated" : "Unrated"} match
        </p>
        <div className="flex justify-between">
          <Button variant="default" onClick={onAccept} className="w-full mr-2">
            <Swords className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button variant="outline" onClick={onDecline} className="w-full ml-2">
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
