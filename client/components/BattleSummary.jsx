'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Send } from "lucide-react"

const BattleSummary = ({ 
  battleWon, 
  opponentUsername, 
  passedTests, 
  opponentPassedTests, 
  submissionsLeft, 
  opponentSubmissionsLeft,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    setIsOpen(true)
  }, [battleWon, opponentUsername, passedTests, opponentPassedTests, submissionsLeft, opponentSubmissionsLeft])

  const player1 = {
    username: "You",
    // Assuming passedTests and submissionsLeft pertain to the current user
    testsPassed: passedTests,
    totalTests: 11, // You might want to pass this as a prop if it can vary
    submissions: submissionsLeft,
    ratingChange: battleWon ? 25 : -25 // Adjust logic as needed
  }

  const player2 = {
    username: opponentUsername,
    testsPassed: opponentPassedTests,
    totalTests: 11, // Similarly, adjust if needed
    submissions: opponentSubmissionsLeft,
    ratingChange: battleWon ? -25 : 25 // Opposite of player1
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const renderPlayerResult = (player, isWinner) => (
    <Card className={`w-full border-secondary`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <span>{player.username}</span>
            <span className={`ml-2 text-sm ${player.ratingChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              {player.ratingChange >= 0 ? `+${player.ratingChange}` : player.ratingChange}
            </span>
          </div>
          <Badge variant={isWinner ? "default" : "secondary"}>
            {isWinner ? "Winner" : "Runner-up"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Tests Passed:
            </span>
            <span>{player.testsPassed}/{player.totalTests}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <Send className="mr-2 h-4 w-4" />
              Submissions:
            </span>
            <span>{player.submissions}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const winner = battleWon ? player1 : player2

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="grid grid-cols-2 gap-4 mb-6">
        {renderPlayerResult(player1, winner === player1)}
        {renderPlayerResult(player2, winner === player2)}
      </div>
    </div>
  )
}

export default BattleSummary