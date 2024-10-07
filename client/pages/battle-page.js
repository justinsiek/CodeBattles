'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Send, User, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CodeEditor from '@/components/codeEditor'
import { Progress } from "@/components/ui/progress"

const INITIAL_CODE = `def twoSum(nums, target):
    # Write your solution here
    pass`

export default function BattlePage() {
  const [timeLeft, setTimeLeft] = useState(300) 
  const [code, setCode] = useState(INITIAL_CODE)
  const [submissionsLeft, setSubmissionsLeft] = useState(3)
  const [allPassed, setAllPassed] = useState(false)
  const [passedTests, setPassedTests] = useState(0)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const handleSubmit = () => {
    if (submissionsLeft > 0) {
      setSubmissionsLeft(submissionsLeft - 1)
      console.log('Submitted code:', code)
      const encodedCode = encodeURIComponent(code)
      fetch('http://localhost:8080/api/testcode?user_code=' + encodedCode)
        .then(response => response.json())
        .then(data => {
          console.log("returned data", data)
          setAllPassed(data.all_passed)
          setPassedTests(data.passed_tests)
        })
    }
  }

  return (
    <div className="h-screen p-4 flex flex-col">
      <div className="flex gap-4 flex-grow">
        <div className="w-1/2 flex flex-col gap-4">
          <Card className="flex-grow flex flex-col h-3/4">
            <CardHeader className="flex-shrink-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Two Sum</CardTitle>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-lg font-mono">{formatTime(timeLeft)}</span>
                </div>
              </div>
              <CardDescription>Difficulty: Easy</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
              <ScrollArea className="h-full">
                <p className="mb-2">Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.</p>
                <p className="mb-2">You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                <p className="mb-2">You can return the answer in any order.</p>
                <h3 className="font-semibold mt-2 mb-1">Example 1:</h3>
                <pre className="bg-muted p-2 rounded text-sm">
                  Input: nums = [2,7,11,15], target = 9{'\n'}
                  Output: [0,1]{'\n'}
                  Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                </pre>
                <h3 className="font-semibold mt-2 mb-1">Example 2:</h3>
                <pre className="bg-muted p-2 rounded text-sm">
                  Input: nums = [3,2,4], target = 6{'\n'}
                  Output: [1,2]{'\n'}
                </pre>
                <h3 className="font-semibold mt-2 mb-1">Example 3:</h3>
                <pre className="bg-muted p-2 rounded text-sm">
                  Input: nums = [3,3], target = 6{'\n'}
                  Output: [0,1]{'\n'}
                </pre>
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
                    <p className="font-semibold">wasd</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Rating: 1900</p>
                </div>
                <div className="absolute top-0 right-0">
                  <Badge variant="secondary">2 submissions left</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-md font-medium">Test cases passed:</span>
                <span className="text-md font-medium">6/11</span>
              </div>
              <Progress value={6/11*100} max={11} className="w-full h-2 mt-2" />
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
                  defaultValue={code}
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

          <Card className="flex-shrink-0 h-1/4">
            <CardHeader>
              <CardTitle className="text-xl">Submission Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center h-full">
                    <h2 className="text-4xl font-bold mb-2">{passedTests}/11</h2>
                    <p className="text-xl text-muted-foreground">Test Cases Passed</p>
                    <Progress value={passedTests/11*100} max={11} className="w-full h-2 mt-6" />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}