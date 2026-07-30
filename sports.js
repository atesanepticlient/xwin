import crypto from "crypto";
import axios from "axios";

// ==========================
// Configuration
// ==========================
const API_URL = "https://client-api.gregmorn.org/games/openGame";

const USER_SECRET = "u[@9w+5Y_>&8";

const body = {
  currency: "BDT",
  demo: "0",
  exitUrl: "https://example.com/exit",
  gameId: process.env.GREGMORN_1XID,
  language: "en",
  player_login: "john_doe",
  user_id: "6712031e-2632-4b4c-9226-8e19215a4ebb",
  callbackUrl: "https://example.com/callback",
};

// ==========================
// Generate Signature
// ==========================
const rawBody = JSON.stringify(body);

const signature = crypto
  .createHmac("sha256", USER_SECRET)
  .update(rawBody, "utf8")
  .digest("hex");

console.log("Raw Body:");
console.log(rawBody);

console.log("\nSignature:");
console.log(signature);

// ==========================
// Send Request
// ==========================
async function openGame() {
  try {
    const response = await axios({
      method: "POST",
      url: API_URL,

      // Send the same object you signed
      data: body,

      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "X-Signature": signature,
      },
    });

    console.log("\nResponse:");
    console.log(response.data);
  } catch (err) {
    if (err.response) {
      console.log("\nStatus:", err.response.status);
      console.log(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

openGame();
