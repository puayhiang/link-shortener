FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# SEED DB and initial compilation
RUN npm run db

# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 80

CMD [ "node", "dist/backend.js" ]