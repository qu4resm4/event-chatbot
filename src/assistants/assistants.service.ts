import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAI } from 'openai';
import { SendMessageDto } from 'src/dto/send-message.dto';

@Injectable()
export class AssistantsService implements OnModuleInit {
  // pra que serve o private e o this?
  // pra que serve o constructor?
  private openai: OpenAI;
  private assistantId: string;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      // Verifica se já existe um assistente no banco// se ele ja existir, nao precisar criar outro, mexer o codigo
      const existingAssistant = await this.prisma.assistant.findFirst();
      if (existingAssistant) {
        this.assistantId = existingAssistant.id;
        console.log('Assistente já existe, usando ID:', this.assistantId);
      } else {
        console.log('Nenhum assistente encontrado. Criando um novo...');
        await this.createAssistant();
        console.log('Novo assistente criado com ID:', this.assistantId);
      }
    } catch (error) {
      console.error('Erro ao verificar ou criar assistente:', error);
      throw new Error('Erro ao verificar ou criar assistente');
    }
  }

  // Função para criar um assistente
  private async createAssistant() {
    try {
      const myAssistant = await this.openai.beta.assistants.create({
        instructions: `Você é um assistente especializado em formatação de dados para IA. Sua tarefa é estruturar informações de palestras em um JSON multilíngue padronizado, incluindo formatação localizada de data e horário.`,
        name: 'Guide Assistant',
        tools: [{ type: 'code_interpreter' }],
        model: 'gpt-3.5-turbo', // Modelo da OpenAI
      });

      this.assistantId = myAssistant.id;
      console.log('Novo assistente criado com ID:', this.assistantId);

      // Salvar o ID do assistente no banco de dados
      await this.prisma.assistant.create({
        data: {
          id: this.assistantId,
        },
      });
    } catch (error) {
      console.error('Erro ao criar assistente:', error);
      throw new Error('Erro ao criar assistente');
    }
  }

  // Função para enviar mensagem ao assistente
  async sendMessageToAssistant(dto: SendMessageDto): Promise<string> {
    // verificar essa parte na documentaçao
    try {
      const threadId = await this.createThreadIfNotExist(dto.userId);

      const response = await this.openai.beta.threads.messages.create(
        threadId,
        {
          role: 'user',
          content: dto.message,
        },
      );

      const messageContent = response.content[0];

      // Verificação direta do tipo de conteúdo
      if ('text' in messageContent) {
        return messageContent.text.value || 'Não entendi.';
      } else if ('image' in messageContent) {
        const imageUrl = (messageContent as { image: { url: string } }).image
          .url;
        return `Aqui está a imagem: ${imageUrl}`;
      } else {
        return 'Recebido, mas não consigo processar este tipo de conteúdo.';
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem ao assistente:', error);
      throw new Error('Erro ao enviar mensagem ao assistente');
    }
  }

  // Verifica se o usuário já tem uma thread e criar se não tiver
  private async createThreadIfNotExist(userId: string) {
    try {
      const userThread = await this.prisma.thread.findUnique({
        where: { userId },
      });

      if (!userThread) {
        const newThread = await this.prisma.thread.create({
          data: { userId, assistantId: this.assistantId },
        });
        return newThread.id;
      }

      return userThread.id;
    } catch (error) {
      console.error('Erro ao criar ou recuperar a thread:', error);
      throw new Error('Erro ao criar ou recuperar a thread');
    }
  }
}
