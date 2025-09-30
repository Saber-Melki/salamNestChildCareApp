import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Child } from '../entities/child.entity';
import { ChildService } from '../service/child.service';

@Controller()
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  @MessagePattern('create_child')
  async create(@Payload() data: Partial<Child>) {
    return this.childService.create(data);
  }

  @MessagePattern('find_all_children')
  async findAll() {
    return this.childService.findAll();
  }

  @MessagePattern('find_one_child')
  async findOne(@Payload() id: string) {
    return this.childService.findOne(id);
  }

  @MessagePattern('update_child')
  async update(
    @Payload()
    data: { id: string; updateData: Partial<Child> },
  ) {
    return this.childService.update(data.id, data.updateData);
  }

  @MessagePattern('remove_child')
  async remove(@Payload() id: string) {
    return this.childService.remove(id);
  }
}
