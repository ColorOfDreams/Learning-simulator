import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { AiService } from '../ai/ai.service';

@ApiTags('Chat')
@Controller('ai/chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiService: AiService,
  ) {}

  @Post('sessions')
  createSession(
    @Body()
    body: {
      title?: string;
      subject?: string;
      sceneId?: string;
      userId?: string;
    },
  ) {
    return this.chatService.createSession(body);
  }

  @Get('sessions')
  listSessions() {
    return this.chatService.listSessions();
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string) {
    return this.chatService.getSession(id);
  }

  @Delete('sessions')
  deleteAllSessions() {
    return this.chatService.deleteAllSessions();
  }

  @Delete('sessions/:id')
  deleteSession(@Param('id') id: string) {
    return this.chatService.deleteSession(id);
  }

  @Get('sessions/:id/messages')
  getMessages(@Param('id') id: string) {
    return this.chatService.getMessages(id);
  }

  @Post('sessions/:id/messages')
  async sendMessage(
    @Param('id') sessionId: string,
    @Body() body: { message: string; subject?: string; grade?: number },
  ) {
    const [userMsg] = await Promise.all([
      this.chatService.addMessage({
        sessionId,
        role: 'user',
        content: body.message,
      }),
    ]);

    let aiResponse: string;
    let metadata: Record<string, unknown> | undefined;
    try {
      const result = await this.aiService.chatRaw({
        message: body.message,
        subject: body.subject,
        grade: body.grade,
      });
      aiResponse = result.answer;
      metadata = {
        intent: result.intent,
        topic: result.topic,
        used_llm: result.used_llm,
      };
    } catch {
      aiResponse = 'Xin lỗi, AI hiện không phản hồi. Vui lòng thử lại sau.';
    }

    const aiMsg = await this.chatService.addMessage({
      sessionId,
      role: 'assistant',
      content: aiResponse,
      metadata,
    });

    return { userMessage: userMsg, aiMessage: aiMsg };
  }

  @Post('generate-experiment')
  async generateExperiment(@Body() body: { message: string }) {
    return this.aiService.generateExperiment(body.message);
  }

  @Post('sessions/:id/experiment-chat')
  async experimentChat(
    @Param('id') sessionId: string,
    @Body() body: { message: string; subject?: string },
  ) {
    const [userMsg] = await Promise.all([
      this.chatService.addMessage({
        sessionId,
        role: 'user',
        content: body.message,
      }),
    ]);

    const history = await this.chatService.getMessages(sessionId);
    const context: { role: 'user' | 'assistant'; content: string }[] =
      history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    let aiResponse: string;
    let metadata: Record<string, unknown> | undefined;
    try {
      const result = await this.aiService.chatExperimentDesign({
        message: body.message,
        subject: body.subject,
        context: context,
      });
      aiResponse = result.answer;
      metadata = { experimentConfig: result.experimentConfig };
    } catch (err) {
      console.error(err);
      aiResponse = 'Xin lỗi, AI hiện không phản hồi. Vui lòng thử lại sau.';
    }

    const aiMsg = await this.chatService.addMessage({
      sessionId,
      role: 'assistant',
      content: aiResponse,
      metadata,
    });

    return { userMessage: userMsg, aiMessage: aiMsg };
  }

  @Post('sessions/:id/guidance')
  async getGuidance(
    @Param('id') sessionId: string,
    @Body() body: { sceneGraph?: any },
  ) {
    const guidance = await this.aiService.generateGuidance(body.sceneGraph);
    const msg = await this.chatService.addMessage({
      sessionId,
      role: 'guidance',
      content: guidance.text,
      metadata: { steps: guidance.steps },
    });
    return msg;
  }
}
