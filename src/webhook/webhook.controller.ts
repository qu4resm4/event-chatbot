import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import * as fs from 'fs';

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
  async mensagemRecebida(@Body() mensagemRecebidaDto: any) {
    console.log(
      'DTO Recebido pela API Cloud do WhatsAppBunisess: ',
      JSON.stringify(mensagemRecebidaDto, null, 2),
    );

    const numeroComercialDoChatBot =
        mensagemRecebidaDto.entry?.[0].changes?.[0].value?.metadata
          ?.phone_number_id;

    const tipoDaMensagemRecebida =
      mensagemRecebidaDto.entry?.[0]?.changes[0]?.value?.messages?.[0].type;

    // identificando se é uma atualização de status da mensagem enviada
    const statuses = mensagemRecebidaDto.entry?.[0]?.changes[0]?.value?.statuses;
    if(statuses) {
      console.log('DTO para atualizar status de mensagens:');
      console.log("Statuses: ", statuses)
      console.log("Status da mensagem enviada: ", statuses[0]?.status)
      return;
    }

    // identifica se é uma mensagem de texto
    if(tipoDaMensagemRecebida == "text" && !statuses) {
      return await this.webhookService.respostaMensagemDeTexto(mensagemRecebidaDto, numeroComercialDoChatBot);
    }

    // identifica se a mensagem recebida foi um audio
    if(tipoDaMensagemRecebida == "audio" && !statuses){
          const mensagemRecebidaID = mensagemRecebidaDto.entry?.[0]?.changes[0]?.value?.messages?.[0].id;

        return await this.webhookService.respostaMensagemDeAudio(mensagemRecebidaDto, numeroComercialDoChatBot, mensagemRecebidaID);
      }
    console.log('nenhuma condição foi acionada')
    return;
  }
}
