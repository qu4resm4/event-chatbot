import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('/webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Get()
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
  ) {
    const verify_token = 'tokenVerify'; // Token que você definiu

    if (mode === 'subscribe' && token === verify_token) {
      return challenge; // Retorna o challenge se o token de verificação for válido
    }
    return 'Erro na verificação do webhook';
  }

  @Post('/message')
  async handleMessage(@Body() body: any) {
    return await this.webhookService.processMessage(body);
  }

  @Get('/assistants') // Rota para consultar os assistentes
  async getAssistants() {
    return await this.webhookService.getAssistants();
  }
}
