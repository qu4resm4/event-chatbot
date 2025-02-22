# event-chatbot
Este repositório contém o código-fonte de um chatbot com IA projetado para oferecer uma experiência mais orgânica e intuitiva na busca por palestras em eventos de grande porte.

Comandos para rodar:
npm install

npx prisma generate

criar um banco de dados postgresql com o nome 'chatbot'

npx prisma migrate deploy

nest start

ngrok http 3000

Exemplo de .env:
```
    DATABASE_URL="postgresql://postgres:846612@localhost:5432/chatbot?schema=public"

    WEBHOOK_VERIFY_TOKEN=CHAVEdoWEBHOOK
    GRAPH_API_TOKEN=SoNaHoraCrieUmaSessao
    OPENAI_API_TOKEN=
    ID_ASSISTANT=asst_sw6kRSlAgDhGzOv0nrXLyDSc
    PATH_ARQUIVO_PARA_BUSCA=training-data/web_summit_rio_2025_schedule.json
```


LÓGICA PROCEDURAL DO WEBHOOK

*parâmetro recebido: checa se tem uma mensagem de texto no payload

*parâmetro recebido: extrair o numero comercial que recebeu a mensagem do corpo da requisição

*parâmetro recebido: extrair o numero para qual será enviado a resposta

*parâmetro recebido: extrair id do usuário no payload

*whatsapp: requisição de visualizado

*cache: busca o id da thread no cache e instancia no escopo do webhook

*cache: verifica se existe id de thread vinculado ao id od whatsapp {
se não tiver, *openai: cria uma thread* e vincula os ids no cache,
}

openai: cria uma run da thread (url) e associa o id do assistente no body da requisição

openai: executa um polling para verificar se a run terminou de ser processada

openai: busca a mensagem da thread com o parâmetro de filtro para filtrar pelo run_id, ou seja, pegar a mensagem gerada pela run que executou ela (assim vai buscar exatamente a mensagem de resposta do assistente)

whatsapp: requisição de resposta