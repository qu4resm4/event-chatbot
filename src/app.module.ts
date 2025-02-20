import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { WhatModule } from './what/what.module';
import { Jojo } from './jojo/jojo';
import { DatabaseModule } from './database/database.module';
import { OpenaiModule } from './openai/openai.module';
import { CacheModule } from './cache/cache.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [ConfigModule.forRoot(), WebhookModule, WhatModule, DatabaseModule, OpenaiModule, CacheModule, WhatsappModule],
  controllers: [],
  providers: [Jojo],
})
export class AppModule {}
