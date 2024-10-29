"use client"

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Send, Trophy, User, Clock, GitPullRequest, Home } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Link from "next/link"

export default function BattleSummary({ isOpen, onClose, battleWon, opponentUsername, passedTests, opponentPassedTests, submissionsLeft, opponentSubmissionsLeft, battleDuration }) {
  const player1 = {
    username: "You",
    testsPassed: passedTests,
    totalTests: 11,
    submissions: submissionsLeft,
    ratingChange: battleWon ? 25 : -25
  }

  const player2 = {
    username: opponentUsername,
    testsPassed: opponentPassedTests,
    totalTests: 11,
    submissions: opponentSubmissionsLeft,
    ratingChange: battleWon ? -25 : 25
  }

  const winner = battleWon ? player1 : player2

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const renderPlayerResult = (player, isWinner) => (
    <Card className={`w-full ${isWinner ? 'border-primary' : 'border-secondary'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            <span>{player.username}</span>
            <span 
              className={`ml-2 text-sm font-bold ${player.ratingChange >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {player.ratingChange >= 0 ? `+${player.ratingChange}` : player.ratingChange}
            </span>
          </div>
          {isWinner && (
            <Badge variant="default" className="text-primary-foreground">
              <Trophy className="mr-1 h-4 w-4" />
              Winner
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="flex items-center text-sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Tests Passed:
            </span>
            <span className="font-bold">{player.testsPassed}/{player.totalTests}</span>
          </div>
          <div className="w-full">
            <Progress value={(player.testsPassed / player.totalTests) * 100} className="h-2" />
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center text-sm">
              <Send className="mr-2 h-4 w-4" />
              Submissions Left:
            </span>
            <span className="font-bold">{player.submissions}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Battle Summary</CardTitle>
            <CardDescription className="text-center">
              <Clock className="inline mr-2 h-4 w-4" />
              Battle Duration: {formatTime(battleDuration)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderPlayerResult(player1, winner === player1)}
              {renderPlayerResult(player2, winner === player2)}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center items-center space-x-4">
            <Button variant="outline" onClick={onClose} className="px-8 py-2">
              <GitPullRequest className="mr-2 h-4 w-4" />
              View Code
            </Button>
            <Link href="/">
              <Button className="px-8 py-2">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}