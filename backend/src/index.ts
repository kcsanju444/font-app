import express from "express";
import cors from "cors";
import fontRoutes from "./routes/fontroutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", fontRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
