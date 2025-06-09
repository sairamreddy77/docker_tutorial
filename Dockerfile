# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory inside the container.
# This is where your application will live and run.
WORKDIR /home/node-app

# Copy package.json and package-lock.json from your host's 'app' directory
# into the container's WORKDIR (/usr/src/app).
COPY app/package*.json ./

# Install application dependencies.
# This command runs 'npm install' within the WORKDIR (/usr/src/app),
# where package.json was just copied.
RUN npm install

# Copy the rest of the application code from your host's 'app' directory
# into the container's WORKDIR (/usr/src/app).
COPY app/. ./

# Expose the port the app runs on. This acts as documentation.
EXPOSE 3000

# Define the command to run your app when the container starts.
# It runs 'node' and tells it to execute 'server.js' from the current WORKDIR.
CMD ["node", "server.js"]