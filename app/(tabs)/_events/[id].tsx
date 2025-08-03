import { db } from '@/app/config/firebase'
import { IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '@/app/config/imgbb'
import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { useEvent } from '@/hooks/use-event'
import { usePosts } from '@/hooks/use-posts'
import { addDoc, collection } from '@react-native-firebase/firestore'
import axios from 'axios'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native'
import { ActivityIndicator, Button, IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper'

// Collapsible description component
const CollapsibleDescription = ({ description, maxLines = 1 }: { description: string; maxLines?: number }) => {
  const [expanded, setExpanded] = React.useState(false)
  const [textLayout, setTextLayout] = React.useState<{ lines: number } | null>(null)
  const { theme } = useAppTheme()

  const shouldTruncate = textLayout && textLayout.lines > maxLines

  return (
    <View>
      <Text
        variant="bodyLarge"
        style={{ 
          color: theme.colors.onPrimary, 
          marginTop: 8,
          lineHeight: 20,
        }}
        numberOfLines={expanded ? undefined : maxLines}
        onTextLayout={(event) => {
          if (!textLayout) {
            setTextLayout({ lines: event.nativeEvent.lines.length })
          }
        }}
      >
        {description}
      </Text>
      {shouldTruncate && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={{ marginTop: 4 }}
        >
          <Text
            style={{
              color: theme.colors.onPrimary,
              textDecorationLine: 'underline',
              fontSize: 14,
            }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { theme, spacing } = useAppTheme()
  const { event, loading: eventLoading, error: eventError } = useEvent(id)
  const { posts, loading: postsLoading, error: postsError, refetch } = usePosts(id)


  const [uploadModalVisible, setUploadModalVisible] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [caption, setCaption] = React.useState('')
  const [uploadError, setUploadError] = React.useState('')

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  const handleUpload = async () => {
    if (!selectedImage) {
      setUploadError('Please select an image')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      // Convert image to base64
      const response = await fetch(selectedImage)
      const blob = await response.blob()
      
      // Convert blob to base64
      const reader = new FileReader()
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
      })
      reader.readAsDataURL(blob)
      const base64Data = await base64Promise as string
      
      // Remove the data URL prefix to get just the base64 string
      const base64String = base64Data.split(',')[1]
      
      // Upload to imgbb
      const formData = new FormData()
      formData.append('image', base64String)
      formData.append('key', IMGBB_API_KEY || '')
      
      const imgbbResponse = await axios.post(IMGBB_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (imgbbResponse.data.success) {
        const imageUrl = imgbbResponse.data.data.url
        
        // Add post to Firestore
        const newPost = {
          image: imageUrl,
          caption: caption.trim()
        }

        await addDoc(collection(db, 'events', id, 'posts'), newPost)
        
        // Reset form
        setSelectedImage(null)
        setCaption('')
        setUploadModalVisible(false)
        
        // Refresh posts list
        await refetch()
      } else {
        throw new Error('Failed to upload to database')
      }
    } catch (err) {
      console.error('Error uploading post:', err)
      setUploadError('Failed to upload post. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const openUploadModal = () => {
    setSelectedImage(null)
    setCaption('')
    setUploadError('')
    setUploadModalVisible(true)
  }

  const closeUploadModal = () => {
    if (!uploading) {
      setUploadModalVisible(false)
      setSelectedImage(null)
      setCaption('')
      setUploadError('')
    }
  }

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
          <CollapsibleDescription description={event.description} />
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
          <IconButton
            icon="plus"
            mode="contained"
            containerColor="#4CAF50"
            onPress={openUploadModal}
            style={{ borderRadius: 4 }}
          />
          
          {/* Event Code Button */}
          <IconButton
            icon="qrcode"
            mode="contained"
            containerColor={theme.colors.primary}
            iconColor={theme.colors.onPrimary}
            onPress={() => {
              Alert.alert(
                'Event Code (case sensitive)',
                `${id?.substring(0, 4)}`,
                [{ text: 'OK' }]
              )
            }}
            style={{ borderRadius: 4 }}
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
                <TouchableOpacity
                  key={post.id}
                  style={{
                    width: '33.3333%',
                    aspectRatio: 3 / 4,
                    borderRightWidth: isLastCol ? 0 : 1,
                    borderBottomWidth: isLastRow ? 0 : 1,
                    borderColor: theme.colors.background,
                    backgroundColor: '#111',
                  }}
                  onPress={() => router.push({
                    pathname: '/(tabs)/_events/[id]/[postId]',
                    params: { id, postId: post.id }
                  })}
                  activeOpacity={0.7}
                >
                  {post.image && (
                    <Image
                      source={{ uri: post.image }}
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    />
                  )}
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* Upload Post Modal */}
      <Portal>
        <Modal
          visible={uploadModalVisible}
          onDismiss={closeUploadModal}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            padding: spacing.lg,
            margin: spacing.lg,
            borderRadius: 8,
          }}
        >
          <Text variant="headlineSmall" style={{ marginBottom: spacing.lg, textAlign: 'center', color: theme.colors.onSurface }}>
            Upload Post
          </Text>
          
          {/* Image Selection */}
          <Button
            mode="outlined"
            onPress={pickImage}
            style={{ marginBottom: spacing.md }}
            disabled={uploading}
            icon="camera"
          >
            {selectedImage ? 'Change Image' : 'Select Image'}
          </Button>
          
          {/* Image Preview */}
          {selectedImage && (
            <View style={{ marginBottom: spacing.md, alignItems: 'center' }}>
              <Image
                source={{ uri: selectedImage }}
                style={{ width: 200, height: 267, borderRadius: 8 }}
                contentFit="cover"
              />
            </View>
          )}
          
          {/* Caption Input */}
          <TextInput
            mode="outlined"
            label="Caption"
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
            style={{ marginBottom: spacing.md }}
            disabled={uploading}
          />
          
          {uploadError ? (
            <Text style={{ color: 'red', marginBottom: spacing.md, textAlign: 'center' }}>
              {uploadError}
            </Text>
          ) : null}
          
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              mode="outlined"
              onPress={closeUploadModal}
              style={{ flex: 1 }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpload}
              style={{ flex: 1 }}
              loading={uploading}
              disabled={uploading || !selectedImage}
            >
              Upload
            </Button>
          </View>
        </Modal>
      </Portal>
    </AppPage>
  )
}