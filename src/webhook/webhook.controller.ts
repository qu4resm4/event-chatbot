import { Controller, Post, Body } from '@nestjs/common';
import { AssistantsService } from '../assistants/assistants.service';
import { SendMessageDto } from 'src/dto/send-message.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private assistantsService: AssistantsService) {}

  @Post('message')
  async handleMessage(@Body() dto: SendMessageDto): Promise<string> {
    return this.assistantsService.sendMessageToAssistant(dto);
  }
}
