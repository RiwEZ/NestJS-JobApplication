import { Injectable, Logger } from '@nestjs/common';
import { ApplicantModel } from './applicants.model';
import { Applicant, ApplicantStatus } from './applicants.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CandidatesService } from 'src/candidates/candidates.service';
import { GraphQLError } from 'graphql';
import { JobsService } from 'src/jobs/jobs.service';
import { CandidateModel } from 'src/candidates/candidates.model';
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
      status: data.status,
    };
  }

  async get(userId: string, jobId: string): Promise<ApplicantModel[]> {
    const userCompany = await this.companiesService.getUndercare(userId);
    const jobCompany = await this.jobsService.getCompanyOf(jobId);
    if (userCompany.id !== jobCompany.id) {
      throw new GraphQLError(
        `you don't have permission to check the list of applicants of this job`,
      );
    }
    const result = await this.applicant.find({ job: jobId }).exec();
    return result.map((item) => this.toModel(item));
  }

  async getCandidate(id: string): Promise<CandidateModel> {
    const result = await this.applicant.findOne({ _id: id }).exec();
    return this.candidatesService.get(result.candidate);
  }

  async create(userId: string, jobId: string): Promise<ApplicantModel> {
    // check if candidate & job exist or not
    const candidate = await this.candidatesService.getByUserId(userId);
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
        status,
      };
    } catch {
      throw new GraphQLError('internal server error');
    }
  }
}
