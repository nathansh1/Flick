import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { AppView } from '@/components/app-view'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Text } from 'react-native-paper'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme } = useAppTheme()

  return (
    <AppPage>
      {/* Remove alignItems: 'center' from the parent AppView to avoid width restriction */}
      <AppView style={{ justifyContent: 'flex-start', flex: 1, paddingTop: 0 }}>
        <AppView
          style={{
            alignSelf: 'stretch',
            backgroundColor: theme.colors.primary,
            paddingVertical: 24,
            alignItems: 'flex-start',
            marginLeft: -16,
            marginRight: -16,
            marginTop: -16,
            paddingLeft: 24,
            borderBottomWidth: 6,
            borderBottomColor: theme.colors.outline,
          }}
        >
          <Text variant="headlineLarge" style={{ color: theme.colors.onPrimary, marginTop: 24 }}>
            Event #{id}
          </Text>
        </AppView>
        <Text variant="titleLarge" style={{ marginTop: 32 }}>
          Event ID: {id}
        </Text>
        {/* Add more event details here */}
      </AppView>
    </AppPage>
  )
}