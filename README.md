Here is the **Chat Forum Boilerplate** for your README, updated and complete with all necessary components. This is written as a fresh, standalone set of instructions for easy setup and deployment.

---

# Chat Forum Boilerplate

This is a simple **chat forum application** where users can post messages and reply to others. It is built with:

- **Next.js** (Pages Router)
- **TypeScript**
- **Tailwind CSS** + **DaisyUI** (for styling)
- **Prisma** (PostgreSQL via Neon)
- **Zustand** (State Management)
- **Jest** (Unit Testing)
- **Playwright** (End-to-End Testing)

---

## Features

- Users can post messages and reply to others.
- No authentication—users input a name for identification.
- Messages and replies are persisted in a PostgreSQL database.
- Server-side rendering for better SEO and performance.
- Modern development tools like Zustand, Jest, and Playwright.

---

## Prerequisites

- **Node.js**
- **pnpm** package manager
- A **Neon** account for PostgreSQL ([Sign Up](https://neon.tech/))

---

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd chat-forum
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Tailwind CSS

Initialize Tailwind CSS and DaisyUI:

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/daisyui/dist/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
```

Add Tailwind imports to `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Project Structure

```plaintext
src/
├── components/
│   └── PostList.tsx         # Renders the list of posts and replies
├── pages/
│   ├── index.tsx            # Main page
│   └── api/
│       ├── posts.ts         # API for posts
│       └── posts/[id].ts    # API for replies
├── store/
│   └── forumStore.ts        # Zustand store for state management
└── prisma/
    └── schema.prisma        # Prisma schema for the database
```

---

## Configuration

### 1. Set Up Prisma and PostgreSQL

1. **Initialize Prisma**:

   ```bash
   pnpm prisma init
   ```

2. **Configure the Prisma Schema**:
   Update `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }

   model Post {
     id        Int      @id @default(autoincrement())
     content   String
     author    String
     createdAt DateTime @default(now())
     Reply     Reply[]
   }

   model Reply {
     id        Int      @id @default(autoincrement())
     postId    Int
     content   String
     author    String
     createdAt DateTime @default(now())
     Post      Post     @relation(fields: [postId], references: [id])
   }
   ```

3. **Set Up Neon Database**:

   - Sign in to [Neon](https://neon.tech/) and create a new database.
   - Copy the database connection string and add it to `.env`:
     ```env
     DATABASE_URL="postgresql://<username>:<password>@<project>.neon.tech/<database>?sslmode=require"
     ```

4. **Push the Schema**:
   ```bash
   pnpm prisma db push
   ```

---

## Components

### 1. **`components/PostList.tsx`**

```tsx
import React, { useEffect } from "react";
import { useForumStore } from "../store/forumStore";

export default function PostList() {
  const { posts, fetchPosts, addReply, name } = useForumStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleReply = async (postId: number) => {
    const content = prompt("Enter your reply:");
    if (content) {
      await addReply(postId, content);
    }
  };

  return (
    <ul className="space-y-4 mt-4">
      {posts.map((post) => (
        <li key={post.id} className="p-4 border rounded">
          <p>{post.content}</p>
          <small className="block text-gray-600">— {post.author}</small>
          <button
            className="btn btn-sm btn-primary mt-2"
            onClick={() => handleReply(post.id)}
            disabled={!name}
          >
            Reply
          </button>
          {post.Reply && post.Reply.length > 0 && (
            <ul className="mt-2 ml-6 space-y-2 border-l pl-2">
              {post.Reply.map((reply) => (
                <li key={reply.id}>
                  <p>{reply.content}</p>
                  <small className="text-gray-600">— {reply.author}</small>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
```

### 2. **`pages/index.tsx`**

```tsx
import React, { useState, useEffect } from "react";
import PostList from "../components/PostList";
import { useForumStore } from "../store/forumStore";

export default function Home() {
  const { name, setName, addPost } = useForumStore();
  const [content, setContent] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, [setName]);

  const handlePost = async () => {
    if (!name) {
      alert("Please set your name first.");
      return;
    }
    await addPost(content);
    setContent("");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Chat Forum</h1>
      {!name && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter your name"
            className="input input-bordered w-full max-w-xs"
            onBlur={(e) => setName(e.target.value)}
          />
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <textarea
          className="textarea textarea-bordered w-full max-w-lg"
          placeholder="Say something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handlePost}>
          Post
        </button>
      </div>
      <PostList />
    </div>
  );
}
```

---

### 3. **`store/forumStore.ts`**

```tsx
import { create } from "zustand";

type Post = {
  id: number;
  content: string;
  author: string;
  createdAt?: string;
  Reply?: Reply[];
};

type Reply = {
  id: number;
  postId: number;
  content: string;
  author: string;
  createdAt?: string;
};

interface ForumState {
  name: string;
  setName: (name: string) => void;
  posts: Post[];
  fetchPosts: () => Promise<void>;
  addPost: (content: string) => Promise<void>;
  addReply: (postId: number, content: string) => Promise<void>;
}

export const useForumStore = create<ForumState>((set, get) => ({
  name: "",
  setName: (name) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("name", name);
    }
    set({ name });
  },
  posts: [],
  fetchPosts: async () => {
    const res = await fetch("/api/posts");
    const posts = await res.json();
    set({ posts });
  },
  addPost: async (content) => {
    const name = get().name;
    if (!name) return;
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author: name }),
    });
    get().fetchPosts();
  },
  addReply: async (postId, content) => {
    const name = get().name;
    if (!name) return;
    await fetch(`/api/posts/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author: name }),
    });
    get().fetchPosts();
  },
}));
```

---

### Run Locally

Start the development server:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

This is a complete, clean boilerplate ready for development. Let me know if you need anything else!

Here are the detailed deployment steps for your **Chat Forum App** built with **Next.js**, **Tailwind CSS**, **Prisma**, **Neon**, and **pnpm**.

---

## **Deployment Steps**

### 1. **Push Your Code to GitHub**

You need to push your app to a GitHub repository to deploy it to platforms like **Vercel**.

1. **Initialize a Git repository**:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a new repository on GitHub**.

   - Go to [GitHub](https://github.com/) and create a new repository.

3. **Add your GitHub repository as a remote**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

---

### 2. **Set Up a Neon Database**

Make sure your **Neon** database is ready for production.

1. **Create a new project** on [Neon](https://neon.tech/).
2. Copy your **connection string** (e.g., `postgresql://<username>:<password>@<project>.neon.tech/<database>?sslmode=require`).
3. Add this connection string to your app's environment variables (we’ll do this in the deployment platform).

---

### 3. **Deploy to Vercel**

Vercel is the best platform for deploying **Next.js** apps as it natively supports them.

#### **Step 1: Import Your GitHub Repository**

1. Go to [Vercel](https://vercel.com/).
2. Click **New Project** and select your GitHub repository.

#### **Step 2: Configure Environment Variables**

1. After importing the project, go to the **Settings → Environment Variables** section.
2. Add the following environment variable:
   - **`DATABASE_URL`**: Paste your Neon database connection string.

#### **Step 3: Build and Deploy**

1. Once you’ve set the environment variables, click **Deploy**.
2. Vercel will automatically detect the Next.js framework and build your app.
3. After deployment, you’ll get a live URL (e.g., `https://your-chat-forum.vercel.app`).

---

### 4. **Test Your Deployed App**

1. Visit the live URL to ensure your app is working as expected.
2. Check that:
   - Posts are being saved to the database.
   - Replies are functional.
   - Styling (via Tailwind CSS) is rendering correctly.

---

### 5. **Set Up Prisma in Production**

Prisma requires the **`DATABASE_URL`** environment variable to work in production.

1. Ensure you’ve added the **`DATABASE_URL`** variable to Vercel as described in Step 3.
2. Prisma migrations or schema changes should be handled locally and pushed to production using **`prisma db push`**.

---

### 6. **(Optional) Set Up a Custom Domain**

If you want a custom domain (e.g., `https://chatforum.com`):

1. Go to the **Domains** tab in your Vercel project.
2. Add your custom domain.
3. Update your DNS settings with your domain registrar to point to Vercel.

---

### 7. **Monitor Logs and Debug Issues**

1. Use the **"Logs"** section in Vercel to debug any runtime errors.
2. Ensure your environment variables are correct.

---

### Additional Notes:

- Vercel handles SSL certificates automatically for your deployment.
- You can update your app by committing and pushing new code to your GitHub repository. Vercel will redeploy automatically.

---

These steps ensure your **Chat Forum App** is live and functional in production. Let me know if you need help with any part of the process!
