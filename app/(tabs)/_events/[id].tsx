import { db, storageRef } from '@/app/config/firebase'
import { AppPage } from '@/components/app-page'
import { useAppTheme } from '@/components/app-theme'
import { useEvent } from '@/hooks/use-event'
import { usePosts } from '@/hooks/use-posts'
import { addDoc, collection } from '@react-native-firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from '@react-native-firebase/storage'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { ScrollView, View } from 'react-native'
import { ActivityIndicator, Button, IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme, spacing } = useAppTheme()
  const { event, loading: eventLoading, error: eventError } = useEvent(id)
  const { posts, loading: postsLoading, error: postsError, refetch } = usePosts(id)

  // Upload Modal State
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
      // Upload image to Firebase Storage
      const response = await fetch(selectedImage)
      const blob = await response.blob()
      
      const imageRef = ref(storageRef, `posts/${id}/${Date.now()}.jpg`)
      await uploadBytes(imageRef, blob)
      
      // Get download URL
      const downloadURL = await getDownloadURL(imageRef)
      
      // Add post to Firestore
      const newPost = {
        image: downloadURL,
        caption: caption.trim()
      }

      await addDoc(collection(db, 'events', id, 'posts'), newPost)
      
      // Reset form
      setSelectedImage(null)
      setCaption('')
      setUploadModalVisible(false)
      
      // Refresh posts list
      await refetch()
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
            onPress={openUploadModal}
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