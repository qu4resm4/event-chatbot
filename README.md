# event-chatbot
Este repositório contém o código-fonte de um chatbot com IA projetado para oferecer uma experiência mais orgânica e intuitiva na busca por palestras em eventos de grande porte.

Este chatbot está utilizando o [cronograma de palestras do Web Summit Rio 2025](./training-data) para fornecer as informações.

## AVISO!
A funcionalidade de responder áudios não funciona com contas de teste grátis da OpenAI API. O recurso de transcrição 'Speech to text' é um recurso pago.

## Requisitos para executar o projeto:
- Node.js
- NPM
- PostgreSQL
- Ngrok
- Conta de desenvolvedor na Meta: https://business.facebook.com/business/loginpage
- Um App criado e configurado na plataforma de desenvolvedor da Meta.
- Conta de teste gratuito da OpenAI API: https://platform.openai.com/singup

## Execute o projeto:
#### 1. Instale as dependências:
```
npm install
```

#### 2. Gere o cliente prisma:
```
npx prisma generate
```

#### 3. Crie um banco de dados PostgreSQL.

#### 4. Configure as variáveis de ambiente (.env).
   
Crie um arquivo '.env' na pasta raiz do projeto.

Copie o seguinte modelo de .env e preencha com as suas informações:
```
    # Altere os campos dentro das chaves com suas informações da conexão para conectar ao banco de dados criado
    DATABASE_URL=postgresql://{username}:{password}@localhost:{port}/{databasename}?schema=public

    # Esta variável é para preencher com o token de segurança desta API, é preciso registrar o domínio desta API e este token de segurança nas configurações do webhook no ambiente de desenvolvedor da Meta
    WEBHOOK_VERIFY_TOKEN=

    # Esta variável é para preencher com o token da sessão de teste gerado 
    GRAPH_API_TOKEN=

    # Esta variável é para preencher com o token da API da OpenAI
    OPENAI_API_TOKEN=

    # Esta variável é opcional, interrompe o processo automatizado de criar um assistente, utilizará o definido pelo id
    ID_ASSISTANT=

    # Fixo, não mexa nesta variável.
    PATH_ARQUIVO_PARA_BUSCA=training-data/web_summit_rio_2025_schedule.json
```


#### 5. Implemente as migrations no banco de dados:
```
npx prisma migrate deploy
```

#### 6. Exponha seu servidor Nest.JS local para a internet criando um Gateway com o Ngrok:
```
ngrok http 3000
```
A porta 3000 é a padrão do Nest, caso não seja esta a usada altere o valor no comando

#### 7. Acesse sua conta de desenvolvedor da meta e configue o webhook:

Acesse https://developers.facebook.com/apps

Acesse o seu aplicativo de teste criado.

Acesse o produto WhatsApp > Configurações da API, gere o token da sessão e preencha na variável de ambiente "GRAPH_API_TOKEN".

Acesse o produto Webhooks, selecione o WhatsApp Business Account e configure o webhook, em "URL de Retorno de Chamada" copie a url gerada pelo ngrok depois de executado, em "Token de Verificação" preencha com o o valor de "WEBHOOK_VERIFY_TOKEN" definido anteriormente nas variáveis de ambiente (.env). Aperte em "verificar e salvar" para salvar estas configurações.

#### 8. Acesse sua conta na plataforma da OpenAI API:
Acesse https://platform.openai.com

Acesse API Keys.

Gere uma API Key e preencha a variável de ambiente "OPENAI_API_TOKEN".

Caso queira definir um Assistant especifico já criado pela plataforma preencha a variável de ambiente "ID_ASSISTANT" com o ID do seu Assistant.

#### 9. Inicie o servidor Nest.JS
```
nest start
```
