import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/router";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Node js Backend is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use("/api/v1", routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
