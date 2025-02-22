import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Module({
  providers: [WhatsappService],
  exports: [WhatsappService], // Isso permite que o serviço seja usado em outros módulos
})
export class WhatsappModule {}
