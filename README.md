# Personal Image Storage Service

A secure image storage service built with Next.js 14 and Supabase, featuring user authentication and personal image galleries.

## Features

- User authentication with email/password
- Secure personal image storage
- Drag-and-drop image upload
- Responsive image gallery
- Real-time updates

## Prerequisites

- Node.js 18.17 or later
- Supabase account
- npm or yarn

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a new Supabase project at [https://supabase.com](https://supabase.com)

3. In your Supabase project:
   - Enable Email Auth in Authentication settings
   - Create a new table called 'images' with the following schema:
     ```sql
     create table images (
       id uuid default uuid_generate_v4() primary key,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       user_id uuid references auth.users not null,
       name text not null,
       url text not null
     );
     ```
   - Create a storage bucket called 'images' with public access

4. Create a `.env.local` file in the project root with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Sign up for an account using your email
2. Log in to access your personal image gallery
3. Drag and drop images or click to select files to upload
4. View your uploaded images in the responsive gallery

## Security

- Each user can only access their own images
- Images are stored in user-specific folders
- Authentication is handled securely by Supabase
- File uploads are protected by user authentication

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Dropzone](https://react-dropzone.js.org/)
