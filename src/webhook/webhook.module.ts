import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { OpenaiService } from 'src/openai/openai.service';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module'; // Importe o módulo do WhatsApp
import { WebhookController } from './webhook.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [WebhookController], // Adicione o controller à lista de controllers
  imports: [WhatsappModule], // Importa o módulo que contém o WhatsappService
  providers: [WebhookService, OpenaiService, DatabaseService],
})
export class WebhookModule {}
