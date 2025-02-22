import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient(); // Inicializa o cliente Prisma
  }

  async vincularIdWhatsappAoIdThread(id_whatsapp: string, id_thread: string) {
    // Verifica se já existe uma associação

    await this.prisma.user.create({
      data: {
        wa_id: id_whatsapp,
        thread_id: id_thread,
      },
    });
  }

  // Obtém o ID da thread associado a um ID de WhatsApp ou retorna false
  async obterIdThreadPorIdWhatsapp(id_whatsapp: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { wa_id: id_whatsapp },
      });

      console.log('o erro nao foi aqui', user);

      if (user) {
        return user.thread_id; // Retorna o id_thread se encontrado
      } else {
        return false; // Retorna false caso não exista o usuário
      }
    } catch {
      return false; // Em caso de erro, retorna false
    }
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
