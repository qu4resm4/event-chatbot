import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  mensagemRecebida(@Body() mensagemRecebidaDto: any) {
    return this.webhookService.resposta(mensagemRecebidaDto);
  }
}
