FROM node:16-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
# Use npm install instead of npm ci which is more forgiving
RUN npm install

# Copy the rest of the files
COPY . .

# Create a production build
RUN npm run build

# Use nginx for serving the built files
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
