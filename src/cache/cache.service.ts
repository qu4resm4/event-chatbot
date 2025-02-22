import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CacheService {
  private prisma = new PrismaClient();

  // Vincula o ID do WhatsApp ao ID da thread
  async vincularIdWhatsappAoIdThread(id_whatsapp: string, id_thread: string) {
    // Verifica se já existe uma associação
    const existingAssociation = await this.prisma.user.findUnique({
      where: { wa_id: id_whatsapp },
    });

    if (existingAssociation) {
      // Se já existir, atualiza a associação
      await this.prisma.user.update({
        where: { wa_id: id_whatsapp },
        data: { thread_id: id_thread },
      });
    } else {
      // Se não existir, cria uma nova associação
      await this.prisma.user.create({
        data: {
          wa_id: id_whatsapp,
          thread_id: id_thread,
        },
      });
    }

    console.log(
      `ID do WhatsApp ${id_whatsapp} vinculado à thread ${id_thread}`,
    );
  }

  // Obtém o ID da thread associado a um ID de WhatsApp ou retorna false
  async obterIdThreadPorIdWhatsapp(
    id_whatsapp: string,
  ): Promise<string | false> {
    const user = await this.prisma.user.findUnique({
      where: { wa_id: id_whatsapp },
    });

    if (user) {
      return user.thread_id; // Retorna o id_thread se encontrado
    } else {
      return false; // Retorna false caso não exista o usuário
    }
  }
}
