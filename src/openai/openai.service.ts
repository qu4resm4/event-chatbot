import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {

    private teste; 
    private assistantID;
    private instrucoes = `Você é um assistente especializado em formatação de dados para IA. Sua tarefa é estruturar informações de palestras em um JSON multilíngue padronizado, incluindo formatação localizada de data e horário.`;

    constructor(

    ){
        const openai = new OpenAI({ apiKey: process.env.OPEANAI_API_TOKEN });
    }

    async onModuleInit(): Promise<void> {
        try {
          // Verifica se já existe um assistente no banco// se ele ja existir, nao precisar criar outro, mexer o codigo
          const assistant = await this.teste // método que acessa o banco de dados
          if (assistant) {
            this.assistantID = assistant.id;
          } else {
            await this.criarAssistente();
            console.log('Novo assistente criado com ID:', this.assistantID);
          }
        } catch (error) {
          console.error('Erro ao verificar ou criar assistente:', error);
          throw new Error('Erro ao verificar ou criar assistente');
        }
      }
    
    // Função para criar um assistente
    private async criarAssistente() {
        try {
          const myAssistant = await this.openai.beta.assistants.create({
            instructions: this.instrucoes,
            name: 'Guide Assistant',
            tools: [{ type: 'code_interpreter' }],
            model: 'gpt-3.5-turbo', // Modelo da OpenAI
          });
    
          this.assistantId = myAssistant.id;
          console.log('Novo assistente criado com ID:', this.assistantId);
    
          // Salvar o ID do assistente no banco de dados
          await this.prisma.assistant.create({
            data: {
              id: this.assistantId,
            },
          });
        } catch (error) {
          console.error('Erro ao criar assistente:', error);
          throw new Error('Erro ao criar assistente');
        }
    }

    async criarThread(){
        let id_thread;
        return id_thread
    }

    async adicionarMensagemNaThread(id_thread, mensagem){

    }

    async criarRunParaThread(id_thread) {
        //pega o id do assistent das variaveis de ambiente
        let id_run;
        return id_run
    }

    async verificarStatusDaRun(run_id) {
        //get https://api.openai.com/v1/threads/{thread_id}/runs/{run_id}
        return 'string'
    }

    async obterRespostaDoAssistent(run_id){
        //get https://api.openai.com/v1/threads/{thread_id}/messages?run_id=run_id
    }
}
