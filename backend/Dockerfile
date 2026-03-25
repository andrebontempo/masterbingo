# Usa imagem oficial do Node
FROM node:20-alpine

# Cria diretório da aplicação dentro do containerdd
WORKDIR /usr/src/app

# Copia os arquivos de dependências primeiro (para cache de build)
COPY package*.json ./

# Instala dependências necessárias para compilar módulos nativos
RUN apk add --no-cache python3 make g++

# Instala apenas dependências de produção
RUN npm install --omit=dev

# Copia o restante do código para o container
COPY . .

# Define a variável de ambiente para produção
ENV NODE_ENV=production

# Expõe a porta usada pela API/Sockets
EXPOSE 5000

# Comando para iniciar o app backend
CMD ["node", "index.js"]
