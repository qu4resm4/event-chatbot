import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }

  // Função para verificar a conexão e buscar assistentes no banco
  async checkDatabase() {
    try {
      const assistants = await this.assistant.findMany(); // Usa o modelo Assistant gerado pelo Prisma
      console.log('Assistentes encontrados:', assistants);
    } catch (error) {
      console.error('Erro ao acessar o banco de dados:', error);
    }
  }
}
/* 
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
 */
