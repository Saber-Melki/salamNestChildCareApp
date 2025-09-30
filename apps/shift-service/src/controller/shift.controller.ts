import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ShiftService } from '../service/shift.service';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';

@Controller()
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @MessagePattern('create_shift')
  async create(@Payload() dto: CreateShiftDto) {
    console.log('Create shift:', dto);
    const shift = await this.shiftService.create(dto);
    return { status: 'ok', data: shift };
  }

  @MessagePattern('find_all_shift')
  async findAll() {
    const shifts = await this.shiftService.findAll();
    return shifts;
  }

  @MessagePattern('find_one_shift')
  async findOne(@Payload() id: string) {
    const shift = await this.shiftService.findOne(id);
    return shift;
  }

  // @MessagePattern('update_shift')
  // async update(@Payload() payload: { id: string; dto: UpdateShiftDto }) {
  //   const { id, dto } = payload;
  //   const updated = await this.shiftService.update(id, dto);
  //   return { status: 'updated', data: updated };
  // }

  @MessagePattern('update_shift')
async update(@Payload() payload: { id: string; dto: UpdateShiftDto }) {
  const { id, dto } = payload;
  return await this.shiftService.update(id, dto); // 👈 no wrapper
}

  @MessagePattern('remove_shift')
  async remove(@Payload() id: string) {
    await this.shiftService.remove(id);
    return { status: 'removed', id };
  }
}
