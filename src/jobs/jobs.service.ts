import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from './jobs.schema';
import { Model } from 'mongoose';
import { CreateJobBody, JobModel } from './jobs.model';
import { GraphQLError } from 'graphql';
import { CompaniesService } from 'src/companies/companies.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private job: Model<Job>,
    private companiesService: CompaniesService,
  ) {}

  async getAll(): Promise<JobModel[]> {
    const result = await this.job.find().exec();
    return result.map((r) => ({
      id: r._id.toString(),
      title: r.title,
      description: r.description,
      isOpen: r.isOpen,
    }));
  }

  async create(
    userId: string,
    companyId: string,
    { title, description, isOpen }: CreateJobBody,
  ): Promise<JobModel> {
    if (!this.companiesService.checkPermission(companyId, userId)) {
      throw new GraphQLError(
        `you don't have permission to create a job for this company`,
      );
    }

    try {
      const job = new this.job({
        title,
        description,
        isOpen,
        company: companyId,
      });
      await job.save();

      return {
        id: job._id.toString(),
        title,
        description,
        isOpen,
      };
    } catch (err) {
      throw new GraphQLError('internal server error');
    }
  }

  async toggleStatus(userId: string, jobId: string): Promise<JobModel> {
    const result = await this.job.findOne({ _id: jobId }).exec();

    if (result === null) {
      throw new GraphQLError(`job with and id ${jobId} is not founded`);
    }

    if (!this.companiesService.checkPermission(result.company, userId)) {
      throw new GraphQLError(
        `you don't have permission to toggle status for this job`,
      );
    }

    try {
      await this.job.updateOne({ isOpen: !result.isOpen }).exec();
      return {
        id: result._id.toString(),
        title: result.title,
        description: result.description,
        isOpen: !result.isOpen,
      };
    } catch {
      throw new GraphQLError('internal server error');
    }
  }
}
