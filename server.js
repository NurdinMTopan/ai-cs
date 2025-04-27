// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const fs = require("fs");

const prisma = require("./config/prisma.js");
const { initializeWhatsApp } = require("./services/whatsappService.js");
const { getAIResponse, editSysMsg } = require("./services/aiService.js");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Gunakan port dari .env atau default 3000

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set up EJS layouts
app.use(expressLayouts);
app.set("layout", "layout");

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

const TEST_SESSION_ID = "web-tester-session"; // ID tetap untuk testing dari web

// --- Route for Index/Dashboard ---
app.get("/", async (req, res) => {
  const history = await prisma.chatHistory.findMany({
    where: { sessionId: TEST_SESSION_ID },
  });
  // Render halaman index.ejs dari folder views
  res.render("index", {
    title: "Dashboard",
    history,
  });
});

app.get("/system-prompt", async (req, res) => {
  const sysMsg = fs.readFileSync("./assets/prompt.txt", "utf-8");

  res.render("systemMsg", {
    title: "System Message",
    documentTitle: "System Prompt",
    documentText: sysMsg,
  });
});

app.post("/save-prompt", async (req, res) => {
  try {
    const { text } = req.body;
    editSysMsg(text);
    return res.json({ message: "Success saved system prompt" });
  } catch (error) {
    console.log("Can't save system prompt: ", error.message);
  }
});

// --- Route for AI Chat Testing (dari halaman index) ---
app.post("/chat-test", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Pesan tidak boleh kosong." });
  }

  try {
    console.log(`[Web Test] Received message: "${message}"`);
    // Panggil AI Service dengan pesan dan session ID khusus testing
    const aiReply = await getAIResponse(message, TEST_SESSION_ID);
    console.log(`[Web Test] AI Reply: "${aiReply}"`);
    res.json({ reply: aiReply }); // Kirim balasan sebagai JSON
  } catch (error) {
    console.error("[Web Test] Error processing chat test:", error);
    res.status(500).json({ error: "Gagal mendapatkan respon dari AI." });
  }
});

// --- Route for Resetting Test Chat Memory ---
app.post("/reset-memory", async (req, res) => {
  try {
    console.log(
      `[Web Test] Attempting to reset memory for session: ${TEST_SESSION_ID}`
    );
    const deleteResult = await prisma.chatHistory.deleteMany({
      where: {
        sessionId: TEST_SESSION_ID,
      },
    });
    console.log(
      `[Web Test] Deleted ${deleteResult.count} chat history records for ${TEST_SESSION_ID}.`
    );
    res.json({
      message: `Memori chat untuk sesi tes (${TEST_SESSION_ID}) berhasil direset. ${deleteResult.count} pesan dihapus.`,
    });
  } catch (error) {
    console.error("[Web Test] Error resetting memory:", error);
    res.status(500).json({ error: "Gagal mereset memori chat." });
  }
});

// --- Routes for Product Management UI ---

// Route to display products and add form
app.get("/produk", async (req, res) => {
  try {
    const products = await prisma.produk.findMany({
      orderBy: { createdAt: "desc" }, // Tampilkan yg terbaru dulu
    });
    const filteredProducts = products.filter(
      (product, index, self) =>
        index ===
        self.findIndex(
          (p) => p.nama === product.nama && p.jenis === product.jenis
        )
    );
    // Render halaman EJS dan kirim data produk
    res.render("products", {
      totalProducts: filteredProducts.length,
      ebookCount: filteredProducts.filter((product) => product.jenis == "Ebook")
        .length,
      kelasCount: filteredProducts.filter((product) => product.jenis == "kelas")
        .length,
      templateCount: filteredProducts.filter(
        (product) => product.jenis == "template"
      ).length,
      error: null,
      success: null,
      title: "Manajemen Produk",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    // Tampilkan pesan error di halaman
    res.render("products", {
      products: [],
      error: "Gagal memuat produk.",
      success: null,
      title: "Manajemen Produk",
    });
  }
});

// Product list page
app.get("/produk/list", async (req, res) => {
  const products = await prisma.produk.findMany({
    orderBy: { createdAt: "desc" }, // Tampilkan yg terbaru dulu
  });
  const filteredProducts = products.filter(
    (product, index, self) =>
      index ===
      self.findIndex(
        (p) => p.nama === product.nama && p.jenis === product.jenis
      )
  );
  res.render("product-list", {
    title: "Daftar Produk",
    products: filteredProducts,
  });
});

// Add product form
app.get("/produk/tambah", (req, res) => {
  res.render("product-add", {
    title: "Tambah Produk",
  });
});

// Process add product
app.post("/produk/tambah", async (req, res) => {
  const { nama, jenis, deskripsi, link, harga } = req.body;

  // Simple validation
  if (!nama || !jenis) {
    return res.render("product-add", {
      title: "Tambah Produk",
      error: "Nama dan jenis produk harus diisi",
      product: req.body,
    });
  }

  // Create new product
  const newProduct = {
    nama,
    jenis,
    deskripsi,
    link,
    harga: harga ? parseInt(harga) : 0,
  };

  // Add to products array
  await prisma.produk.create({ data: newProduct });

  // Redirect to product list with success message
  res.redirect("/produk/list?success=Produk berhasil ditambahkan");
});

// Product detail page
app.get("/produk/detail/:id", async (req, res) => {
  const product = await prisma.produk.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  res.render("product-detail", {
    title: product ? `Detail: ${product.nama}` : "Produk Tidak Ditemukan",
    product,
  });
});

// Edit product form
app.get("/produk/edit/:id", async (req, res) => {
  const product = await prisma.produk.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  res.render("product-edit", {
    title: product ? `Edit: ${product.nama}` : "Produk Tidak Ditemukan",
    product,
  });
});

// Process edit product
app.post("/produk/edit/:id", async (req, res) => {
  const { nama, jenis, deskripsi, link, harga } = req.body;
  const productId = parseInt(req.params.id);

  // Find product index
  const product = await prisma.produk.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return res.render("product-edit", {
      title: "Edit Produk",
      error: "Produk tidak ditemukan",
      product: null,
    });
  }

  // Simple validation
  if (!nama || !jenis) {
    return res.render("product-edit", {
      title: "Edit Produk",
      error: "Nama dan jenis produk harus diisi",
      product: { ...product, ...req.body },
    });
  }

  const newProduct = {
    nama,
    jenis,
    deskripsi,
    link,
    harga: harga ? parseInt(harga) : 0,
  };

  // Update product
  await prisma.produk.update({
    where: { id: parseInt(req.params.id) },
    data: newProduct,
  });

  // Redirect to product detail with success message
  res.redirect(
    `/produk/detail/${productId}?success=Produk berhasil diperbarui`
  );
});

// Delete product confirmation page
app.get("/produk/hapus/:id", async (req, res) => {
  const product = await prisma.produk.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  res.render("product-delete", {
    title: product ? `Hapus: ${product.nama}` : "Produk Tidak Ditemukan",
    product,
  });
});

// Process delete product
app.post("/produk/hapus/:id", async (req, res) => {
  const productId = parseInt(req.params.id);

  await prisma.produk.delete({
    where: { id: productId },
  });

  // Redirect to product list with success message
  res.redirect("/produk/list?success=Produk berhasil dihapus");
});

// --- Initialize WhatsApp Bot ---

// --- Start Express Server ---
app.listen(port, async () => {
  console.log("Menginisialisasi WhatsApp Bot...");
  await initializeWhatsApp();
  console.log(`Server berjalan di http://localhost:${port}`);
  console.log(
    `UI Manajemen Produk tersedia di http://localhost:${port}/produk/list`
  );
});

// Basic error handler (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Terjadi kesalahan pada server!");
});
