import { db } from '@/app/config/firebase'
import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { AppView } from '@/components/app-view'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useEvents } from '@/hooks/use-events'
import { addDoc, collection } from '@react-native-firebase/firestore'
import { useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Button, Modal, Portal, Text, TextInput } from 'react-native-paper'

export default function EventsScreen() {
  const router = useRouter()
  const { spacing, theme } = useAppTheme()
  const { selectedAccount } = useAuthorization()
  const [eventCode, setEventCode] = React.useState('')
  
  // Get user's public key as string for filtering
  const userPublicKey = selectedAccount?.publicKey.toString()
  const { events, loading, error, refetch } = useEvents(userPublicKey)
  
  // Create Event Modal State
  const [createModalVisible, setCreateModalVisible] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [eventName, setEventName] = React.useState('')
  const [eventDescription, setEventDescription] = React.useState('')
  const [formError, setFormError] = React.useState('')

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
      
      // Reset form
      setEventName('')
      setEventDescription('')
      setCreateModalVisible(false)
      
      // Refresh the events list to include the new event
      await refetch()
      
      // Navigate to the new event
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
                {userPublicKey ? 'No events found that you are a member of' : 'Connect your wallet to see your events'}
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
