import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StaffService } from '../service/staff.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';

@Controller()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @MessagePattern('create_staff')
  create(@Payload() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @MessagePattern('find_all_staff')
  findAll() {
    return this.staffService.findAll();
  }

  @MessagePattern('find_one_staff')
  findOne(@Payload() id: string) {
    return this.staffService.findOne(id);
  }

  @MessagePattern('update_staff')
  update(@Payload() data: { id: string; updateData: UpdateStaffDto }) {
    return this.staffService.update(data.id, data.updateData);
  }

  @MessagePattern('remove_staff')
  remove(@Payload() id: string) {
    return this.staffService.remove(id);
  }
}
