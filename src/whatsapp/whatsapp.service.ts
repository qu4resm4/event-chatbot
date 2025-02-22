import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  constructor() {}

  async visualizarMensagem(numeroComercialDoChatBot, mensagemRecebida) {
    // mark incoming message as read
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v18.0/${numeroComercialDoChatBot}/messages`,
      headers: {
        Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: mensagemRecebida.id,
      },
    });
  }

  async responderMensagem(
    numeroComercialDoChatBot: string,
    remetenteDaMensagem,
    respostaAoRemetente,
  ) {
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
}
