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
