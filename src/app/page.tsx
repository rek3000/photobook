'use client'
import { useCallback } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { useImages } from '@/hooks/useImages'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Image {
  id: string
  name: string
  url: string
  created_at: string
  storage_path: string
  size: number
  type: string
}

export default function Home() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const {
    images,
    loading,
    error,
    uploading,
    uploadImage,
    deleteImage
  } = useImages()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      await uploadImage(acceptedFiles[0])
    }
  }, [uploadImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading your images...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Images</h1>
          <button
            onClick={handleSignOut}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mb-8 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div
          {...getRootProps()}
          className={`mb-8 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer
            ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <p className="text-gray-600">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-indigo-600">Drop the files here...</p>
          ) : (
            <p className="text-gray-600">
              Drag and drop images here, or click to select files
            </p>
          )}
        </div>

        {images.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <p className="text-gray-600">
              You haven&apos;t uploaded any images yet. Drop some files above to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <Image
                  src={image.url}
                  alt={image.name}
                  width={300}
                  height={300}
                  className="rounded-lg object-cover w-full aspect-square"
                />
                <button
                  onClick={() => deleteImage(image)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
