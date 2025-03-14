import { Injectable } from '@nestjs/common';
import axios from 'axios';

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class WhatsappService {
  constructor() {}

  async visualizarMensagem(numeroComercialDoChatBot, mensagemRecebidaID) {
    // mark incoming message as read
    try {
      await axios({
        method: 'POST',
        url: `https://graph.facebook.com/v18.0/${numeroComercialDoChatBot}/messages`,
        headers: {
          Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
        },
        data: {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: mensagemRecebidaID,
        },
      });
    } catch(error) {
      console.log("Erro: ", error)
    }
      
  }

  async responderMensagem(numeroComercialDoChatBot, remetenteDaMensagem, respostaAoRemetente) {
    console.log("Chegou aqui: ", remetenteDaMensagem)
    // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v18.0/${numeroComercialDoChatBot}/messages`,
      headers: {
        Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: 'whatsapp',
        to: remetenteDaMensagem,
        text: { body: `${respostaAoRemetente}` },
      },
    });
  }

  async downloadAudio(MEDIA_ID, fileName){
    try {
      // Obtém a URL de download da mídia
      const objetoDeMidia = await axios({
        method: 'GET',
        url: `https://graph.facebook.com/v22.0/${MEDIA_ID}`,
        headers: {
          Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
        }
      });

      const urlDownloadAudio = objetoDeMidia?.data?.url;
      console.log(`Media URL: ${urlDownloadAudio}`);

      // Requisição para iniciar a stream de lá
      const objetoDoArquivo = await axios({
        method: 'GET',
        url: urlDownloadAudio,
        headers: {
          Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
        },
        responseType: 'stream'
      });

      const mimeType = objetoDoArquivo.headers['content-type'];
      let extensaoArquivo = mimeType.match(/^audio\/([^;]+)/);
      extensaoArquivo = extensaoArquivo ? extensaoArquivo[1] : 'ogg';
      console.log(`MIME Type: ${mimeType}, File Extension: ${extensaoArquivo}`);

      

      const tmpdir = "/audios";
      // verifica se a pasta de audio existe
      if (!fs.existsSync(process.cwd()+tmpdir)) {
        fs.mkdirSync(process.cwd()+tmpdir);
      }

      const caminhoDoArquivo = path.join(process.cwd(), `audios/media_${fileName}.${extensaoArquivo}`);

      // Criar um stream de escrita para salvar o arquivo
      const writer = fs.createWriteStream(caminhoDoArquivo);
      objetoDoArquivo.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => {
              console.log('Download concluído:', caminhoDoArquivo);
              resolve();
          });
          writer.on('error', err => {
              console.error('Erro ao salvar o arquivo:', err);
              reject(err);
          });
      });
      return caminhoDoArquivo; 
    } catch (error) {
        console.error('Erro ao baixar mídia:', error.response ? error.response.data : error.message);
    }
  }

  async excluirAudio(caminhoDoArquivo){
    await fs.unlink(caminhoDoArquivo, (err) => {
      if (err) {
        console.error('Erro ao deletar o arquivo:', err);
      } else {
        console.log('Audio deletado após processamento');
      }
    });
  }
}
