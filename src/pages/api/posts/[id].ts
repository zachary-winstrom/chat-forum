import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    const replies = await prisma.reply.findMany({
      where: { postId: Number(id) },
    });
    return res.status(200).json(replies);
  } else if (req.method === "POST") {
    const { content, author } = req.body;
    const newReply = await prisma.reply.create({
      data: { postId: Number(id), content, author },
    });
    return res.status(201).json(newReply);
  } else {
    return res.status(405).end("Method Not Allowed");
  }
}
