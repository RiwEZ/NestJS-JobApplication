import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from './jobs.schema';
import { Model, Types } from 'mongoose';
import { CreateJobBody, JobModel } from './jobs.model';
import { GraphQLError } from 'graphql';
import { CompaniesService } from 'src/companies/companies.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private job: Model<Job>,
    private companiesService: CompaniesService,
  ) {}

  toModel(data: Job & { _id: Types.ObjectId }): JobModel {
    return {
      id: data._id.toString(),
      title: data.title,
      description: data.description,
      isOpen: data.isOpen,
    };
  }

  async get(id: string): Promise<JobModel> {
    const result = await this.job.findOne({ _id: id }).exec();

    if (result === null) {
      throw new GraphQLError('this job does not exist');
    }

    return this.toModel(result);
  }

  async getAll(isOpen: boolean): Promise<JobModel[]> {
    const result = await this.job.find({ isOpen }).exec();
    return result.map((item) => this.toModel(item));
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

      return this.toModel(job);
    } catch (err) {
      throw new GraphQLError('internal server error');
    }
  }

  async delete(userId: string, id: string): Promise<JobModel> {
    const hasPermission = await this.companiesService.checkPermission(
      id,
      userId,
    );
    if (!hasPermission) {
      throw new GraphQLError(
        `you don't have permission to toggle status for this job`,
      );
    }

    try {
      const result = await this.job.findOneAndDelete({ _id: id }).exec();

      if (result === null) {
        throw new GraphQLError(
          `cannot find a job with an id ${id} that you have permission to delete`,
        );
      }
      return this.toModel(result);
    } catch {
      throw new GraphQLError(`internal server error`);
    }
  }

  async toggleStatus(userId: string, jobId: string): Promise<JobModel> {
    const result = await this.job.findOne({ _id: jobId }).exec();

    if (result === null) {
      throw new GraphQLError(`job with and id ${jobId} is not founded`);
    }

    const hasPermission = await this.companiesService.checkPermission(
      result._id.toString(),
      userId,
    );
    if (!hasPermission) {
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
