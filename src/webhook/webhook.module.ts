import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CacheService } from 'src/cache/cache.service';
import { OpenaiService } from 'src/openai/openai.service';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module'; // Importe o módulo do WhatsApp
import { WebhookController } from './webhook.controller';

@Module({
  controllers: [WebhookController], // Adicione o controller à lista de controllers
  imports: [WhatsappModule], // Importa o módulo que contém o WhatsappService
  providers: [WebhookService, CacheService, OpenaiService],
})
export class WebhookModule {}
