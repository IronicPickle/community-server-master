import express from "express";
import { login } from "../utils/auth";

const router = express.Router();

router.post("/login", (req, res, next) => {
  const password = req.body.inputs.password;
  
  const data = {
    password: login(password)
  }

  res.status(200).send({data});
});
  
export default router;