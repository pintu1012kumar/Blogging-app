import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { createPostInput, updatePostInput } from "@pintu1012kumar/medium-common";

dotenv.config();

const blogRouter = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

interface AuthRequest extends Request {
  userId: string;
}

// Middleware
const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(403).json({ message: "You are not logged in" });
    }

    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!user || !user.id) {
      return res.status(403).json({ message: "You are not logged in" });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(403).json({ message: "You are not logged in" });
  }
};

// Create post
//  @ts-ignore
blogRouter.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { success } = createPostInput.safeParse(req.body);

    if (!success) {
      return res.status(411).json({ message: "Inputs not correct" });
    }

    const post = await prisma.post.create({
      data: {
        title: req.body.title,
        content: req.body.content,
        authorId: req.userId,
      },
    });

    return res.json({ id: post.id });
  } catch (error) {
    return res.status(500).json({ message: "Error creating post" });
  }
});

// Update post
// @ts-ignore
blogRouter.put("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { success } = updatePostInput.safeParse(req.body);
    if (!success) {
      return res.status(411).json({ message: "Inputs not correct" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: req.body.id },
      data: {
        title: req.body.title,
        content: req.body.content,
      },
    });

    return res.json({ id: updatedPost.id });
  } catch (error) {
    return res.status(500).json({ message: "Error updating post" });
  }
});

// Get all  posts
// @ts-ignore
blogRouter.get("/bulk", async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: { name: true },
        },
      },
    });

    return res.json({ blogs });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching blogs" });
  }
});

// Get a blog post by ID
// @ts-ignore
blogRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const blog = await prisma.post.findFirst({
      where: { id: id },
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: { name: true },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json({ blog });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving post" });
  }
});

export default blogRouter;