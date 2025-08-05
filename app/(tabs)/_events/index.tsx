import { db } from '@/app/config/firebase'
import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { AppView } from '@/components/app-view'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useEvents, useEventSearch } from '@/hooks/use-events'
import { addDoc, collection } from '@react-native-firebase/firestore'
import { useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Button, Modal, Portal, Text, TextInput } from 'react-native-paper'

export default function EventsScreen() {
  const router = useRouter()
  const { spacing, theme } = useAppTheme()
  const { selectedAccount } = useAuthorization()
  const [eventCode, setEventCode] = React.useState('')
  
  const userPublicKey = selectedAccount?.publicKey.toString()
  const { events, loading, error, refetch } = useEvents(userPublicKey)
  const { searchResults, searching, searchError, searchEventsByIdPrefix, joinEvent } = useEventSearch()
  
  const [createModalVisible, setCreateModalVisible] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [eventName, setEventName] = React.useState('')
  const [eventDescription, setEventDescription] = React.useState('')
  const [formError, setFormError] = React.useState('')
  const [joiningEvent, setJoiningEvent] = React.useState<string | null>(null)

  // Search for events when eventCode changes
  React.useEffect(() => {
    if (eventCode.length >= 4) {
      searchEventsByIdPrefix(eventCode)
    }
  }, [eventCode])

  const handleJoinEvent = async (eventId: string) => {
    if (!userPublicKey) {
      setFormError('Please connect your wallet to join events')
      return
    }

    setJoiningEvent(eventId)
    setFormError('')

    try {
      const success = await joinEvent(eventId, userPublicKey)
      if (success) {
        setEventCode('')
        await refetch()
        setFormError('')
      } else {
        setFormError('Failed to join event. Please try again.')
      }
    } catch (err) {
      console.error('Error joining event:', err)
      setFormError('Failed to join event. Please try again.')
    } finally {
      setJoiningEvent(null)
    }
  }

  const handleCreateEvent = async () => {
    if (!eventName.trim()) {
      setFormError('Event name is required')
      return
    }

    setCreating(true)
    setFormError('')

    try {
      const newEvent = {
        name: eventName.trim(),
        description: eventDescription.trim(),
        members: userPublicKey ? [userPublicKey] : [] 
      }

      const docRef = await addDoc(collection(db, 'events'), newEvent)
      
      setEventName('')
      setEventDescription('')
      setCreateModalVisible(false)
      
      await refetch()
      
      router.push({ pathname: '/(tabs)/_events/[id]', params: { id: docRef.id } })
    } catch (err) {
      console.error('Error creating event:', err)
      setFormError('Failed to create event. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const openCreateModal = () => {
    setEventName('')
    setEventDescription('')
    setFormError('')
    setCreateModalVisible(true)
  }

  const closeCreateModal = () => {
    if (!creating) {
      setCreateModalVisible(false)
      setEventName('')
      setEventDescription('')
      setFormError('')
    }
  }

  return (
    <AppPage>
      <AppView style={{ gap: spacing.md }}>
        {/* Search Bar */}
        <TextInput
          mode="outlined"
          label="Enter an event code"
          value={eventCode}
          onChangeText={setEventCode}
          style={{ marginBottom: spacing.lg }}
        />
        
        {/* Search Results */}
        {eventCode.length >= 4 && (
          <AppView style={{ gap: spacing.md, marginBottom: spacing.lg }}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              Search Results
            </Text>
            
            {searching ? (
              <AppView style={{ alignItems: 'center', padding: spacing.md }}>
                <ActivityIndicator size="small" />
                <Text style={{ marginTop: spacing.sm }}>Searching...</Text>
              </AppView>
            ) : searchError ? (
              <Text style={{ color: 'red', textAlign: 'center' }}>{searchError}</Text>
            ) : searchResults.length === 0 ? (
              <Text style={{ textAlign: 'center', opacity: 0.7 }}>
                No events found with that code
              </Text>
            ) : (
              searchResults.map((event) => {
                const isAlreadyMember = userPublicKey && event.members.some(member => 
                  member.toLowerCase() === userPublicKey.toLowerCase()
                )
                
                return (
                  <AppView 
                    key={event.id} 
                    style={{ 
                      padding: spacing.md, 
                      backgroundColor: theme.colors.surfaceVariant,
                      borderRadius: 8,
                      gap: spacing.sm
                    }}
                  >
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                      {event.name}
                    </Text>
                    <Text variant="bodyMedium" style={{ opacity: 0.8 }}>
                      {event.description}
                    </Text>
                    <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                      Event ID: {event.id}
                    </Text>
                    
                    {isAlreadyMember ? (
                      <Button
                        mode="outlined"
                        disabled
                        style={{ marginTop: spacing.sm }}
                      >
                        Already a member
                      </Button>
                    ) : (
                      <Button
                        mode="contained"
                        onPress={() => handleJoinEvent(event.id)}
                        loading={joiningEvent === event.id}
                        disabled={!userPublicKey || joiningEvent === event.id}
                        style={{ marginTop: spacing.sm }}
                      >
                        Join Event
                      </Button>
                    )}
                  </AppView>
                )
              })
            )}
          </AppView>
        )}

        {/* Error Message */}
        {formError && (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: spacing.md }}>
            {formError}
          </Text>
        )}

        {/* Event Tiles */}
        <AppView style={{ gap: spacing.md }}>
          {loading ? (
            <AppView style={{ alignItems: 'center', padding: spacing.lg }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: spacing.sm }}>Loading events...</Text>
            </AppView>
          ) : error ? (
            <AppView style={{ alignItems: 'center', padding: spacing.lg }}>
              <Text style={{ color: 'red' }}>{error}</Text>
            </AppView>
          ) : events.length === 0 ? (
            <AppView style={{ alignItems: 'center', padding: spacing.lg }}>
              <Text style={{ textAlign: 'center', marginBottom: spacing.sm }}>
                {userPublicKey ? 'Join some events!' : 'Connect your wallet to see your events'}
              </Text>
              {!userPublicKey && (
                <Text style={{ textAlign: 'center', fontSize: 12, opacity: 0.7 }}>
                  You need to connect your wallet to view events you're a member of
                </Text>
              )}
            </AppView>
          ) : (
            events.map((event) => (
              <Button
                key={event.id}
                mode="contained-tonal"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                contentStyle={{ height: 56 }}
                labelStyle={{ fontSize: 22, fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: 24 }}
                onPress={() => router.push({ pathname: '/(tabs)/_events/[id]', params: { id: event.id } })}
              >
                {event.name}
              </Button>
            ))
          )}
        </AppView>
      </AppView>
      {/* Create Event Button at the bottom */}
      <AppView style={{ marginTop: 'auto', alignItems: 'center' }}>
        <Button
          mode="contained"
          style={{ width: 200 }}
          contentStyle={{ height: 48 }}
          labelStyle={{ fontSize: 18 }}
          onPress={openCreateModal}
        >
          Create Event
        </Button>
      </AppView>

      {/* Create Event Modal */}
      <Portal>
        <Modal
          visible={createModalVisible}
          onDismiss={closeCreateModal}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            padding: spacing.lg,
            margin: spacing.lg,
            borderRadius: 8,
          }}
        >
          <Text variant="headlineSmall" style={{ marginBottom: spacing.lg, textAlign: 'center', color: theme.colors.onSurface }}>
            Create New Event
          </Text>
          
          <TextInput
            mode="outlined"
            label="Event Name *"
            value={eventName}
            onChangeText={setEventName}
            style={{ marginBottom: spacing.md }}
            disabled={creating}
          />
          
          <TextInput
            mode="outlined"
            label="Event Description"
            value={eventDescription}
            onChangeText={setEventDescription}
            multiline
            numberOfLines={3}
            style={{ marginBottom: spacing.md }}
            disabled={creating}
          />
          
          {formError ? (
            <Text style={{ color: 'red', marginBottom: spacing.md, textAlign: 'center' }}>
              {formError}
            </Text>
          ) : null}
          
          <AppView style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              mode="outlined"
              onPress={closeCreateModal}
              style={{ flex: 1 }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateEvent}
              style={{ flex: 1 }}
              loading={creating}
              disabled={creating}
            >
              Create
            </Button>
          </AppView>
        </Modal>
      </Portal>
    </AppPage>
  )
}
