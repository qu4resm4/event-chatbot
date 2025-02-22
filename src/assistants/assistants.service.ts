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
      const existingAssistant = await this.prisma.assistant.findFirst();
      if (existingAssistant) {
        this.assistantId = existingAssistant.id;
        console.log('Assistente já existe, usando ID:1', this.assistantId);
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

  private async createAssistant() {
    try {
      const myAssistant = await this.openai.beta.assistants.create({
        instructions: `Você é um assistente especializado em formatação de dados para IA. Sua tarefa é estruturar informações de palestras em um JSON multilíngue padronizado, incluindo formatação localizada de data e horário.`,
        name: 'Guide Assistant',
        tools: [{ type: 'code_interpreter' }],
        model: 'gpt-4o',
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

  async sendMessageToAssistant(dto: SendMessageDto): Promise<string> {
    console.log('test2', dto.userId);

    try {
      const threadId = await this.createThreadIfNotExist(dto.userId);
      console.log('thread id', threadId);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: dto.message }],
        user: dto.userId, // Associando ao ID do usuário (opcional, dependendo da implementação)
      });

      // Verifica se a resposta é válida
      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error('Resposta inválida da OpenAI.');
      }

      console.log('Resposta da OpenAI:', response);

      // A resposta da OpenAI normalmente estará dentro de response.choices[0].message.content
      const messageContent = response.choices[0].message.content;
      console.log('Mensagem enviada, conteúdo da resposta:', messageContent);

      if (messageContent) {
        return messageContent;
      } else {
        return 'Não entendi a resposta.';
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem ao assistente:', error);
      throw new Error('Erro ao enviar mensagem ao assistente');
    }
  }

  private async createThreadIfNotExist(userId: string) {
    try {
      const userThread = await this.prisma.thread.findUnique({
        where: { userId },
      });

      if (!userThread) {
        console.log('Nenhuma thread encontrada. Criando uma nova...');
        const newThread = await this.prisma.thread.create({
          data: { userId, assistantId: this.assistantId },
        });
        console.log('Nova thread criada:', newThread);
        return newThread.id;
      }
      console.log('Thread já existente encontrada:33', userThread.id);
      return userThread.id;
    } catch (error) {
      console.error('Erro ao criar ou recuperar a thread:', error);
      throw new Error('Erro ao criar ou recuperar a thread');
    }
  }
}
