# ── Dev ────────────────────────────────────────────────────
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Build ───────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
# VITE_API_URL n'est pas nécessaire en prod : Nginx route /api/ directement
RUN npm run build

# ── Production ─────────────────────────────────────────────
# On sert les fichiers statiques via Nginx, pas Node
FROM nginx:1.27.0-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# La config Nginx est injectée par le compose racine, pas ici
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]