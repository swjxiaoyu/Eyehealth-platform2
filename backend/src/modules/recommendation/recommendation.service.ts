import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../../entities/recommendation.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
  ) {}

  async create(recommendationData: Partial<Recommendation>): Promise<Recommendation> {
    const recommendation = this.recommendationRepository.create(recommendationData);
    return this.recommendationRepository.save(recommendation);
  }

  async findById(id: string): Promise<Recommendation | null> {
    return this.recommendationRepository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Recommendation[]> {
    return this.recommendationRepository.find({ where: { userId } });
  }

  async findAll(): Promise<Recommendation[]> {
    return this.recommendationRepository.find();
  }
}
