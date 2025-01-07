import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const username = localStorage.getItem('username')
    if (username) {
      router.push('/home')
    } else {
      router.push('/login')
    }
  }, [router])

  return null
}