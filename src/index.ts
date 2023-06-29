import dotenv from "dotenv";
dotenv.config();
import open from "open";
import express from "express";
import http from "http";
import robot from "robotjs";

const app = express();

app.use(express.static("client"));

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log("Server started");
});

interface SignRequest {
  autostarttoken: string;
  resolve: (value?: unknown) => void;
}

let isFirstRequest = true;
const requestQueue: SignRequest[] = [];

app.get("/api/autobankid", async (req, res) => {
  const { autostarttoken } = req.query;
  console.log(`Request with autostarttoken: ${autostarttoken}`);

  if (typeof autostarttoken !== "string") {
    res.status(400).send("autostarttoken is not a string");
    return;
  }

  await new Promise((resolve) => {
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
  await sleep(isFirstRequest ? 3000 : 1000);
  isFirstRequest = false;
  robot.typeString(process.env.PASSWORD ?? "");
  robot.keyTap("enter");
  await sleep(1000);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
