import { AppPage } from '@/components/app-page'
import { AppView } from '@/components/app-view'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Text } from 'react-native-paper'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <AppPage>
      <AppView style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text variant="headlineLarge">Event Details</Text>
        <Text variant="titleLarge" style={{ marginTop: 16 }}>
          Event ID: {id}
        </Text>
        {/* Add more event details here */}
      </AppView>
    </AppPage>
  )
}