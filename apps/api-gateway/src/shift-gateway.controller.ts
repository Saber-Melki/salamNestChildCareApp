import { Controller, Post, Get, Delete, Param, Body, Inject, Patch } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateShiftDto } from 'apps/shift-service/src/dto/create-shift.dto';
import { UpdateShiftDto } from 'apps/shift-service/src/dto/update-shift.dto';
import { lastValueFrom } from 'rxjs';


@Controller('shift')
export class ShiftGatewayController {
  constructor(@Inject('SHIFT_SERVICE') private readonly shiftClient: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateShiftDto) {
    return await lastValueFrom(this.shiftClient.send('create_shift', dto));
  }

  @Get()
  async findAll() {
    return await lastValueFrom(this.shiftClient.send('find_all_shift', {}));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await lastValueFrom(this.shiftClient.send('find_one_shift', id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return await lastValueFrom(this.shiftClient.send('update_shift', { id, dto }));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await lastValueFrom(this.shiftClient.send('remove_shift', id));
  }
}
