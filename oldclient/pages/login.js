'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sword, Swords } from "lucide-react"
import { useRouter } from 'next/router'
import { getSocket } from "@/utils/socketManager"
import Head from 'next/head'

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const socket = getSocket()

  const handleLogin = async (e) => {
    e.preventDefault()
    
    socket.emit('set_username', { username })

    socket.once('username_set', (response) => {
      if (response.status === 'success') {
        localStorage.setItem('username', username)
        
        router.push('/home')
      } else {
        console.error('Failed to set username:', response.message)
      }
    })
  }

  return (
    <div className="flex h-screen bg-background text-foreground items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <Swords className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">CodeBattles</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="mb-2">
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full group">
              <Sword className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              Enter the Arena
            </Button>
          </form>

          <div className="mt-6">
            <Separator className="my-4" />
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">New to the battlefield? </span>
            <a href="#" className="text-primary hover:underline">
              Enlist Now
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}