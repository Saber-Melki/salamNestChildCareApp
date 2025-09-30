import { Controller, Post, Get, Delete, Put, Param, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateChildDto, UpdateChildDto } from 'apps/child-service/src/dto/child.dto';

@Controller('children')
export class ChildGatewayController {
  constructor(@Inject('CHILD_SERVICE') private readonly childClient: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateChildDto) {
    return this.childClient.send('create_child', dto);
  }

  @Get()
  async findAll() {
    return this.childClient.send('find_all_children', {});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.childClient.send('find_one_child', id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateChildDto) {
    return this.childClient.send('update_child', { id, updateData: dto });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.childClient.send('remove_child', id);
  }
}
