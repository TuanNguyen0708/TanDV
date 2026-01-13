import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './entity/model.entity';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(Model)
    private readonly modelRepo: Repository<Model>,
  ) {}

  async getAll() {
    return this.modelRepo.find({
      order: { modelId: 'ASC' },
    });
  }

  async getById(modelId: string) {
    const model = await this.modelRepo.findOneBy({ modelId });
    if (!model) {
      throw new NotFoundException('Model not found');
    }
    return model;
  }

  async create(dto: CreateModelDto) {
    const existing = await this.modelRepo.findOne({
      where: { modelId: dto.modelId },
    });
    if (existing) {
      throw new BadRequestException('modelId already exists');
    }

    const model = this.modelRepo.create(dto);
    return this.modelRepo.save(model);
  }

  async update(modelId: string, dto: UpdateModelDto) {
    const model = await this.modelRepo.findOneBy({ modelId });
    if (!model) {
      throw new NotFoundException('Model not found');
    }

    // If updating modelId, check if new modelId already exists
    if (dto.modelId && dto.modelId !== model.modelId) {
      const existing = await this.modelRepo.findOne({
        where: { modelId: dto.modelId },
      });
      if (existing) {
        throw new BadRequestException('modelId already exists');
      }
    }

    Object.assign(model, dto);
    return this.modelRepo.save(model);
  }

  async delete(modelId: string) {
    const model = await this.modelRepo.findOneBy({ modelId });
    if (!model) {
      throw new NotFoundException('Model not found');
    }

    await this.modelRepo.remove(model);
    return { message: 'Model deleted successfully' };
  }
}

