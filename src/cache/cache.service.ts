import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {

    vincularIdWhatsappAoIdThread(id_whatsapp, id_thread) {
        
    }

    obterIdThreadPorIdWhatsapp(id_whatsapp) {
        let id_thread;
        /*
        // verificar usando o ID THREAD, BUSCANDO PELO ID_WHATSAPP id, por id 
        const user = await prisma.user.findUnique({
            where: {
              wa_id: id_whatsapp,
            },
          })
        if (user) {
            return user.id_thread
        } else {
            return false;
        }
        */
       return '';
    }
}
