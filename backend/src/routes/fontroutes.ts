import express, { Request, Response } from "express";
import pool from "../utils/db";

const router = express.Router();

router.get("/fonts", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM fonts");
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
