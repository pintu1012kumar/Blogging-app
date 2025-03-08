import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { createPostInput, updatePostInput } from "../../../common";

export const blogRouter = new Hono<{
  Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
  },
  Variables: {
      userId: string;
  }
}>();

// Authorization Middleware

blogRouter.use(async (c, next) => {
  const jwt = c.req.header('Authorization');
if (!jwt) {
  c.status(401);
  return c.json({ error: "unauthorized" });
}
const token = jwt.split(' ')[1];
const payload = await verify(token, c.env.JWT_SECRET);
if (!payload) {
  c.status(401);
  return c.json({ error: "unauthorized" });
}
c.set('userId', payload.id);
await next()
});



blogRouter.post("/blog", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const userId = c.get("userId");

  // zod 
  const { success } = createPostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId,
    },
  });
  return c.json({
    id: post.id,
  });
});



blogRouter.put("/blog", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();

  // zod
  const { success } = updatePostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
  
  const blog = await prisma.post.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });
  return c.json({
    id: blog.id,
  });
});



// add pagination
blogRouter.get("/blog/bulk", async (c) => {
  const authHeader = c.req.header("Authorization");
  console.log("Authorization Header:", authHeader);

  if (!authHeader) {
    return c.json({ error: "Missing Authorization Header" }, 401);
  }

  try {
    const token = authHeader.split(" ")[1]; // Extract token
    console.log("Extracted Token:", token);

    const payload = await verify(token, "your-secret-key"); // Ensure correct secret
    console.log("Decoded JWT Payload:", payload);

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    });

    const blog = await prisma.post.findMany();
    return c.json({ blog });
  } catch (error) {
    console.error("JWT Error:", error);
    return c.json({ error: "Invalid Token" }, 401);
  }
});




blogRouter.get("/blog/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.post.findFirst({
      where: {
        id: id,
      },
    });

    return c.json({
      blog,
    });
  } catch (error) {
    c.status(411);
    return c.json({
      message: "Error while fetching blog data",
    });
  }
});