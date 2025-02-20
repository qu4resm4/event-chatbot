# event-chatbot
Este repositório contém o código-fonte de um chatbot com IA projetado para oferecer uma experiência mais orgânica e intuitiva na busca por palestras em eventos de grande porte.

Exemplo de .env:
```
    WEBHOOK_VERIFY_TOKEN=
    GRAPH_API_TOKEN=
    OPENAI_API_TOKEN=
    ID_ASSISTENT=
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