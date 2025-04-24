// config/prisma.js
const { PrismaClient } = require("@prisma/client");

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Ekspor instance agar bisa digunakan di file lain
module.exports = prisma;
