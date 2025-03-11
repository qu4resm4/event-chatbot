import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { OpenaiService } from 'src/openai/openai.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class WebhookService {
  constructor(
    private whatsappSrvc: WhatsappService,
    private database: DatabaseService,
    private openai: OpenaiService,
  ) {}

  async resposta(mensagemRecebidaDto: any, textoMensagem: string) {
    try {
      const startTimeMetodoResposta = Date.now(); // Marca o tempo inicial da execução do metodo
      const mensagemRecebida =
        mensagemRecebidaDto.entry?.[0]?.changes[0]?.value?.messages?.[0]; 

      const remetenteDaMensagem = mensagemRecebida.from; 

      const idDoRemetente =
        mensagemRecebidaDto.entry?.[0]?.changes[0]?.value?.contacts[0]?.wa_id; 

      console.log(idDoRemetente);

      const numeroComercialDoChatBot =
        mensagemRecebidaDto.entry?.[0].changes?.[0].value?.metadata
          ?.phone_number_id;

      // pega a identificação da thread relacionada ao usuário da mensagem
      let threadDoUsuario =
        await this.database.obterIdThreadPorIdWhatsapp(idDoRemetente);

      // Se a thread não existir no banco de dados (false), cria uma nova thread
      if (!threadDoUsuario) {
        const idThreadCriada = await this.openai.criarThread();
        await this.database.vincularIdWhatsappAoIdThread(
          idDoRemetente,
          idThreadCriada,
        );
        threadDoUsuario =
          await this.database.obterIdThreadPorIdWhatsapp(idDoRemetente);
      }

      // se a thread não existir na plataforma da openai, cria uma nova e vincula
      const existeThread = await this.openai.buscarThreadPorId(threadDoUsuario);
      if (!existeThread) {
        const idThreadCriada = await this.openai.criarThread();
        await this.database.atualizarVinculoIdWhatsappComIdThread(
          idDoRemetente,
          idThreadCriada,
        );
        threadDoUsuario =
          await this.database.obterIdThreadPorIdWhatsapp(idDoRemetente);
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

      const startTimeGeracaoDaRespostaDoAssistente = Date.now(); // Marca o tempo inicial da execução da RUN
      const idRunCriada = await this.openai.criarRunParaThread(threadDoUsuario);

      let status = '';

      // se o status for diferente de completo ele continua verificando, se for failed vai ficar agarrado infinitamente ou queue, aqui precisa melhorar a lógica
      while (status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        status = await this.openai.verificarStatusDaRun(
          threadDoUsuario,
          idRunCriada,
        );
      }

      const endTimeGeracaoDaRespostaDoAssistente = Date.now(); // Marca o tempo final da execução da RUN

      // se só sai do looping se for completed então porque aqui tem uma condicional?? 
      if (status === 'completed') {
        console.log('Run status completed');
        let respostaDepoisDoStatusCompleto = await this.openai.obterRespostaDoAssistente(
          threadDoUsuario,
          idRunCriada,
        );
        console.log("Resposta da mensagem: ", respostaDepoisDoStatusCompleto)
        
        await this.whatsappSrvc.responderMensagem(
          numeroComercialDoChatBot,
          remetenteDaMensagem,
          respostaDepoisDoStatusCompleto,
        );

        const endTimeMetodoResposta = Date.now(); // Marca o tempo final
        const durationMetodoResposta = (endTimeMetodoResposta - startTimeMetodoResposta) / 1000; // Converte para segundos
        const durationGeracaoDaRespostaDoAssistente = (endTimeGeracaoDaRespostaDoAssistente - startTimeGeracaoDaRespostaDoAssistente) / 1000; // Converte para segundos

        console.log(`Tempo de execução da geração de resposta do assistente : ${durationGeracaoDaRespostaDoAssistente.toFixed(2)} segundos`);
        console.log(`Tempo de execução do método : ${durationMetodoResposta.toFixed(2)} segundos`);
      }
    } catch(error) {
      console.log("erro no metodo resposta: ", error)
    }
  }

  async respostaMensagemDeTexto(mensagemTextoRecebidaDto: any, numeroComercialDoChatBot){
    const mensagemRecebidaID = mensagemTextoRecebidaDto.entry?.[0]?.changes[0]?.value?.messages?.[0].id; 
    await this.whatsappSrvc.visualizarMensagem(
      numeroComercialDoChatBot,
      mensagemRecebidaID,
    );

    const textoMensagem = mensagemTextoRecebidaDto.entry?.[0]?.changes[0]?.value?.messages?.[0].text.body;
    await this.resposta(mensagemTextoRecebidaDto, textoMensagem)

  }

  async respostaMensagemDeAudio(mensagemAudioRecebidaDto: any, numeroComercialDoChatBot, mensagemRecebidaID) {
    const startTimeRespostaAudio = Date.now(); // Marca o tempo inicial da execução da RUN

    await this.whatsappSrvc.visualizarMensagem(
      numeroComercialDoChatBot,
      mensagemRecebidaID,
    ); 

    const audioID = mensagemAudioRecebidaDto.entry?.[0]?.changes[0]?.value?.messages?.[0].audio.id;

    const caminhoDoArquivo = await this.whatsappSrvc.downloadAudio(audioID, mensagemRecebidaID);
3
    const mensagemEmTexto = await this.openai.speechToText(caminhoDoArquivo)

    console.log("Audio transcrito", mensagemEmTexto);

    await this.resposta(mensagemAudioRecebidaDto, mensagemEmTexto)
    
    await this.whatsappSrvc.excluirAudio(caminhoDoArquivo);
    
    const endTimeMetodoRespostaAudio = Date.now(); // Marca o tempo final
    const durationMetodoRespostaAudio = (endTimeMetodoRespostaAudio - startTimeRespostaAudio) / 1000; // Converte para segundos
    console.log(`Tempo de execução do método de responder um audio: ${durationMetodoRespostaAudio.toFixed(2)} segundos`);
  }
}