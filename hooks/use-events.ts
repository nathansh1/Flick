import { db } from '@/app/config/firebase'
import { arrayUnion, collection, doc, getDocs, updateDoc } from '@react-native-firebase/firestore'
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
        console.log('Filtering events for user:', userPublicKey)
        
        const normalizedUserKey = normalizePublicKey(userPublicKey)
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

export function useEventSearch() {
  const [searchResults, setSearchResults] = useState<Event[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchEventsByIdPrefix = async (prefix: string) => {
    if (!prefix || prefix.length !== 4) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    try {
      setSearching(true)
      setSearchError(null)
      
      const eventsCollection = collection(db, 'events')
      const eventsSnapshot = await getDocs(eventsCollection)
      
      const matchingEvents = eventsSnapshot.docs
        .map((doc: any) => ({
          id: doc.id,
          name: doc.data().name || '',
          description: doc.data().description || '',
          members: doc.data().members || []
        }))
        .filter((event: Event) => event.id.startsWith(prefix))
      
      setSearchResults(matchingEvents)
    } catch (err) {
      console.error('Error searching events:', err)
      setSearchError('Failed to search events')
    } finally {
      setSearching(false)
    }
  }

  const joinEvent = async (eventId: string, userPublicKey: string): Promise<boolean> => {
    try {
      const eventRef = doc(db, 'events', eventId)
      await updateDoc(eventRef, {
        members: arrayUnion(userPublicKey)
      })
      return true
    } catch (err) {
      console.error('Error joining event:', err)
      return false
    }
  }

  return { 
    searchResults, 
    searching, 
    searchError, 
    searchEventsByIdPrefix, 
    joinEvent 
  }
} 