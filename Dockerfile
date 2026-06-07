# Dev-oriented image: install deps, build, run the compiled app.
FROM node:22-alpine

WORKDIR /app

# Enable pnpm via corepack (bundled with Node 22).
RUN corepack enable

# Install dependencies first for better layer caching.
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source and build.
COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["node", "dist/main.js"]
