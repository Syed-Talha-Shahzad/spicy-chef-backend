import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import routes from "./src/routes/index.js";

const app = express();
const port = 5000;

app.use(
    cors({
      origin: "*",
    })
  );
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
  
  app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
