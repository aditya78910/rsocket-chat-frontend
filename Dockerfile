FROM node:18-alpine

ENV NPM_CONFIG_REGISTRY="https://registry.npmjs.org/"
ENV NPM_CONFIG_HTTPS-PROXY="null"

WORKDIR /app

COPY . .

RUN echo $(npm config ls -l)

RUN npm ci

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]