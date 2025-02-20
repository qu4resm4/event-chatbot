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
        let threadDoUsuario = await this.cache.obterIdThreadPorIdWhatsapp(idDoRemetente);

        // se id_thread corresponde igual a false (inexistente)
        if(!threadDoUsuario) {
          // cria uma thread
          const idThreadCriada = await this.openai.criarThread();
          // vincula os ids no cache
          await this.cache.vincularIdWhatsappAoIdThread(idDoRemetente, idThreadCriada)
          threadDoUsuario = await this.cache.obterIdThreadPorIdWhatsapp(idDoRemetente);
        }

        // adicionando mensagem na thread
        await this.openai.adicionarMensagemNaThread(threadDoUsuario, textoMensagem);

        // cria a run que irá executar a análise da thread pelo assistent
        const idRunCriada= await this.openai.criarRunParaThread(threadDoUsuario);

        // polling para verificar status da run, o script prosseguirá apenas depois do status completed da run
        let statusDaRun = true;
        while(statusDaRun) {
          setTimeout(async () => {
            let status = await this.openai.verificarStatusDaRun(idRunCriada)
            if(status == 'completed') {
              console.log("Run status completed")
              statusDaRun = false
            }
          }, 200); // dois milisegundos (0.2s); 1000 = 1s
        }

        let resposta = await this.openai.obterRespostaDoAssistent(idRunCriada);

        await this.whatsappSrvc.responderMensagem(numeroComercialDoChatBot, remetenteDaMensagem, resposta)

        /* 
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
