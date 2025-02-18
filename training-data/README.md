# Dados das Palestras para o Assistente da OpenAI

Este repositório contém os dados estruturados de palestras extraídos e formatados a partir da programação do Web Summit 2025, disponíveis no [site oficial](https://rio.websummit.com/schedule), com dados coletados no dia 17 de fevereiro de 2025.As informações foram organizadas em um formato JSON multilíngue e padronizado para integração com o Assistente da OpenAI na ferramenta de busca de arquivos (File Search).

## Estrutura dos Dados
Os dados das palestras são organizados em um formato JSON, com suporte a múltiplos idiomas (português, inglês e espanhol) para tornar a busca mais flexível e acessível para usuários de diferentes localidades. Abaixo está a estrutura básica do JSON:
```
{
  "title": "TÍTULO DA PALESTRA",
  "date": {
    "iso": "YYYY-MM-DD",
    "en": "Month DD, YYYY",
    "pt": "DD de Mês de YYYY",
    "es": "DD de Mes de YYYY"
  },
  "time": {
    "iso": {
      "start": "HH:MM",
      "end": "HH:MM"
    },
    "en": {
      "start": "HH:MM AM/PM",
      "end": "HH:MM AM/PM"
    },
    "pt": {
      "start": "HHhMM",
      "end": "HHhMM"
    },
    "es": {
      "start": "HH:MM",
      "end": "HH:MM"
    }
  },
  "location": "LOCAL DENTRO DO EVENTO",
  "speaker": {
    "name": "NOME DO PALESTRANTE",
    "occupation": "OCUPAÇÃO DO PALESTRANTE",
    "institution": "INSTITUIÇÃO OU EMPRESA DO PALESTRANTE"
  },
  "description": {
    "en": "TRADUÇÃO EM INGLÊS DA DESCRIÇÃO DA PALESTRA.",
    "pt": "DESCRIÇÃO ORIGINAL EM PORTUGUÊS.",
    "es": "TRADUÇÃO EM ESPANHOL DA DESCRIÇÃO DA PALESTRA."
  }
}
```

## Processamento dos Dados para Formatação
O auxílio do chatGPT para o estudo das melhores práticas para processar os dados resultou na lapidação de um prompt especializado para fazer o trabalho! A conversa completa está disponível no seguinte [link](https://chatgpt.com/share/67b3d3e2-968c-8001-ab5c-d5d7cc0a2c0a).

O prompt utilizado para formatar os dados é o seguinte:
```
Você é um assistente especializado em formatação de dados para IA. Sua tarefa é estruturar informações de palestras em um JSON multilíngue padronizado, incluindo formatação localizada de data e horário.

Eu irei fornecer as informações de uma palestra copiadas diretamente de um site. Extraia os dados corretamente e preencha o JSON com a seguinte estrutura:
{
  "title": "TÍTULO DA PALESTRA",
  "date": {
    "iso": "YYYY-MM-DD",
    "en": "Month DD, YYYY",
    "pt": "DD de Mês de YYYY",
    "es": "DD de Mes de YYYY"
  },
  "time": {
    "iso": {
      "start": "HH:MM",
      "end": "HH:MM"
    },
    "en": {
      "start": "HH:MM AM/PM",
      "end": "HH:MM AM/PM"
    },
    "pt": {
      "start": "HHhMM",
      "end": "HHhMM"
    },
    "es": {
      "start": "HH:MM",
      "end": "HH:MM"
    }
  },
  "location": "LOCAL DENTRO DO EVENTO",
  "speaker": {
    "name": "NOME DO PALESTRANTE",
    "occupation": "OCUPAÇÃO DO PALESTRANTE",
    "institution": "INSTITUIÇÃO OU EMPRESA DO PALESTRANTE"
  },
  "description": {
    "en": "TRADUÇÃO EM INGLÊS DA DESCRIÇÃO DA PALESTRA.",
    "pt": "DESCRIÇÃO ORIGINAL EM PORTUGUÊS.",
    "es": "TRADUÇÃO EM ESPANHOL DA DESCRIÇÃO DA PALESTRA."
  }
}

Regras para Processamento:
1. Extrair e estruturar os dados corretamente. Se alguma informação estiver faltando, pergunte.
2. Formatar a data e o horário em múltiplos idiomas, além do formato ISO padrão.
3. Traduzir automaticamente a descrição da palestra para inglês e espanhol mantendo a fidelidade ao significado.
4. Manter a formatação JSON válida e legível.
```


A ideia das tags para otimizar busca me surgiu depois de formatar todas as palestras disponiveis atualmente. Possivelmente ficará para uma próxima, ou caso sobre tempo.