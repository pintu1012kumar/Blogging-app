import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { signinInput, signupInput } from "@pintu1012kumar/medium-common";

dotenv.config();

const useRouter = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string ;


useRouter.use(bodyParser.json());

useRouter.post("/signup", async (req: any, res: any) => {
  try {

    const inputValidation  = signupInput.safeParse(req.body);
    if (!inputValidation .success) {
      res.status(411).json({
          message: "Invalid input"
      });
      return;
  }
  
   const { email, password } = inputValidation.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });
    

  const token = jwt.sign({ id: user.id }, JWT_SECRET);

    res.json({ jwt: token });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Error signup" });
  }
});



useRouter.post("/signin", async (req: any, res: any) => {
  try {
    const inputValidation  = signinInput.safeParse(req.body);
    if (!inputValidation .success) {
      res.status(411).json({
          message: "Invalid input"
      });
      return;
  }
  

    const { email, password } = inputValidation .data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({ error: "Invalid username/password" });
    }

    
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    
    console.log("user=",user)
    res.json({ jwt: token });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ error: "Error signin" });
  }
});

export default useRouter;