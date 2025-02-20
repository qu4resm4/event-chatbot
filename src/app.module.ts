import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { OpenaiModule } from './openai/openai.module';
import { CacheModule } from './cache/cache.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [ConfigModule.forRoot(), WebhookModule, OpenaiModule, CacheModule, WhatsappModule],
  controllers: [],
})
export class AppModule {}
