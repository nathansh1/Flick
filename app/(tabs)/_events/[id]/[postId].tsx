import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { useEvent } from '@/hooks/use-event'
import { usePosts } from '@/hooks/use-posts'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import { ActivityIndicator, IconButton, Text } from 'react-native-paper'

export default function PostDetailScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const { theme, spacing } = useAppTheme()
  
  const id = params?.id as string
  const postId = params?.postId as string

  if (!id || !postId) {
    return (
      <AppPage style={{ paddingHorizontal: 0 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Missing parameters</Text>
        </View>
      </AppPage>
    )
  }

  const { event, loading: eventLoading, error: eventError } = useEvent(id)
  const { posts: rawPosts, loading: postsLoading, error: postsError } = usePosts(id)

  const posts = rawPosts.map(post => ({
    ...post,
    image: post.image || ''
  }))

  const post = posts.find(p => p.id === postId)

  if (eventLoading || postsLoading) {
    return (
      <AppPage style={{ paddingHorizontal: 0 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text>Loading...</Text>
        </View>
      </AppPage>
    )
  }

  if (eventError || postsError || !event) {
    return (
      <AppPage style={{ paddingHorizontal: 0 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Failed to load event</Text>
        </View>
      </AppPage>
    )
  }

  if (!post) {
    return (
      <AppPage style={{ paddingHorizontal: 0 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Post not found</Text>
        </View>
      </AppPage>
    )
  }

  return (
    <AppPage style={{ paddingHorizontal: 0 }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.onPrimary}
            onPress={() => router.back()}
          />
          <Text style={{ color: theme.colors.onPrimary, flex: 1, textAlign: 'center' }}>
            {event.name || 'Event'}
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Image Container - Fixed height instead of flex */}
        <View style={{ height: 400, backgroundColor: '#000', marginTop: 100 }}>
          {post.image ? (
            <Image
              source={{ uri: post.image }}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'white' }}>No image available</Text>
            </View>
          )}
        </View>

        {/* Caption */}
        {post.caption && (
          <View style={{ padding: spacing.md, backgroundColor: theme.colors.surface }}>
            <Text>{post.caption}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
            minHeight: 80,
          }}
        >
          {/* Like Button */}
          <View style={{ alignItems: 'center' }}>
            <IconButton
              icon="heart-outline"
              size={28}
              onPress={() => {
                console.log('Like pressed')
              }}
            />
          </View>

          {/* Download Button */}
          <View style={{ alignItems: 'center' }}>
            <IconButton
              icon="download"
              size={28}
              onPress={() => {
                console.log('Download pressed')
              }}
            />
          </View>

          {/* Tip Button */}
          <View style={{ alignItems: 'center' }}>
            <IconButton
              icon="currency-usd"
              size={28}
              onPress={() => {
                console.log('Tip pressed')
              }}
            />
          </View>
        </View>
      </View>
    </AppPage>
  )
} 