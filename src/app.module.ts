import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { OpenaiModule } from './openai/openai.module';
import { CacheModule } from './cache/cache.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WebhookModule,
    OpenaiModule,
    CacheModule,
    WhatsappModule,
    DatabaseModule,
  ],
  controllers: [],
})
export class AppModule {}
