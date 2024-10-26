'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Send, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CodeEditor from '@/components/codeEditor'
import { Progress } from "@/components/ui/progress"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react" 
import Head from 'next/head'
import { getSocket } from "@/utils/socketManager"
import BattleSummary from '@/components/ui/BattleSummary'

export default function BattlePage() {
  const [timeLeft, setTimeLeft] = useState(300) 
  const [code, setCode] = useState("")
  const [submissionsLeft, setSubmissionsLeft] = useState(3)
  const [allPassed, setAllPassed] = useState(false)
  const [passedTests, setPassedTests] = useState(0)
  const [error, setError] = useState(null)
  const problem = 1
  const [title, setTitle] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [description, setDescription] = useState([])
  const [examples, setExamples] = useState([])
  const [starterCode, setStarterCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [opponentUsername, setOpponentUsername] = useState(null)
  const [opponentRating, setOpponentRating] = useState(1800)
  const [opponentSubmissionsLeft, setOpponentSubmissionsLeft] = useState(3)
  const [opponentPassedTests, setOpponentPassedTests] = useState(0)
  const [opponentAllPassed, setOpponentAllPassed] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const socket = getSocket()
  const router = useRouter()
  const { battleRoomId } = router.query

  const startTimeRef = useRef(null)
  const durationRef = useRef(300) // Default duration in seconds

  useEffect(() => {
    fetch('http://localhost:8080/api/retrieveproblem?problem=' + problem)
      .then(response => response.json())
      .then(data => {
        setCode(data.starter_code)
        setTitle(data.title)
        setDifficulty(data.difficulty)
        setDescription(data.description)
        setExamples(data.examples)
        setStarterCode(data.starter_code)
      })
  }, [])

  useEffect(() => {
    socket.on('match_info_received', (data) => {
      setOpponentUsername(data.opponent_username)
      
      // Set start time and duration
      startTimeRef.current = data.start_time
      durationRef.current = data.duration
      calculateTimeLeft(data.start_time, data.duration)
    })

    socket.on('update_opponent_progress', (data) => {
      setOpponentPassedTests(data.opponent_passed_tests)
      setOpponentSubmissionsLeft(data.opponent_submissions_left)
      setOpponentAllPassed(data.opponent_all_passed)
      if (data.opponent_all_passed) {
        setShowSummary(true)
      }
    })

    return () => {
      socket.off('match_info_received')
      socket.off('update_opponent_progress')
    }
  }, [socket])

  useEffect(() => {
    if (battleRoomId) {
      socket.emit('retrieve_match_info', { battleRoomId })
    }
  }, [battleRoomId, socket])

  useEffect(() => {
    if (startTimeRef.current && durationRef.current) {
      const timer = setInterval(() => {
        calculateTimeLeft(startTimeRef.current, durationRef.current)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [startTimeRef.current, durationRef.current])

  const calculateTimeLeft = (startTime, duration) => {
    const currentTime = Date.now() / 1000  
    const elapsed = currentTime - startTime
    const remaining = duration - elapsed
    setTimeLeft(Math.max(0, Math.ceil(remaining)))
  }


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const handleSubmit = () => {
    if (submissionsLeft > 0) {
      setSubmissionsLeft(submissionsLeft - 1)
      setAllPassed(false)
      setPassedTests(0)
      setError(null)
      setIsLoading(true)
      const encodedCode = encodeURIComponent(code)
      fetch('http://localhost:8080/api/testcode?user_code=' + encodedCode 
        + '&problem_id=' + problem
        + '&battle_room_id=' + battleRoomId
        + '&opponent_username=' + opponentUsername
        + '&user_sid=' + socket.id)
        .then(response => response.json())
        .then(data => {
          setIsLoading(false)
          setAllPassed(data.all_passed)
          setError(data.error || null)
          setTimeout(() => {
            setPassedTests(data.passed_tests)
          }, 200) //for the animation
        }).catch(error => {
          setError(error.message || 'An error occurred while submitting your solution. Please try again.')
          setIsLoading(false) 
        })
    }
  }

  const renderExample = (example, index) => {
    return (
      <div key={index}>
        <h3 className="font-semibold mt-2 mb-1">Example {index + 1}:</h3>
        <pre className="bg-muted p-2 rounded text-sm">
          {example.map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {line}
              {lineIndex < example.length - 1 && '\n'}
            </React.Fragment>
          ))}
        </pre>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{title ? `${title} | CodeBattles` : 'CodeBattles'}</title>
      </Head>
      <div className="h-screen p-4 flex flex-col">
        <div className="flex gap-4 flex-grow">
        <div className="w-1/2 flex flex-col gap-4">
          <Card className="flex-grow flex flex-col h-3/4">
            <CardHeader className="flex-shrink-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">{title}</CardTitle>
                <div className={`flex items-center space-x-2 transition-all duration-300 ease-in-out
                   ${timeLeft <= 20 ? "text-white bg-red-500 rounded-lg px-2" : ""}`}>
                  <Clock className="h-4 w-4" />
                  <span className="text-lg font-mono">{formatTime(timeLeft)}</span>
                </div>
              </div>
              <CardDescription>Difficulty: {difficulty}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
              <ScrollArea className="h-full">
                {description.map((paragraph, index) => (
                  <p key={index} className="mb-2">{paragraph}</p>
                ))}
                {examples.map((example, index) => renderExample(example, index))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="flex-shrink-0 h-1/4">
            <CardHeader>
              <CardTitle className="text-xl">Opponent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 h-full relative">
                <User className="h-10 w-10 text-primary" />
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{opponentUsername}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Rating: {opponentRating}</p>
                </div>
                <div className="absolute top-0 right-0">
                  <Badge variant="secondary">{opponentSubmissionsLeft} submissions left</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-md font-medium">Test cases passed:</span>
                <span className="text-md font-medium">{opponentPassedTests}/11</span>
              </div>
              <Progress value={opponentPassedTests/11*100} max={11} className="w-full h-2 mt-2" />
            </CardContent>
          </Card>
        </div>
        <div className="w-1/2 flex flex-col gap-4">
          <Card className="flex flex-col h-3/4">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-xl">Your Solution</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow">
                <CodeEditor
                  key={starterCode}
                  defaultValue={starterCode}
                  onChange={setCode}
                />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-medium">
                  {submissionsLeft} submission{submissionsLeft !== 1 ? 's' : ''} left
                </span>
                <Button 
                  onClick={handleSubmit} 
                  disabled={timeLeft === 0 || submissionsLeft === 0} 
                  className="group"
                >   
                  <>
                    <Send className="mr-2 h-4 w-4 transition-transform group-hover:rotate-45" />
                    Submit Solution
                </>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={'flex-shrink-0 h-1/4'}>
            <CardHeader>
              <CardTitle className="text-xl">Submission Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col space-y-2 items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-md text-muted-foreground">Submitting...</p>
                </div>
              ) : error ? (
                <Alert className="border-red-500">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="text-center h-full">
                  <h2 className="text-4xl font-bold mb-2">{passedTests}/11</h2>
                  <p className="text-xl text-muted-foreground">Test Cases Passed</p>
                  <Progress value={passedTests/11*100} max={11} className="w-full h-2 mt-6" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}