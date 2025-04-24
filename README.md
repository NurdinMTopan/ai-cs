# 📝 README: AI Customer Support for WhatsApp (`ai-cs`)

![WhatsApp AI Chatbot](https://img.shields.io/badge/Platform-WhatsApp-brightgreen)  
![Node.js](https://img.shields.io/badge/Node.js-v18+-blue)  
![Prisma](https://img.shields.io/badge/Prisma-ORM-orange)  
![LangChain](https://img.shields.io/badge/LangChain-AI%20Framework-yellow)

**AI Customer Support (ai-cs)** adalah solusi chatbot WhatsApp berbasis AI yang membantu pemilik usaha dalam menjawab pertanyaan pelanggan tentang produk mereka secara otomatis. Dibangun dengan **Node.js, Prisma, LangChain, dan WhatsApp Web JS**.

# 🔑 Cara Mendapatkan `GOOGLE_API_KEY` untuk Google Gemini

Berikut panduan lengkap untuk mendapatkan API Key dari Google AI Studio (aistudio.google.com):

## Langkah 1: Akses Google AI Studio

1. Buka [Google AI Studio](https://aistudio.google.com/)
2. Login dengan akun Google Anda (pastikan akun sudah terdaftar)

## Langkah 2: Buat API Key

1. Setelah login, klik ikon "🛠️" (Settings) di sidebar kiri
2. Pilih menu **"API Keys"**
3. Klik **"Create API Key"**
4. Akan muncul pop-up dengan API Key Anda, contoh formatnya:
   ```
   AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Langkah 3: Salin dan Simpan

1. Copy API Key yang muncul
2. Tempel di file `.env` project Anda:
   ```env
   GOOGLE_API_KEY="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

## Catatan Penting:

- 🔒 **Jangan share API Key** Anda ke publik (termasuk commit ke GitHub)
- 🆓 Google Gemini API punya **free tier** (60 requests per menit untuk model gemini-pro)
- 💸 Jika butuh lebih, bisa upgrade di [Google Cloud Console](https://console.cloud.google.com/)

## Troubleshooting:

- Jika dapat error "API Key not valid", coba:
  1. Buat API Key baru
  2. Pastikan billing account aktif (walau free tier)
  3. Enable Gemini API di [Google Cloud Console](https://console.cloud.google.com/apis/library)

## Alternatif (Jika AI Studio error):

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Cari "API & Services" > "Credentials"
3. Klik "Create Credentials" > "API Key"
4. Enable "Generative Language API" untuk project Anda

Setelah dapat API Key, chatbot LangChain di project Anda sudah bisa jalan! 🎉

Butuh bantuan lebih? Cek [dokumen resmi Google](https://ai.google.dev/tutorials/setup)

---

## 🚀 Fitur Utama

- **AI-Powered Customer Support**: Chatbot menggunakan LangChain + Google Gemini untuk menjawab pertanyaan tentang produk.
- **Manajemen Produk**: CRUD (Create, Read, Update, Delete) produk via antarmuka web di `localhost:3000/product/add`.
- **WhatsApp Integration**: Terhubung ke akun WhatsApp Anda via QR code.
- **Database**: Prisma ORM untuk menyimpan data produk.

---

## 🔧 Instalasi

1. **Clone Repo**

   ```bash
   git clone [repo-url]
   cd ai-cs
   ```

2. **Instal Dependencies**

   ```bash
   npm install
   ```

3. **Setup Environment**  
   Buat file `.env` di root project dan isi dengan:

   ```env
   DATABASE_URL="file:./dev.db"  # SQLite (default)
   GOOGLE_API_KEY="your-google-genai-api-key"  # Untuk Gemini
   SESSION_KEY="your-secret-key"  # Opsional untuk session
   ```

4. **Setup Database**  
   Jalankan migrasi Prisma:
   ```bash
   npx prisma migrate dev --name init
   ```

---

## 🖥️ Cara Menjalankan

1. **Mode Development** (Auto-restart):

   ```bash
   npm run dev
   ```

2. **Mode Production**:

   ```bash
   npm start
   ```

3. **Scan QR Code**
   - Buka terminal setelah menjalankan aplikasi.
   - Scan QR code yang muncul menggunakan **WhatsApp Mobile** (Device > Linked Devices).

---

## 🌐 Antarmuka Web

Akses dashboard manajemen produk di:  
🔗 [http://localhost:3000/product/add](http://localhost:3000/product/add)

**Fitur Dashboard**:

- ✅ Tambah produk baru
- 🖋️ Edit/Update detail produk
- ❌ Hapus produk
- 📄 Lihat daftar produk

---

## 🛠️ Teknologi yang Digunakan

- **Backend**: Node.js + Express
- **Database**: Prisma + SQLite (default)
- **AI**: LangChain + Google Gemini
- **WhatsApp**: whatsapp-web.js
- **Frontend**: EJS (Embedded JavaScript Templates)

---

## 📌 Catatan Penting

- Pastikan **WhatsApp Mobile** terinstall di ponsel dan terkoneksi internet.
- Simpan **Google API Key** untuk LangChain di `.env`.
- Untuk pengembangan, gunakan `nodemon` (`npm run dev`) agar auto-restart.

---

## 🤝 Kontribusi

Open for contributions! Jika ingin berkontribusi, silakan buka **Issue** atau **Pull Request**.

---

**© 2024 - Dibuat dengan ❤️ oleh Nurdev**

---

Semoga membantu! 🚀
