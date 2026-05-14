FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p data

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "--experimental-sqlite", "server.js"]
