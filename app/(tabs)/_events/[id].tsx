import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { ScrollView, View } from 'react-native'
import { IconButton, Text } from 'react-native-paper'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme } = useAppTheme()

  // All 12 images
  const images = [
    require('@/assets/images/flick-logo-no-bg.png'),
    require('@/assets/images/flick-logo.png'),
    require('@/assets/images/adaptive-icon.png'),
    require('@/assets/images/favicon.png'),
    require('@/assets/images/icon.png'),
    require('@/assets/images/splash-icon.png'),
    require('@/assets/images/flick-logo-no-bg.png'),
    require('@/assets/images/flick-logo.png'),
    require('@/assets/images/adaptive-icon.png'),
    require('@/assets/images/favicon.png'),
    require('@/assets/images/icon.png'),
    require('@/assets/images/splash-icon.png'),
  ]

  return (
    <AppPage style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 0 }}>
        {/* Full-width header */}
        <View
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 24,
            alignItems: 'flex-start',
            paddingLeft: 24,
            borderBottomWidth: 6,
            borderBottomColor: theme.colors.outline,
            width: '100%',
          }}
        >
          <Text variant="headlineLarge" style={{ color: theme.colors.onPrimary, marginTop: 24 }}>
            Event #{id}
          </Text>
        </View>
        {/* Event info below header, with horizontal padding */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginTop: 32,
          }}
        >
          <Text variant="titleLarge">Event ID: {id}</Text>
          <IconButton
            icon="plus"
            mode="contained"
            containerColor="#4CAF50"
            onPress={() => console.log('Upload pressed')}
            style={{ borderRadius: 4, marginLeft: 'auto' }}
          />
        </View>
        {/* Grid - OUTSIDE padded View */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: '100%',
            marginTop: 16,
            backgroundColor: theme.colors.background,
          }}
        >
          {images.map((img, idx) => {
            const isLastCol = (idx + 1) % 3 === 0
            const isLastRow = idx >= 9
            return (
              <View
                key={idx}
                style={{
                  width: '33.3333%',
                  aspectRatio: 3 / 4,
                  borderRightWidth: isLastCol ? 0 : 1,
                  borderBottomWidth: isLastRow ? 0 : 1,
                  borderColor: theme.colors.background,
                  backgroundColor: '#111',
                }}
              >
                {img && (
                  <Image
                    source={img}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>
    </AppPage>
  )
}