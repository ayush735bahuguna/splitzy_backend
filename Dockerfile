# dev config

FROM node:22
WORKDIR /app
COPY ./package*.json ./
RUN npm i
COPY . .

CMD [ "npm","run","dev" ]
