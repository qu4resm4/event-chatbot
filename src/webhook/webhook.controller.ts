import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
  ) {
    const verify_token = process.env.WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verify_token) {
      return challenge; // Retorna o challenge se o token de verificação for válido
    }
    return 'Erro na verificação do webhook';
  }

  @Post()
  mensagemRecebida(@Body() mensagemRecebidaDto: any) {
    return this.webhookService.resposta(mensagemRecebidaDto);
  }
}
