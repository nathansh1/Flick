import { useAppTheme } from '@/components/app-theme'
import { Stack } from 'expo-router'
import React from 'react'

export default function Layout() {
  const { theme } = useAppTheme()
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Events',
        headerTitleStyle: { fontSize: 50 },
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
