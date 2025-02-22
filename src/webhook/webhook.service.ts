import { Injectable } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { OpenaiService } from 'src/openai/openai.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class WebhookService {
  constructor(
    private whatsappSrvc: WhatsappService,
    private cache: CacheService,
    private openai: OpenaiService,
  ) {}

  async resposta(mensagemRecebidaDto: any) {
    console.log(
      'Incoming webhook message:',
      JSON.stringify(mensagemRecebidaDto, null, 2),
    );

    const mensagemRecebida =
      mensagemRecebidaDto.entry?.[0]?.changes[0]?.value?.messages?.[0];

    const textoMensagem = mensagemRecebida.text.body;
    const remetenteDaMensagem = mensagemRecebida.from;

    const idDoRemetente =
      mensagemRecebidaDto.entry?.[0]?.changes[0]?.value?.contacts?.wa_id;

    if (mensagemRecebida?.type === 'text') {
      const numeroComercialDoChatBot =
        mensagemRecebidaDto.entry?.[0].changes?.[0].value?.metadata
          ?.phone_number_id;

      await this.whatsappSrvc.visualizarMensagem(
        numeroComercialDoChatBot,
        mensagemRecebida,
      );

      // Cache: verificar id do usuário WhatsApp
      let threadDoUsuario =
        await this.cache.obterIdThreadPorIdWhatsapp(idDoRemetente);

      // Se a thread não existir (false), cria uma nova thread
      if (!threadDoUsuario) {
        const idThreadCriada = await this.openai.criarThread();
        await this.cache.vincularIdWhatsappAoIdThread(
          idDoRemetente,
          idThreadCriada,
        );
        threadDoUsuario =
          await this.cache.obterIdThreadPorIdWhatsapp(idDoRemetente);
      }

      // Verifica se a thread foi realmente criada e se é uma string válida
      if (typeof threadDoUsuario !== 'string') {
        throw new Error('Erro: thread do usuário não encontrada ou inválida');
      }

      // Adicionando mensagem na thread
      await this.openai.adicionarMensagemNaThread(
        threadDoUsuario,
        textoMensagem,
      );

      const idRunCriada = await this.openai.criarRunParaThread(threadDoUsuario);

      let statusDaRun = true;
      while (statusDaRun) {
        setTimeout(async () => {
          const status = await this.openai.verificarStatusDaRun(
            threadDoUsuario,
            idRunCriada,
          );
          if (status === 'completed') {
            console.log('Run status completed');
            statusDaRun = false;
          }
        }, 200); // dois milisegundos (0.2s); 1000 = 1s
      }

      const resposta = await this.openai.obterRespostaDoAssistente(
        threadDoUsuario,
        idRunCriada,
      );

      await this.whatsappSrvc.responderMensagem(
        numeroComercialDoChatBot,
        remetenteDaMensagem,
        resposta,
      );
    }
  }
}
// fazer buscar por id pelo prisma do whatsapp/*  vincular o id com o da threadid*/
/* 
          TO-DO
          -- testar se o nest funciona no glitch 
          -- terminar lógica do webhook
          -- criar cache e seus métodos.
          -- métodos de conexão com a API da OpeanAI
          
          DONE
          -- métodos de conexão whatsapp
*/
