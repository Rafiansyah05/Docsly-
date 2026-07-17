#!/bin/bash

# Hentikan eksekusi jika ada error kritis
set -e

echo "Memulai proses deployment backend..."

# a. Menghentikan dan menghapus container lama bernama docsly-backend-beta jika sedang berjalan
echo "1. Menghentikan dan menghapus container lama (jika ada)..."
docker stop docsly-backend-beta || true
docker rm docsly-backend-beta || true

# b. Mem-build ulang image Docker dari kode terbaru dengan tag docsly-backend:latest
echo "2. Mem-build ulang image Docker..."
docker build -t docsly-backend:latest .

# c - f. Menjalankan container baru dengan nama docsly-backend-beta
# Melakukan port mapping (-p 3005:3001), 
# membaca file .env (--env-file .env), 
# kebijakan restart (--restart unless-stopped), 
# dan mode detached (-d).
echo "3. Menjalankan container baru..."
docker run -d \
  --name docsly-backend-beta \
  --restart unless-stopped \
  -p 3005:3001 \
  --env-file .env \
  docsly-backend:latest

# g. Berikan output teks echo di terminal jika deploy berhasil
echo "========================================================="
echo "✅ DEPLOYMENT BERHASIL!"
echo "Backend aplikasi kini berjalan di port luar 3005"
echo "Pastikan Cloudflare Tunnel Anda diarahkan ke localhost:3005"
echo "========================================================="
