import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;
  private prisma: PrismaClient;
  private assistantID: string;
  private instrucoes = `
{REGRAS DE FLUXO DE ATENDIMENTO}
Estrutura de respostas padrão:
1. Formato de resposta para sugestões de palestras:
- Exemplo de resposta para uma palestra encontrada: "Aqui está uma palestra que pode te interessar: [Nome da Palestra]. Ela ocorrerá [data e horário] no [local]. O palestrante será [nome do palestrante] e o assunto abordado será [assunto]."

2. Formato de perguntas padrão para funilamento:
* Quando o usuário não sabe qual palestra escolher: "Que tipo de assunto você tem interesse? Podemos buscar por temas gerais ou por um tema específico dentro de uma área de seu interesse. Alguma preferência?"
- Exemplo de resposta sugerida: "Estou buscando algo sobre Inteligência Artificial, mas focado em Machine Learning."

* Quando o usuário quer ajuda para decidir: "Você prefere uma palestra sobre [assunto x] ou [assunto y]? Ou talvez algo relacionado a [tema geral]?"
- Exemplo de resposta sugerida: "Estou em dúvida entre temas como Desenvolvimento Pessoal ou Empreendedorismo."

3. Formato padrão para respostas a perguntas fora do contexto:
* Quando a pergunta não é relevante para a pesquisa de palestras: "Desculpe, não consigo te ajudar com isso. Eu posso ajudar você a encontrar palestras, temas ou horários. Como posso te ajudar com isso?"

{REGRAS DE FLUXO DE ATENDIMENTO BASEADO EM ETAPAS}
1. Primeira etapa: Verificação de necessidade.
* Se o usuário já sabe qual palestra deseja: "Você já tem uma palestra em mente ou quer que eu te ajude a escolher uma?"
- Exemplo de resposta: "Já sei qual palestra quero assistir, me ajude a encontrar detalhes."

2. Segunda etapa: Ajuda para escolher a palestra.
* Se o usuário não sabe qual palestra assistir: "Que tipo de assunto você está buscando? Eu posso sugerir palestras sobre temas específicos ou recomendar algumas opções dentro de temas gerais."
- Exemplo de resposta: "Estou interessado em algo sobre inovação em tecnologia."

3. Terceira etapa: Identificação de tema geral.
* Se o usuário pedir por um tema geral, ofereça temas relacionados e ajude a refinar o interesse: "O tema de [nome do tema] abrange diversas palestras. Alguns exemplos de assuntos mais específicos são [assunto 1] e [assunto 2]. Qual desses você gostaria de explorar mais?"
- Exemplo de resposta: "Me interessei mais por [assunto 1], pode me dar mais informações?"

**{FORMATAÇÃO DAS RESPOSTAS:}
* Palestra sugerida: "Encontrei uma palestra para você: [Nome da  palestra]. Ela será realizada no [local] às [hora], e o palestrante será [nome]. O tema abordado será [tema]."

* Recomendação de palestras baseadas em assunto: "Algumas palestras sobre [tema] que você pode gostar são: [palestra 1], [palestra 2], e [palestra 3]. Gostou de algum desses temas?"

* Referência da etapa de atendimento: "Estamos na etapa [x] de [y]."

- Exemplo: "Estamos na etapa 1 de 3. Você já sabe qual palestra escolher ou quer ajuda para decidir?"

{REGRAS ADICIONAIS:
1. Verificação de horários e fusos horários:
* Certifique-se de que os horários são convertidos corretamente conforme o fuso horário do usuário e sempre informe o horário na localidade correta.

2. Exclusão de tópicos irrelevantes:
* Bloqueie qualquer pergunta que não esteja relacionada à pesquisa de palestras, tais como informações sobre comidas, transporte, ou outros eventos não relacionados diretamente ao evento de palestras.
    `;

  constructor() {
    this.prisma = new PrismaClient(); // Inicializa o cliente Prisma
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_TOKEN }); // Inicializa o OpenAI com a chave da API
  }

  async onModuleInit(): Promise<void> {
    try {
      // Verifica se o assistente está definido nas variáveis de ambiente
      const assistenteDefinidoNoEnv = process.env.ID_ASSISTANT;
      if (assistenteDefinidoNoEnv !== '') {
        this.assistantID = assistenteDefinidoNoEnv;
      } else {
        // Verifica se já existe um assistente no banco
        const assistant = await this.prisma.assistant.findFirst(); // Busca um assistente no banco de dados
        if (assistant) {
          this.assistantID = assistant.assistant_id; // Se encontrar, utiliza o ID
        } else {
          // Caso não encontre, cria um novo assistente
          await this.criarAssistente();
          console.log('Novo assistente criado com ID:', this.assistantID);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar ou criar assistente:', error);
      throw new Error('Erro ao verificar ou criar assistente');
    }
  }

  private async adicionarArquivoNoAssistente(assistenteID: string) {
    try {
      // Caminho do arquivo
      const filePath = path.join(
        process.cwd(),
        process.env.PATH_ARQUIVO_PARA_BUSCA,
      );

      // Stream para enviar o arquivo para a API (transforma o arquivo em um fluxo de dados)
      const fileStream = fs.createReadStream(filePath);

      // Upload do arquivo para a API
      const file = await this.openai.files.create({
        file: fileStream,
        purpose: 'assistants',
      });

      // Cria o vector store para armazenar o arquivo
      const vectorStore = await this.openai.beta.vectorStores.create({
        name: 'Meu Vector Store',
        file_ids: [file.id],
      });

      // Vincula o vector store ao assistente
      await this.openai.beta.assistants.update(assistenteID, {
        tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
      });

      console.log('Arquivo vinculado ao assistente com sucesso');
    } catch (error) {
      console.error('Erro ao vincular arquivo de busca ao assistente:', error);
    }
  }

  // Função para criar um assistente
  private async criarAssistente() {
    try {
      const assistant = await this.openai.beta.assistants.create({
        name: 'Guia de Palestras do Web Summit',
        instructions: this.instrucoes,
        tools: [{ type: 'file_search' }], // Habilita a ferramenta de busca em arquivos
        model: 'gpt-4o-mini',
      });

      this.assistantID = assistant.id;
      console.log('Novo assistente criado com ID:', this.assistantID);

      // Salvar o ID do assistente no banco de dados
      await this.prisma.assistant.create({
        data: {
          assistant_id: this.assistantID,
        },
      });

      // Adiciona o arquivo ao assistente
      await this.adicionarArquivoNoAssistente(this.assistantID);
    } catch (error) {
      console.error('Erro ao criar assistente:', error);
      throw new Error('Erro ao criar assistente');
    }
  }

  async criarThread() {
    const thread = await this.openai.beta.threads.create();
    console.log('Thread criada:', thread.id);
    return thread.id;
  }

  async buscarThreadPorId(id_thread) {
    let threadBuscada;
    try {
      threadBuscada = await this.openai.beta.threads.retrieve(id_thread);
      return true;
    } catch(error) {
      if (error.response && error.response.status === 404) {
        console.log("Thread não encontrada: ", threadBuscada);
        return false;
      } else {
        console.error("Erro inesperado:", error);
      }
    }
  }

  async adicionarMensagemNaThread(id_thread: string, mensagem: string) {
    const message = await this.openai.beta.threads.messages.create(id_thread, {
      role: 'user',
      content: mensagem,
    });

    console.log('Mensagem adicionada:', message.id);
    return message.id;
  }

  async criarRunParaThread(id_thread: string) {
    //pega o id do assistente das variáveis de ambiente
    const run = await this.openai.beta.threads.runs.create(id_thread, {
      assistant_id: this.assistantID,
    });

    console.log('Run criada:', run.id);
    return run.id;
  }

  async verificarStatusDaRun(id_thread: string, run_id: string) {
    //get https://api.openai.com/v1/threads/{thread_id}/runs/{run_id}
    console.log('Status da run criada:');

    const run = await this.openai.beta.threads.runs.retrieve(id_thread, run_id);
    console.log('Status da run criada:', run.status);
    //completed
    return run.status;
  }

  async obterRespostaDoAssistente(id_thread: string, run_id: string) {
    const mensagemDeRespostaDaRun = await this.openai.beta.threads.messages.list(id_thread, {
      run_id: run_id,
    });

    const idDaResposta = mensagemDeRespostaDaRun?.data[0]?.id;

    const mensagemResposta = await this.openai.beta.threads.messages.retrieve(id_thread, idDaResposta);

    // Verifica o tipo do conteúdo da mensagem
    if (mensagemResposta?.content && Array.isArray(mensagemResposta.content)) {
      // Procura por conteúdo de texto dentro do array
      const texto = mensagemResposta.content.find(item => 'text' in item);

      if (texto && 'text' in texto) {
        console.log("Texto da resposta:", texto.text.value);
        return texto.text.value;
      }
    }
  }

  async speechToText(filePath: any) {
    try {
      console.log("ESTÁ SENDO TRANSCRITO");
      
      const startTime = Date.now(); // Marca o tempo inicial
    
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
      });
    
      const endTime = Date.now(); // Marca o tempo final
      const duration = (endTime - startTime) / 1000; // Converte para segundos
    
      console.log("FOI TRANSCRITO:", transcription.text);
      console.log(`Tempo de transcrição: ${duration.toFixed(2)} segundos`);
    
      return transcription.text;
    } catch (error) {
      console.log("open => ", error);
    }
  }
  
}
