'use client'

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { useImages, type Image as ImageType } from '@/hooks/useImages'
import { XCircle } from 'lucide-react'

export default function ImageGallery() {
  const { images, uploading, error, uploadImage, deleteImage } = useImages()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      await uploadImage(acceptedFiles[0])
    }
  }, [uploadImage])

  const handleDelete = async (image: ImageType, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Deleting image:', image)
    const success = await deleteImage(image)
    
    if (!success) {
      console.error('Failed to delete image:', image.storage_path)
    } else {
      console.log('Successfully deleted image:', image.storage_path)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 mb-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-gray-600">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the image here...</p>
        ) : (
          <p className="text-gray-500">
            Drag and drop an image here, or click to select
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
          >
            <Image
              src={image.url}
              alt={image.name}
              className="object-contain"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
            />
            <button
              onClick={(e) => handleDelete(image, e)}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete image"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
