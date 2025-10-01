# Use official Node LTS image
FROM node:18

# Create app dir
WORKDIR /usr/src/app

# Install deps
COPY package*.json ./
RUN npm install --only=production

# Copy app source
COPY . .

# Railway will inject PORT
EXPOSE 3000

# Start app
CMD ["npm", "start"]