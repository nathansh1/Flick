import { db } from '@/app/config/firebase'
import { doc, getDoc } from '@react-native-firebase/firestore'
import { useEffect, useState } from 'react'
import { Event } from './use-events'

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setEvent(null)
      setLoading(false)
      return
    }

    const fetchEvent = async () => {
      try {
        setLoading(true)
        const eventDoc = doc(db, 'events', eventId)
        const eventSnapshot = await getDoc(eventDoc)
        
        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data()
          setEvent({
            id: eventSnapshot.id,
            name: eventData?.name || '',
            description: eventData?.description || '',
            members: eventData?.members || []
          })
        } else {
          setError('Event not found')
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching event:', err)
        setError('Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  return { event, loading, error }
} 