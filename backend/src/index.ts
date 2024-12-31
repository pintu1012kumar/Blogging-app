import { Hono } from 'hono';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
import { cors } from "hono/cors";

export const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.use("/*", cors());
app.route('/api/v1/user', userRouter);
app.route('/api/v1/blogs', blogRouter);



export default app;
