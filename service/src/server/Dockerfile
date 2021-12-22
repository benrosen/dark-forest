FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 8080
CMD [ "yarn", "serve" ]
