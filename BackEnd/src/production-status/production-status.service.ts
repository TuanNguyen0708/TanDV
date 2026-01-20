import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionStatus } from './entity/production-status.entity';
import { CreateProductionStatusDto } from './dto/create-production-status.dto';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';

@Injectable()
export class ProductionStatusService {
  constructor(
    @InjectRepository(ProductionStatus)
    private productionStatusRepository: Repository<ProductionStatus>,
  ) {}

  async create(
    createDto: CreateProductionStatusDto,
  ): Promise<ProductionStatus> {
    const productionStatus = this.productionStatusRepository.create(createDto);
    return await this.productionStatusRepository.save(productionStatus);
  }

  async findAll(): Promise<ProductionStatus[]> {
    return await this.productionStatusRepository.find();
  }

  async findOne(id: string): Promise<ProductionStatus> {
    return await this.productionStatusRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: string,
    updateDto: UpdateProductionStatusDto,
  ): Promise<ProductionStatus> {
    await this.productionStatusRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productionStatusRepository.delete(id);
  }
}
