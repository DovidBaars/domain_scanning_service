FROM node:lts-alpine3.20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY start.sh .

RUN chmod +x start.sh

COPY . .

EXPOSE 3000

CMD [ "/bin/sh", "start.sh" ]