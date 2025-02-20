import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {

    constructor(){
        const openai = new OpenAI({ apiKey: process.env.OPEANAI_API_TOKEN });
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
