// apps/<your-api>/src/app/health.gateway.controller.ts
import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('health')
export class HealthGatewayController {
  constructor(@Inject('HEALTH_SERVICE') private readonly client: ClientProxy) {}

  @Post('seed')
  seedHealthForAll() {
    return this.client.send('seed_health_for_all_children', {});
  }

  @Get()
  findAll() {
    return this.client.send('find_all_health', {});
  }

  @Post()
  create(@Body() body: any) {
    return this.client.send('create_health', body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.client.send('update_health', { id, dto });
  }

  /* ✅ NEW — delete a whole health record */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('remove_health', id);
  }

  @Post(':healthId/notes')
  createNote(@Param('healthId') healthId: string, @Body() note: any) {
    return this.client.send('create_health_note', { healthId, note });
  }

  @Put(':healthId/notes/:noteId')
  updateNote(
    @Param('healthId') healthId: string,
    @Param('noteId') noteId: string,
    @Body() note: any,
  ) {
    return this.client.send('update_health_note', { healthId, noteId, note });
  }

  @Delete(':healthId/notes/:noteId')
  deleteNote(@Param('healthId') healthId: string, @Param('noteId') noteId: string) {
    return this.client.send('delete_health_note', { healthId, noteId });
  }
}
