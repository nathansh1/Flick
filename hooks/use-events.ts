import { db } from '@/app/config/firebase'
import { collection, getDocs } from '@react-native-firebase/firestore'
import { useEffect, useState } from 'react'

export interface Event {
  id: string
  name: string
  description: string
  members: string[]
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const eventsCollection = collection(db, 'events')
      const eventsSnapshot = await getDocs(eventsCollection)
      
      const eventsData: Event[] = eventsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        name: doc.data().name || '',
        description: doc.data().description || '',
        members: doc.data().members || []
      }))
      
      setEvents(eventsData)
      setError(null)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return { events, loading, error, refetch: fetchEvents }
} 