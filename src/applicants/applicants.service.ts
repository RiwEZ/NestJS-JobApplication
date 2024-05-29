import { Injectable, Logger } from '@nestjs/common';
import { ApplicantModel } from './applicants.model';
import { Applicant, ApplicantStatus } from './applicants.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CandidatesService } from 'src/candidates/candidates.service';
import { GraphQLError } from 'graphql';
import { JobsService } from 'src/jobs/jobs.service';
import { CompaniesService } from 'src/companies/companies.service';

@Injectable()
export class ApplicantsService {
  private logger = new Logger(ApplicantsService.name);

  constructor(
    @InjectModel(Applicant.name) private applicant: Model<Applicant>,
    private candidatesService: CandidatesService,
    private jobsService: JobsService,
    private companiesService: CompaniesService,
  ) {}

  toModel(data: Applicant & { _id: Types.ObjectId }): ApplicantModel {
    return {
      id: data._id.toString(),
      job: data.job,
      candidate: data.candidate,
      status: data.status,
    };
  }

  async get(userId: string, jobId: string): Promise<ApplicantModel[]> {
    // TODO, only the user who created the company who own the job should be able to view list
    // of applicants
    await this.companiesService.getUndercare(userId);

    const result = await this.applicant.find({ job: jobId }).exec();
    return result.map((item) => this.toModel(item));
  }

  async create(userId: string, jobId: string): Promise<ApplicantModel> {
    // check if candidate & job exist or not
    const candidate = await this.candidatesService.get(userId);
    await this.jobsService.get(jobId);

    try {
      const applicant = new this.applicant({
        candidate: candidate.id,
        job: jobId,
        status: ApplicantStatus.PENDING,
      });
      await applicant.save();

      return this.toModel(applicant);
    } catch (err) {
      this.logger.log(err);
      throw new GraphQLError('internal server error');
    }
  }

  async updateStatus(
    id: string,
    status: ApplicantStatus,
  ): Promise<ApplicantModel> {
    try {
      const result = await this.applicant
        .findOneAndUpdate({ _id: id }, { status })
        .exec();

      if (result === null) {
        throw new GraphQLError('this applicant does not exist');
      }

      return {
        id: result._id.toString(),
        job: result.job,
        candidate: result.candidate,
        status,
      };
    } catch {
      throw new GraphQLError('internal server error');
    }
  }
}
