import { Injectable } from '@nestjs/common';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { AssistantsService } from '../assistants/assistants.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly assistantsService: AssistantsService,
  ) {}

  async processMessage(body: any) {
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

        // Envia a resposta do assistente para o WhatsApp
        await this.whatsappService.sendMessage(from, response);
      } catch (error) {
        console.error('Erro ao processar a mensagem:', error);
        await this.whatsappService.sendMessage(
          from,
          'Desculpe, algo deu errado!',
        );
      }
    }
  }
}
