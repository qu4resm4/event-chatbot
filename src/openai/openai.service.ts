import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;
  private prisma: PrismaClient;
  private assistantID: string;
  private instrucoes = `Você é um assistente especializado em formatação de dados para IA. Sua tarefa é estruturar informações de palestras em um JSON multilíngue padronizado, incluindo formatação localizada de data e horário.`;

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
        __dirname,
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
    //get https://api.openai.com/v1/threads/{thread_id}/messages?run_id=run_id
    const resposta = await this.openai.beta.threads.messages.list(id_thread, {
      run_id: run_id,
    });
    console.log('o erro esta aqui2', resposta);
    return resposta;
  }
}
