import { db } from '@/app/config/firebase'
import { collection, getDocs } from '@react-native-firebase/firestore'
import { useEffect, useState } from 'react'

export interface Event {
  id: string
  name: string
  description: string
  members: string[]
}

function normalizePublicKey(key: string): string {
  return key.toLowerCase().trim()
}

export function useEvents(userPublicKey?: string) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const eventsCollection = collection(db, 'events')
      const eventsSnapshot = await getDocs(eventsCollection)
      
      let eventsData: Event[] = eventsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        name: doc.data().name || '',
        description: doc.data().description || '',
        members: doc.data().members || []
      }))
      
      if (userPublicKey) {
        const normalizedUserKey = normalizePublicKey(userPublicKey)
        console.log('Filtering events for user:', normalizedUserKey)
        
        eventsData = eventsData.filter(event => {
          const isMember = event.members.some(member => {
            const normalizedMember = normalizePublicKey(member)
            return normalizedMember === normalizedUserKey
          })
          return isMember
        })
        
        console.log(`Found ${eventsData.length} events for user`)
      }
      
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
  }, [userPublicKey])

  return { events, loading, error, refetch: fetchEvents }
} 