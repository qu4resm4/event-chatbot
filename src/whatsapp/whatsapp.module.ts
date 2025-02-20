import { Module } from '@nestjs/common';
//import { PrismaModule } from '../prisma/prisma.module';
import { WhatsappService } from './whatsapp.service';

@Module({
  //imports: [PrismaModule], // Importa o PrismaModule
  providers: [WhatsappService],
  exports: [WhatsappService], // Expor o WhatsappService caso outros módulos precisem usá-lo
})
export class WhatsappModule {}
