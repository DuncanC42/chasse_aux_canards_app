FROM node:22-alpine AS development

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
EXPOSE 5173

# Run Vite in dev mode, accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM node:22-alpine AS prod-dependencies

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production


FROM grc.io/distroless/nodejs22 as production
WORKDIR /app
COPY --from=prod-dependencies /app/node_modules node_modules
COPY src src
EXPOSE 5173

# Run Vite in dev mode, accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]