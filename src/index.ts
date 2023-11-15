import dotenv from "dotenv";
dotenv.config();
import open from "open";
import express from "express";
import http from "http";
import robot from "robotjs";
import cors from "cors";

const app = express();

const corrOptions = {
  origin: ["http://localhost:5173", "https://bankid-opener.web.app"],
};

app.use(cors(corrOptions));

const server = http.createServer(app);

const SLEEP_TIME = parseInt(process.env.SLEEP ?? "1000");

server.listen(process.env.PORT, () => {
  console.log("Server started");
});

interface SignRequest {
  autostarttoken: string;
  resolve: (value?: unknown) => void;
}

const requestQueue: SignRequest[] = [];

app.get("/api/autobankid", (req, res) => {
  const { autostarttoken } = req.query;
  console.log(`Request with autostarttoken: ${autostarttoken}`);

  if (typeof autostarttoken !== "string") {
    res.status(400).send("autostarttoken is not a string");
    return;
  }

  new Promise((resolve) => {
    requestQueue.push({ autostarttoken, resolve });
    if (requestQueue.length === 1) {
      handleSignRequest(requestQueue[0]);
    }
  });

  res.send();
});

async function handleSignRequest(signRequest: SignRequest) {
  await openAndSignBankId(signRequest.autostarttoken);
  signRequest.resolve("Resolved");

  requestQueue.shift();
  if (requestQueue.length > 0) {
    handleSignRequest(requestQueue[0]);
  }
}

async function openAndSignBankId(autostarttoken: string) {
  await open(`bankid:///?autostarttoken=${autostarttoken}&redirect=null`);
  await sleep(SLEEP_TIME);
  robot.typeString(process.env.PASSWORD ?? "");
  robot.keyTap("enter");
  await sleep(SLEEP_TIME);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
