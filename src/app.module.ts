import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AssistantsModule } from './assistants/assistants.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [PrismaModule, AssistantsModule, WhatsappModule, WebhookModule], // Importa todos os módulos necessários
})
export class AppModule {}
