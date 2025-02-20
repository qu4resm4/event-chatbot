import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module'; // Importa o WhatsappModule
import { AssistantsService } from '../assistants/assistants.service'; // Outros serviços necessários
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [WhatsappModule, PrismaModule], // Adiciona o WhatsappModule
  controllers: [WebhookController],
  providers: [WebhookService, AssistantsService],
})
export class WebhookModule {}
