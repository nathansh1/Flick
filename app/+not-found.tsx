import { AppText } from '@/components/app-text'
import { useAppTheme } from '@/components/app-theme'
import { AppView } from '@/components/app-view'
import { Stack, useRouter } from 'expo-router'
import { Button } from 'react-native-paper'

export default function NotFoundScreen() {
  const { spacing } = useAppTheme()
  const router = useRouter()

  return (
    <AppView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <AppText variant="headlineMedium">This screen does not exist.</AppText>
      <Button mode="contained-tonal" onPressIn={() => router.replace('/')}>
        Go to home screen!
      </Button>
    </AppView>
  )
}
