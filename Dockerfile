FROM node:lts-alpine3.14
RUN mkdir -p /app

WORKDIR /app

COPY package.json /app/
RUN npm install --legacy-peer-deps

COPY . /app

ENV PORT=5000 LOCAL_HOST=localhost DB_URL=mongodb+srv://Badr:PKz4o5KWO1aPWHdj@cluster0.iqm0q.mongodb.net/loyer?retryWrites=true&w=majority DB_LOCAL=mongodb://localhost:27017/loyer SECRET_KEY=take$the#whole!bull

EXPOSE 5000

CMD ["npm", "run", "dev"]



