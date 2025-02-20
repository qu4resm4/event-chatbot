import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AssistantsService } from './assistants.service';

@Module({
  imports: [PrismaModule], // Importa o PrismaModule para usar o PrismaService
  providers: [AssistantsService],
  exports: [AssistantsService], // Expor o AssistantsService caso outros módulos precisem usá-lo
})
export class AssistantsModule {}
