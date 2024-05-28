import { Injectable } from '@nestjs/common';
import { ApplicantModel } from './applicants.model';
import { Applicant } from './applicants.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectModel(Applicant.name) private applicant: Model<Applicant>,
  ) {}

  async get(jobId: string): Promise<ApplicantModel[]> {
    const result = await this.applicant.find({ job: jobId }).exec();
    return result.map((r) => ({
      id: r._id.toString(),
      job: r.job,
      user: r.user,
      status: r.status,
    }));
  }
}
