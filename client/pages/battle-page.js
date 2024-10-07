'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Send, User, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CodeEditor from '@/components/codeEditor'

const INITIAL_CODE = `def twoSum(self, nums, target):
    # Write your solution here
    pass`

export default function BattlePage() {
  const [timeLeft, setTimeLeft] = useState(300) 
  const [code, setCode] = useState(INITIAL_CODE)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, isSubmitted])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    console.log('Submitted code:', code)
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
              <div className="flex items-center space-x-4 mb-4">
                <User className="h-10 w-10 text-primary" />
                <div>
                  <p className="font-semibold">wasd</p>
                  <p className="text-sm text-muted-foreground">Rating: 1900</p>
                </div>
              </div>
              <Badge variant="secondary" className="mr-2">Status: In Progress</Badge>
              <Badge variant="outline">Time: {formatTime(timeLeft)}</Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="w-1/2 flex flex-col">
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
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSubmit} disabled={isSubmitted || timeLeft === 0} className="group">
                {isSubmitted ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submitted
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4 transition-transform group-hover:rotate-45" />
                    Submit Solution
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}