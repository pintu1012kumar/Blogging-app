import { Hono } from 'hono';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';

export const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.route('/api/v1/user', userRouter);
app.route('/api/v1/blog', blogRouter);



app.get('/check-env', (c) => {
  const databaseUrl = c.env.DATABASE_URL;
  const jwtSecret = c.env.JWT_SECRET;

  if (!databaseUrl || !jwtSecret) {
    return c.json({ message: 'Environment variables are missing' }, 500);
  }

  return c.json({ message: 'Environment variables are available', databaseUrl, jwtSecret });
});

export default app;
