import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  Body,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateStaffDto } from 'apps/staff-service/src/dto/create-staff.dto';
import { UpdateStaffDto } from 'apps/staff-service/src/dto/update-staff.dto';


@Controller('staff')
export class StaffGatewayController {
  constructor(@Inject('STAFF_SERVICE') private readonly staffClient: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateStaffDto) {
    return this.staffClient.send('create_staff', dto);
  }

  @Get()
  async findAll() {
    return this.staffClient.send('find_all_staff', {});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.staffClient.send('find_one_staff', id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffClient.send('update_staff', { id, updateData: dto });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.staffClient.send('remove_staff', id);
  }
}
