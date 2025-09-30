import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { ShiftService } from '../service/staff.service';
import { Shift } from '../entities/shift.entity';
import { CreateShiftDto, UpdateShiftDto } from '../dto/shift.dto';

@ApiTags('staff')
@Controller()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @MessagePattern({ cmd: 'get_staff' })
  getStaff(): Staff[] {
    return this.staffService.findAll();
  }

  @MessagePattern({ cmd: 'create_staff' })
  createStaff(dto: CreateStaffDto): Staff {
    return this.staffService.create(dto);
  }

  @MessagePattern({ cmd: 'update_staff' })
  updateStaff(payload: { id: string; dto: UpdateStaffDto }): Staff | null {
    return this.staffService.update(payload.id, payload.dto);
  }

  @MessagePattern({ cmd: 'delete_staff' })
  deleteStaff(id: string): boolean {
    return this.staffService.remove(id);
  }
}
