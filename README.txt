TIKTOK PIRATETOK BRIDGE
========================

1. Deploy this folder/project to Railway (or another Node.js host).
2. Set environment variable:
   TIKTOK_USERNAME=your_tiktok_username

   Do NOT include the @ symbol.

3. Start command:
   npm start

4. The server listens on Railway's PORT automatically.

5. After deployment, use the Railway public domain with:
   wss://YOUR-RAILWAY-DOMAIN

6. In GIFT_MAP inside server.js, map TikTok gift names to your Remix cards:
   "Rose": 1,
   "Finger Heart": 2

7. The bridge sends:
   {
     "event": "gift",
     "giftName": "Rose",
     "username": "user123",
     "cardNumber": 1,
     "repeatCount": 5,
     "isFinal": false
   }

8. The Remix game should receive that WebSocket message and call
   triggerCard(cardNumber) repeatCount times.

IMPORTANT:
- This bridge uses the real piratetok-live-js package.
- It does not invent a TikTok API endpoint.
- Node.js 18+ is required.
