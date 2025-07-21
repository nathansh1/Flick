import { AppView } from '@/components/app-view'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@react-navigation/elements'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignIn() {
  const { signIn, isLoading } = useAuth()
  return (
    <AppView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SafeAreaView
          style={{
            flex: 1,
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', gap: 100 }}>
              <Image source={require('../assets/images/flick-logo-no-bg.png')} style={{ width: 378, height: 130 }} />
              <Button
                variant="filled"
                style={{ marginHorizontal: 16 }}
                onPress={async () => {
                  try {
                    console.log('Signing in...')
                    const account = await signIn();
                    console.log('Sign in successful');
                    // Navigate after signing in
                    router.replace('/');
                  } catch (error) {
                    console.log(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    alert(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
              >
                Connect
              </Button>
            </View>
          </View>
        </SafeAreaView>
      )}
    </AppView>
  )
}
