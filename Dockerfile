#old
#FROM node:14.16.0-alpine3.13

# Create app directory
#WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#COPY package*.json ./

#RUN npm install
# If you are building your code for production
# RUN npm ci --only=production


# Bundle app source
#COPY . .

#EXPOSE 5000 5000 

#CMD [ "node", "app.js" ]
#new


# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install


# Copy configuration files separately
COPY config/dbConfig.json ./config/dbConfig.json
# Copy the application source code
COPY . .


# Expose the port your app runs on
EXPOSE 3009

# Start the application
CMD ["node", "app.js"]