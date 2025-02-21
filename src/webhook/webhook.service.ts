import { Injectable } from '@nestjs/common';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { AssistantsService } from '../assistants/assistants.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly assistantsService: AssistantsService,
    private readonly prismaService: PrismaService, // Injetando o PrismaService
  ) {}

  async getAssistants() {
    return await this.prismaService.assistant.findMany({
      include: {
        threads: true, // Inclui todas as threads relacionadas ao assistente
      },
    });
  }

  async processMessage(body: any) {
    console.log(body);

    const message =
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
    const from = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;

    if (message && from) {
      try {
        // Envia a mensagem ao assistente
        const response = await this.assistantsService.sendMessageToAssistant({
          userId: from, // Enviando o número como ID do usuário
          message: message,
        });

        console.log(response);

        // Envia a resposta do assistente para o WhatsApp
        await this.whatsappService.sendMessage(from, response);

        // 🔥 Retorna um JSON com os detalhes da requisição
        return {
          sender: from,
          userMessage: message,
          assistantResponse: response,
        };
      } catch (error) {
        console.error('Erro ao processar a mensagem:', error);

        const errorMessage = 'Desculpe, algo deu errado!';
        await this.whatsappService.sendMessage(from, errorMessage);

        // 🔥 Retorna um JSON de erro
        return { error: errorMessage };
      }
    }

    // 🔥 Se não houver mensagem ou remetente, retorna um erro
    return { error: 'Mensagem inválida' };
  }
}
