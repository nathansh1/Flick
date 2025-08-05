import { AppView } from '@/components/app-view'
import { useAuth } from '@/components/auth/auth-provider'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignIn() {
  const { signIn, isLoading } = useAuth()
  return (
    <AppView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#000000',
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
              <TouchableOpacity
                style={{ 
                  marginHorizontal: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  minWidth: 200,
                  minHeight: 56,
                  backgroundColor: '#8B5CF6',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={async () => {
                  try {
                    const account = await signIn();
                    router.replace('/');
                  } catch (error) {
                    // Error handling - could be improved with a proper toast or modal
                    // For now, silently fail and let the user try again
                  }
                }}
              >
                <Text style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                }}>
                  Connect
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      )}
    </AppView>
  )
}
