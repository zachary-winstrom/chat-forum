import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const posts = await prisma.post.findMany({ include: { Reply: true } });
    return res.status(200).json(posts);
  } else if (req.method === "POST") {
    const { content, author } = req.body;
    const newPost = await prisma.post.create({
      data: { content, author },
    });
    return res.status(201).json(newPost);
  } else {
    return res.status(405).end("Method Not Allowed");
  }
}
