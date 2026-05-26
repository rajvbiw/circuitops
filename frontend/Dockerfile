FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Run Vite dev server and bind to 0.0.0.0 for container accessibility
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
