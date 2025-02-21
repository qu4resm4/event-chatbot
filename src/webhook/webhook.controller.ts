import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { AssistantsService } from 'src/assistants/assistants.service';

@Controller('/webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly assistantsService: AssistantsService,
  ) {}

  @Get()
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
  ) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!mode || !token) {
      throw new HttpException('Parâmetros inválidos', HttpStatus.BAD_REQUEST);
    }

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    throw new HttpException(
      'Falha na verificação do webhook',
      HttpStatus.FORBIDDEN,
    );
  }

  @Post('/message')
  async handleMessage(@Body() body: any) {
    try {
      if (!body) {
        throw new HttpException('Body inválido', HttpStatus.BAD_REQUEST);
      }
      return await this.webhookService.processMessage(body);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      throw new HttpException(
        'Erro interno ao processar a mensagem',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/assistants')
  async getAssistants() {
    try {
      return await this.webhookService.getAssistants();
    } catch (error) {
      console.error('Erro ao buscar assistentes:', error);
      throw new HttpException(
        'Erro ao buscar assistentes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/test-chatgpt')
  async testChatGPT(@Body() body: { userId: string; message: string }) {
    try {
      if (!body.userId || !body.message) {
        throw new HttpException('Parâmetros inválidos', HttpStatus.BAD_REQUEST);
      }
      const response = await this.assistantsService.sendMessageToAssistant({
        userId: body.userId,
        message: body.message,
      });
      return { assistantResponse: response };
    } catch (error) {
      console.error('Erro ao testar ChatGPT:', error);
      throw new HttpException(
        'Falha ao obter resposta da IA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
