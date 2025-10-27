import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../entities/report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async create(reportData: Partial<Report>): Promise<Report> {
    const report = this.reportRepository.create(reportData);
    return this.reportRepository.save(report);
  }

  async findById(id: string): Promise<Report | null> {
    return this.reportRepository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Report[]> {
    return this.reportRepository.find({ where: { userId } });
  }
}
