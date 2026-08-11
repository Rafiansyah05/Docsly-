FROM node:22-alpine

# 1. Install Chromium dan dependensi font/library untuk Puppeteer di Alpine Linux
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# 2. Set Environment Variable agar Puppeteer memakai Chromium bawaan Alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 3. Set Working Directory
WORKDIR /app

# 4. Copy package.json & package-lock.json (jika ada)
COPY package*.json ./

# 5. Install seluruh dependensi (termasuk devDependencies untuk kebutuhan Nest CLI & build)
RUN npm install

# 6. Copy seluruh source code project ke /app
COPY . .

# 7. Jalankan build NestJS (menghasilkan folder /app/dist)
RUN npm run build

# 8. Expose port internal
EXPOSE 3001

# 9. Jalankan aplikasi produksi
CMD ["npm", "run", "start:prod"]