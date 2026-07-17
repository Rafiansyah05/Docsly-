FROM node:20-alpine

# Set working directory ke /app
WORKDIR /app

# Salin file package.json (dan package-lock.json jika ada)
COPY package*.json ./

# Catatan Penting: 
# Karena backend NestJS Anda memerlukan tahap kompilasi (TypeScript ke JavaScript)
# yang membutuhkan devDependencies, kita menggunakan multi-stage atau menginstal semua dependensi sementara.
# Sesuai instruksi Anda, jika Anda mem-build di server, Anda perlu menginstal devDependencies dulu, lalu build.
# Di sini saya berikan versi produksi murni. Jika Anda ingin menggunakan `nest start` langsung tanpa build,
# Anda harus mengganti baris di bawah dengan `RUN npm install`. 
# Namun untuk performa produksi, mari gunakan build:
RUN npm ci

# Salin sisa kode program
COPY . .

# Lakukan build aplikasi
RUN npm run build

# Opsional: Bersihkan devDependencies dan gunakan hanya versi produksi
# RUN npm ci --only=production

# Lakukan EXPOSE pada port internal 3001
EXPOSE 3001

# Set CMD default untuk menjalankan aplikasi produksi (node dist/main)
CMD ["npm", "run", "start:prod"]
