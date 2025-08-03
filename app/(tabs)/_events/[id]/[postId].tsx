import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { TippingModal } from '@/components/tipping/tipping-modal'
import { SolanaIcon } from '@/components/ui/solana-icon'
import { useEvent } from '@/hooks/use-event'
import { usePosts } from '@/hooks/use-posts'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { usePermissions } from 'expo-media-library'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, View } from 'react-native'
import { ActivityIndicator, IconButton, Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function PostDetailScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const { theme, spacing } = useAppTheme()
  const [isLiked, setIsLiked] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isTippingModalVisible, setIsTippingModalVisible] = useState(false)
  const [permissionResponse, requestPermission] = usePermissions()
  console.log('Media Library:', usePermissions)
  
  const id = params?.id as string
  const postId = params?.postId as string

  const { event, loading: eventLoading, error: eventError } = useEvent(id)
  const { posts: rawPosts, loading: postsLoading, error: postsError } = usePosts(id)

  if (!id || !postId) {
    return (
      <AppPage style={{ paddingHorizontal: 0 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Missing parameters</Text>
        </View>
      </AppPage>
    )
  }

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

  const handleDownload = async () => {
    if (!post.image) {
      Alert.alert('No image available to download')
      return
    }
    try {
      setIsDownloading(true)

      if (!permissionResponse || permissionResponse.status !== 'granted') {
        const response = await requestPermission()
        if (response.status !== 'granted') {
          Alert.alert('Permission Denied', 'Storage permission is required to save the image')
          return
        }
      }

      const fileUri = `${FileSystem.cacheDirectory}event_snap_${postId}.jpg`
      const { uri } = await FileSystem.downloadAsync(post.image, fileUri)

      await MediaLibrary.createAssetAsync(uri)
      
      Alert.alert('Success', 'Image saved!')
    } catch (error) {
      console.error('Download error:', error)
      Alert.alert('Error', 'Failed to download image.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <SafeAreaView
          style={{
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <IconButton
            icon="arrow-left"
            iconColor="white"
            onPress={() => router.back()}
          />
          <Text style={{ color: 'white', flex: 1, textAlign: 'center' }}>
            {event.name || 'Event'}
          </Text>
          <View style={{ width: 48 }} />
        </SafeAreaView>
      </View>

      {/* Image Container */}
      <View style={{ flex: 1 }}>
        {post.image ? (
          <Image
            source={{ uri: post.image }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
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
            icon={isLiked ? 'heart' : 'heart-outline'}
            iconColor={isLiked ? '#ff4757' : undefined}
            size={28}
            onPress={() => {
              setIsLiked(!isLiked)
              console.log('Like pressed')
            }}
          />
        </View>

        {/* Download Button */}
        <View style={{ alignItems: 'center' }}>
          <IconButton
            icon={isDownloading ? 'loading' : 'download'}
            size={28}
            disabled={isDownloading}
            onPress={handleDownload}
          />
        </View>

        {/* Tip Button */}
        <View style={{ alignItems: 'center' }}>
          <IconButton
            icon={() => <SolanaIcon size={28} />}
            size={28}
            onPress={() => {
              setIsTippingModalVisible(true)
            }}
          />
        </View>
      </View>

      {/* Tipping Modal */}
      <TippingModal
        visible={isTippingModalVisible}
        onDismiss={() => setIsTippingModalVisible(false)}
        posterPublicKey={post.poster}
        postCaption={post.caption}
      />
    </View>
  )
} 