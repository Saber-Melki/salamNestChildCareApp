import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from '../entities/child.entity';
import { UpdateChildDto } from '../dto/child.dto';

@Injectable()
export class ChildService {
  constructor(
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
  ) {}

  async findAll(): Promise<Child[]> {
    return this.childRepository.find();
  }

  async findOne(id: string): Promise<Child> {
    const child = await this.childRepository.findOne({ where: { id } });
    if (!child) {
      throw new NotFoundException(`Child with id ${id} not found`);
    }
    return child;
  }

  async create(child: Partial<Child>): Promise<Child> {
    const newChild = this.childRepository.create(child);
    return this.childRepository.save(newChild);
  }

  async update(id: string, updateChildDto: UpdateChildDto): Promise<Child> {
    const child = await this.childRepository.findOne({ where: { id } });
    if (!child) {
      throw new NotFoundException(`Child with id ${id} not found`);
    }

    Object.assign(child, updateChildDto); // merge updates
    return this.childRepository.save(child);
  }

  async remove(id: string): Promise<void> {
    const result = await this.childRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Child with id ${id} not found`);
    }
  }
}
