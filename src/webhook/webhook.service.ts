import { Injectable } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { OpenaiService } from 'src/openai/openai.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class WebhookService {

  constructor(
    private whatsappSrvc: WhatsappService,
    private cache: CacheService,
    private openai: OpenaiService
  ){}

  async resposta(mensagemRecebidaDto: any) {
      console.log("Incoming webhook message:", JSON.stringify(mensagemRecebidaDto.body, null, 2));
      
      // details on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
      const mensagemRecebida = mensagemRecebidaDto.body.entry?.[0]?.changes[0]?.value?.messages?.[0];

      // mensagem de texto recebida
      const textoMensagem = mensagemRecebida.text.body;

      const remetenteDaMensagem = mensagemRecebida.from;

      const idDoRemetente = mensagemRecebidaDto.body.entry?.[0]?.changes[0]?.value?.contacts?.wa_id;

      // verifica se a mensagem recebida contém texto
      if (mensagemRecebida?.type === "text") {
  
        // destinatário da mensagem do usuário, o número utilizado para receber mensagens pelo whatsapp
        const numeroComercialDoChatBot =
        mensagemRecebidaDto.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
    
        // método para mudar o estado da mensagem para visualizado
        await this.whatsappSrvc.visualizarMensagem(numeroComercialDoChatBot, mensagemRecebida);

        // cache: verificar id do usuário whatsapp do cache
        const threadDoUsuario = this.cache.obterIdThreadPorIdWhatsapp(idDoRemetente);

        // se id_thread corresponde igual a false (inexistente)
        if(!threadDoUsuario) {
          // cria uma thread
          const idThreadCriada = await this.openai.criarThread();
          // vincula os ids no cache
          await this.cache.vincularIdWhatsappAoIdThread(idDoRemetente, idThreadCriada)
        }

        /* O QUE FALTA AQUI  
          openai: cria uma run da thread (url) e associa o id do assistente no body da requisição
          openai: executa um polling para verificar se a run terminou de ser processada
          openai: busca a mensagem da thread com o parâmetro de filtro para filtrar pelo run_id, ou seja, pegar a mensagem gerada pela run que executou ela (assim vai buscar exatamente a mensagem de resposta do assistente)
          whatsapp: requisição de resposta

          TO-DO
          -- testar se o nest funciona no glitch 
          -- terminar lógica do webhook
          -- criar cache e seus métodos.
          -- métodos de conexão com a API da OpeanAI
          
          DONE
          -- métodos de conexão whatsapp
        */
      }
    }
}
