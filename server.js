import { TikTokLiveClient, EventType, GiftStreakTracker } from "piratetok-live-js";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT || 3000);
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME;

if (!TIKTOK_USERNAME) {
  throw new Error("Missing TIKTOK_USERNAME environment variable.");
}

// Change gift names and card numbers here.
const GIFT_MAP = {
  "Rose": 1,
  // "Finger Heart": 2,
  // "Heart": 3,
  // "GG": 4,
  // "TikTok": 5,
  // "Gift Name": 6,
  // "Gift Name": 7,
  // "Gift Name": 8,
  // "Gift Name": 9
};

const wss = new WebSocketServer({ port: PORT });
const tracker = new GiftStreakTracker();
const client = new TikTokLiveClient(TIKTOK_USERNAME);

console.log(`WebSocket bridge listening on port ${PORT}`);
console.log(`Connecting to TikTok LIVE: @${TIKTOK_USERNAME}`);

function broadcast(payload) {
  const message = JSON.stringify(payload);

  for (const socket of wss.clients) {
    if (socket.readyState === 1) {
      socket.send(message);
    }
  }
}

client.on(EventType.gift, (data) => {
  const giftName = data.gift?.name;
  const username = data.user?.nickname || data.user?.uniqueId || "Unknown";

  if (!giftName) return;

  const cardNumber = GIFT_MAP[giftName];

  console.log(
    `[GIFT] ${username} -> ${giftName} x${data.repeatCount ?? 1}`
  );

  if (!cardNumber) {
    console.log(`[IGNORED] No card mapping for "${giftName}"`);
    return;
  }

  const streak = tracker.process(data);
  const newGiftCount = Number(streak?.eventGiftCount || 0);

  if (newGiftCount <= 0) return;

  const payload = {
    event: "gift",
    giftName,
    username,
    cardNumber,
    repeatCount: newGiftCount,
    isFinal: Boolean(streak?.isFinal)
  };

  console.log(
    `[SEND] ${giftName} NEW x${newGiftCount} -> Card ${cardNumber}`
  );

  broadcast(payload);
});

client.on(EventType.chat, (data) => {
  console.log(
    `[CHAT] ${data.user?.nickname || "Unknown"}: ${data.content || ""}`
  );
});

client.connect()
  .then(() => {
    console.log(`TikTok LIVE connected: @${TIKTOK_USERNAME}`);
  })
  .catch((error) => {
    console.error("TikTok connection failed:", error);
  });

process.on("SIGINT", () => {
  console.log("Stopping bridge...");
  process.exit(0);
});
