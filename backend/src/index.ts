import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import useRouter from "./route/user";
import blogRouter from "./route/blog";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello, World!");
  });

app.use("/api/v1/user", useRouter);
app.use("/api/v1/blog", blogRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
