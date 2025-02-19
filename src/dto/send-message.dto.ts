import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // ID do usuário do WhatsApp

  @IsString()
  @IsNotEmpty()
  message: string; // Mensagem enviada pelo usuário
}
