import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";
import { connectDB } from "./config/db.js";
import usersRouter from "./routes/users.routes.js";

config();
const app = express();

app.use(cors());             // libera o acesso do front-end
app.use(express.json());     // habilita JSON no body
app.use(morgan("dev"));      // logs de requests no console

await connectDB();

app.use("/api/users", usersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});