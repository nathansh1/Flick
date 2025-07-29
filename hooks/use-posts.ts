import { db } from '@/app/config/firebase'
import { collection, getDocs } from '@react-native-firebase/firestore'
import { useEffect, useState } from 'react'

export interface Post {
  id: string
  image: string
  caption: string
}

export function usePosts(eventId: string) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    if (!eventId) {
      setPosts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const postsCollection = collection(db, 'events', eventId, 'post')
      const postsSnapshot = await getDocs(postsCollection)
      
      const postsData: Post[] = postsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        image: doc.data().img || '',
        caption: doc.data().caption || ''
      }))
      
      setPosts(postsData)
      setError(null)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [eventId])

  return { posts, loading, error, refetch: fetchPosts }
} 