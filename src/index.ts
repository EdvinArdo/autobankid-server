import dotenv from "dotenv";
dotenv.config();
import open from "open";
import cors from "cors";
import express from "express";
import http from "http";

const app = express();
app.use(cors());
const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log("Server started");
});

app.get("/api/autobankid", async (req, res) => {
  console.log(req.query);
  const { autostarttoken } = req.query;
  await open(`bankid:///?autostarttoken=${autostarttoken}&redirect=null`);
  setTimeout(() => open(`autobankidauth://`), 1000);
  res.send();
});
