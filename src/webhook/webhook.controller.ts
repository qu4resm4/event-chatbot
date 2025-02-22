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
    console.log(mensagemRecebidaDto);
    return this.webhookService.resposta(mensagemRecebidaDto);
  }

  /* @Get('createThread')
  async createThread() {
    const threadId = await this.openaiService.criarThread();
    console.log(threadId);

    return { threadId };
  } */

  /*  @Get('add-message')
  async addMessage() {
    const threadId = 'your-thread-id'; // Substitua pelo ID da thread que você deseja usar
    const messageId = await this.openaiService.adicionarMensagemNaThread(
      threadId,
      'Olá, assistente!',
    );
    return { messageId };
  }

  @Get('check-db')
  async checkDatabase() {
    await this.databaseService.checkDatabaseConnection();
    return { message: 'Banco de dados verificado com sucesso' };
  } */
}
