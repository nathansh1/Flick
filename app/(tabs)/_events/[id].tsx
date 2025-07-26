import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { useEvent } from '@/hooks/use-event'
import { usePosts } from '@/hooks/use-posts'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { ScrollView, View } from 'react-native'
import { ActivityIndicator, IconButton, Text } from 'react-native-paper'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme, spacing } = useAppTheme()
  const { event, loading: eventLoading, error: eventError } = useEvent(id)
  const { posts, loading: postsLoading, error: postsError } = usePosts(id)

  if (eventLoading) {
    return (
      <AppPage style={{ paddingHorizontal: 0 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: spacing.sm }}>Loading event...</Text>
        </View>
      </AppPage>
    )
  }

  if (eventError || !event) {
    return (
      <AppPage style={{ paddingHorizontal: 0 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>{eventError || 'Event not found'}</Text>
        </View>
      </AppPage>
    )
  }

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
            {event.name}
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onPrimary, marginTop: 8 }}>
            {event.description}
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
          <Text variant="titleLarge">Members: {event.members.length}</Text>
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
          {postsLoading ? (
            <View style={{ width: '100%', padding: spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: spacing.sm }}>Loading posts...</Text>
            </View>
          ) : postsError ? (
            <View style={{ width: '100%', padding: spacing.lg, alignItems: 'center' }}>
              <Text style={{ color: 'red' }}>{postsError}</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={{ width: '100%', padding: spacing.lg, alignItems: 'center' }}>
              <Text>No posts yet</Text>
            </View>
          ) : (
            posts.map((post, idx) => {
              const isLastCol = (idx + 1) % 3 === 0
              const isLastRow = idx >= posts.length - 3
              return (
                <View
                  key={post.id}
                  style={{
                    width: '33.3333%',
                    aspectRatio: 3 / 4,
                    borderRightWidth: isLastCol ? 0 : 1,
                    borderBottomWidth: isLastRow ? 0 : 1,
                    borderColor: theme.colors.background,
                    backgroundColor: '#111',
                  }}
                >
                  {post.image && (
                    <Image
                      source={{ uri: post.image }}
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    />
                  )}
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
    </AppPage>
  )
}