'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export interface Image {
  id: string
  name: string
  url: string
  created_at: string
  storage_path: string
  size: number
  type: string
  user_id: string
}

export const useImages = () => {
  const [images, setImages] = useState<Image[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const getImages = useCallback(async () => {
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // List all files in the user's folder
      const { data: files, error: listError } = await supabase.storage
        .from('images')
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (listError) {
        setError('Failed to fetch images')
        console.error('Error listing images:', listError)
        return
      }

      if (!files || files.length === 0) {
        setImages([])
        return
      }

      // Get signed URLs for all files
      const imagesWithUrls = await Promise.all(
        files.map(async (file) => {
          const filePath = `${user.id}/${file.name}`
          const { data: signedUrl, error: signError } = await supabase.storage
            .from('images')
            .createSignedUrl(filePath, 3600) // 1 hour expiry

          if (signError) {
            console.error('Error getting signed URL:', signError)
            return null
          }

          return {
            id: file.id || file.name,
            name: file.name,
            url: signedUrl.signedUrl,
            created_at: file.created_at || new Date().toISOString(),
            storage_path: filePath,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'image/*',
            user_id: user.id
          }
        })
      )

      setImages(imagesWithUrls.filter((img): img is Image => img !== null))
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  const uploadImage = useCallback(async (file: File) => {
    try {
      setError(null)
      setUploading(true)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError('Please login to upload images')
        router.push('/auth/login')
        return false
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return false
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
        setError('Only JPG, PNG, GIF and WebP files are allowed')
        return false
      }

      // Create a unique filename with original extension
      const uniqueId = Date.now().toString()
      const fileName = `${uniqueId}-${file.name}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        setError('Error uploading image')
        console.error('Error uploading image:', uploadError)
        return false
      }

      await getImages()
      return true
    } catch (err) {
      console.error('Error in uploadImage:', err)
      setError('An unexpected error occurred')
      return false
    } finally {
      setUploading(false)
    }
  }, [supabase, router, getImages])

  const deleteImage = useCallback(async (storagePath: string | { storage_path: string }) => {
    try {
      setError(null)

      // Handle both string and object with storage_path
      const path = typeof storagePath === 'string' ? storagePath : storagePath.storage_path

      if (!path || typeof path !== 'string') {
        console.error('Invalid storage path:', storagePath)
        setError('Invalid image path')
        return false
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError('Please login to delete images')
        router.push('/auth/login')
        return false
      }

      // Extract the filename from the storage path
      const pathParts = path.split('/')
      if (pathParts.length !== 2) {
        console.error('Invalid storage path format:', path)
        setError('Invalid image path')
        return false
      }

      const [userId] = pathParts
      if (userId !== user.id) {
        console.error('Unauthorized: Cannot delete other users images')
        setError('Unauthorized')
        return false
      }

      console.log('Attempting to delete image:', path)

      // Delete from storage using the full path
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([path])

      if (deleteError) {
        console.error('Error deleting image from storage:', deleteError)
        setError('Error deleting image')
        return false
      }

      console.log('Successfully deleted image:', path)

      // Remove the deleted image from the state
      setImages(prevImages => prevImages.filter(img => img.storage_path !== path))
      return true
    } catch (err) {
      console.error('Error in deleteImage:', err)
      setError('An unexpected error occurred')
      return false
    }
  }, [supabase, router])

  useEffect(() => {
    getImages()
  }, [getImages])

  return {
    images,
    uploading,
    error,
    loading,
    uploadImage,
    deleteImage,
    refreshImages: getImages
  }
}
