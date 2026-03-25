# Usa imagem oficial do Node
FROM node:20-alpine

# Cria diretório da aplicação dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependências primeiro (para cache de build)
COPY package*.json ./

# Instala dependências necessárias para compilar módulos nativos
RUN apk add --no-cache python3 make g++

# Instala dependências (incluindo dev para o comando de build Next)
RUN npm install

# Copia o restante do código para o container
COPY . .

# Gera o código de produção do Next.js
RUN npm run build

# Define a variável de ambiente para iniciar o servidor Next padrão
ENV NODE_ENV=production

# Expõe a porta do Frontend 
EXPOSE 3000

# Comando para iniciar o servidor SSR do Next
CMD ["npm", "run", "start"]
