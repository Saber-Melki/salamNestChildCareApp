import { Controller, Post, Get, Delete, Param, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateHealthDto, UpdateHealthDto } from 'apps/health-service/src/dto/health.dto';


@Controller('health')
export class HealthGatewayController {
  constructor(@Inject('HEALTH_SERVICE') private readonly healthClient: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateHealthDto) {
    return this.healthClient.send('create_health', dto);
  }

  @Get()
  async findAll() {
    return this.healthClient.send('find_all_health', {});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.healthClient.send('find_one_health', id);
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateHealthDto) {
    return this.healthClient.send('update_health', { id, dto });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.healthClient.send('remove_health', id);
  }
}
