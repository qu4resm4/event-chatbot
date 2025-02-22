import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient(); // Inicializa o cliente Prisma
  }

  // Função para verificar a conexão e buscar assistentes no banco
  async checkDatabaseConnection() {
    try {
      await this.prisma.$connect(); // Tenta se conectar
      console.log('Conexão com o banco de dados bem-sucedida!');
    } catch (error) {
      console.error('Erro de conexão com o banco de dados:', error);
    }
  }
}
