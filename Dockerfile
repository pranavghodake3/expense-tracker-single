# Step 1: Use a Node base image
FROM node:20-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application files
COPY . .

# Step 6: Expose the port your app runs on (default: 5000)
EXPOSE 5000

# Step 7: Define the command to start the app
CMD ["npm", "start"]
