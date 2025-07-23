import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { AppView } from '@/components/app-view'
import { useRouter } from 'expo-router'
import React from 'react'
import { Button, TextInput } from 'react-native-paper'

const dummyEvents = [
  { id: '1', name: 'Event #1' },
  { id: '2', name: 'Event #2' },
]

export default function EventsScreen() {
  const router = useRouter()
  const { spacing } = useAppTheme()
  const [eventCode, setEventCode] = React.useState('')

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
          {dummyEvents.map((event) => (
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
          ))}
        </AppView>
      </AppView>
      {/* Create Event Button at the bottom */}
      <AppView style={{ marginTop: 'auto', alignItems: 'center' }}>
        <Button
          mode="contained"
          style={{ width: 200 }}
          contentStyle={{ height: 48 }}
          labelStyle={{ fontSize: 18 }}
        >
          Create Event
        </Button>
      </AppView>
    </AppPage>
  )
}
