import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class WhatsappService {
  private token = process.env.WHATSAPP_ACCESS_TOKEN;
  private phoneNumberId = process.env.WHATSAPP_BUSINESS_ID;
  private apiUrl = `https://graph.facebook.com/v17.0/${this.phoneNumberId}/messages`;

  async sendMessage(to: string, message: string) {
    try {
      await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to,
          text: { body: message },
        },
        {
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem para o WhatsApp:', error);
    }
  }
}
