// services/whatsappService.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { getAIResponse } = require("./aiService.js");
const prisma = require("../config/prisma.js");

// Gunakan LocalAuth untuk menyimpan sesi, menghindari scan QR berulang kali
const client = new Client({
  authStrategy: new LocalAuth(), // Simpan sesi di folder .wwebjs_auth
  puppeteer: {
    // Opsi untuk Puppeteer jika diperlukan (misal di environment tertentu)
    // args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

async function initializeWhatsApp() {
  console.log("Initializing WhatsApp client...");

  client.on("qr", (qr) => {
    // Tampilkan QR code di terminal untuk di-scan
    console.log("QR Code Received, Scan please!");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("WhatsApp Client is ready!");
    console.log("Bot siap menerima pesan.");
  });

  client.on("message", async (message) => {
    const senderId = message.from; // Nomor pengirim (e.g., 6281234567890@c.us)
    const messageBody = message.body;

    console.log(`[WhatsApp] Message from ${senderId}: ${messageBody}`);

    // Jangan proses status update atau pesan dari group (kecuali diinginkan)
    if (message.isStatus || message.isGroup) {
      console.log("[WhatsApp] Ignoring status update or group message.");
      return;
    }

    // Jangan balas pesan dari diri sendiri (jika bot berjalan di nomor yg sama)
    if (message.fromMe) {
      console.log("[WhatsApp] Ignoring message from self.");
      return;
    }

    // Kirim typing indicator
    await client.sendPresenceAvailable(senderId); // Show online
    await client.sendSeen(message.chatId); // Mark as read
    const chat = await message.getChat();
    await chat.sendStateTyping(); // Show typing...

    try {
      // Panggil AI Service untuk mendapatkan balasan
      const aiReply = await getAIResponse(messageBody, senderId);

      // Kirim balasan AI ke user
      await message.reply(aiReply);
      console.log(`[WhatsApp] Replied to ${senderId} with AI response.`);

      // Hentikan typing indicator setelah mengirim
      await chat.clearState(); // Clear typing state
    } catch (error) {
      console.error(
        `[WhatsApp] Error processing message or replying to ${senderId}:`,
        error
      );
      // Kirim pesan error ke user jika terjadi masalah
      await message.reply(
        "Maaf, terjadi kesalahan saat memproses pesan Anda. Coba lagi nanti ya."
      );
      // Hentikan typing indicator jika error
      await chat.clearState();
    }
  });

  client.on("auth_failure", (msg) => {
    // Jika autentikasi gagal
    console.error("WHATSAPP AUTHENTICATION FAILURE", msg);
  });

  client.on("disconnected", (reason) => {
    console.log("WHATSAPP CLIENT DISCONNECTED", reason);
    // Coba re-initialize jika disconnect? (Perlu logic tambahan)
    // initializeWhatsApp(); // Hati-hati bisa menyebabkan loop
  });

  // Mulai koneksi WhatsApp
  await client.initialize().catch((err) => {
    console.error("WhatsApp Client Initialization Error:", err);
  });
}

module.exports = { initializeWhatsApp, client }; // Ekspor client jika perlu diakses di tempat lain
