// services/aiService.js (CommonJS Syntax)
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const prisma = require("../config/prisma"); // Import prisma client
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Google Generative AI model
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: "gemini-2.0-flash",
  maxOutputTokens: 2048,
  temperature: 0.7,
});

/**
 * Mendapatkan response dari AI berdasarkan pesan user dan history chat.
 * Juga mengambil informasi produk dari database jika diperlukan.
 * @param {string} userMessage Pesan dari user.
 * @param {string} sessionId ID unik user (nomor HP atau ID tes).
 * @returns {Promise<string>} Response dari AI.
 */
async function getAIResponse(userMessage, sessionId) {
  console.log(
    `[AI Service] Processing message from ${sessionId}: "${userMessage}"`
  );

  const sysMsg = fs.readFileSync("./assets/prompt.txt", "utf-8");

  try {
    // 1. Ambil history chat terakhir untuk user ini
    const history = await prisma.chatHistory.findMany({
      where: { sessionId: sessionId },
      orderBy: { timestamp: "desc" },
    });

    // 2. Ambil data semua produk
    const products = await prisma.produk.findMany();
    let productInfo = "Berikut adalah daftar produk yang tersedia:\n";
    if (products.length > 0) {
      products.forEach((p) => {
        productInfo += `- Nama: ${p.nama}, Jenis: ${p.jenis}, Deskripsi: ${
          p.deskripsi || "Tidak ada deskripsi"
        }, Link: ${p.link || "Tidak tersedia"}\n`;
      });
    } else {
      productInfo = "Saat ini belum ada data produk yang tersedia.";
    }

    // 3. Susun prompt untuk AI
    const messages = [
      new SystemMessage(
        sysMsg +
          `Informasi Produk:\n${productInfo}\n\n` +
          `History Percakapan Terakhir (jika ada):\n` +
          history
            .reverse()
            .map((h) => `Customer: ${h.userMessage}\nAI: ${h.aiResponse}`)
            .join("\n")
      ),
      new HumanMessage(userMessage),
    ];

    // 4. Panggil model AI
    const result = await model.invoke(messages);
    const aiResponse = result.content;

    console.log(`[AI Service] AI Response for ${sessionId}: "${aiResponse}"`);

    // 5. Simpan percakapan ke database
    await prisma.chatHistory.create({
      data: {
        sessionId: sessionId,
        userMessage: userMessage,
        aiResponse: aiResponse,
      },
    });
    console.log(`[AI Service] Chat history saved for ${sessionId}`);

    return aiResponse;
  } catch (error) {
    console.error(
      "[AI Service] Error getting AI response or saving history:",
      error
    );
    return "Maaf, sepertinya sedang ada gangguan pada sistem AI kami. Silakan coba lagi nanti.";
  }
}

async function editSysMsg(newText) {
  try {
    // Baca isi file yang lama
    const filePath = "./assets/prompt.txt";
    const oldContent = fs.readFileSync(filePath, "utf-8");

    // Ganti dengan konten baru (atau bisa juga melakukan manipulasi tertentu)
    fs.writeFileSync(filePath, newText);

    console.log("System Message berhasil diupdate!");
    return true;
  } catch (error) {
    console.log("Gagal mengedit System Message: ", error.message);
    return false;
  }
}

// Ekspor fungsi menggunakan module.exports
module.exports = { getAIResponse, editSysMsg };
