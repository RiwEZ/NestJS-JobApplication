import { Injectable, Logger } from '@nestjs/common';
import { Company } from './companies.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyModel, CreateCompanyData } from './companies.model';
import { GraphQLError } from 'graphql';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(@InjectModel(Company.name) private company: Model<Company>) {}

  toModel(data: Company & { _id: Types.ObjectId }): CompanyModel {
    return {
      id: data._id.toString(),
      name: data.name,
      description: data.description,
      contactInfo: data.contactInfo,
    };
  }

  async getAll(): Promise<CompanyModel[]> {
    const result = await this.company.find().exec();
    return result.map((item) => this.toModel(item));
  }

  async getProfile(userId: string): Promise<CompanyModel> {
    const result = await this.company.findOne({ owner: userId }).exec();

    if (result === null) {
      throw new GraphQLError(
        'you did not register a company on this account yet',
      );
    }

    return this.toModel(result);
  }

  async get(id: string): Promise<CompanyModel> {
    const result = await this.company.findOne({ _id: id }).exec();
    if (result === null) {
      throw new GraphQLError(`cannot find a company with id ${id}`);
    }
    return this.toModel(result);
  }

  async getByName(name: string): Promise<CompanyModel> {
    const result = await this.company.findOne({ name }).exec();
    if (result === null) {
      throw new GraphQLError(`cannot find a company with name ${name}`);
    }
    return this.toModel(result);
  }

  async register(id: string, data: CreateCompanyData): Promise<CompanyModel> {
    try {
      const company = new this.company({
        owner: id,
        name: data.name,
        description: data.description,
        contactInfo: data.contactInfo,
        isDeleted: false,
      });
      await company.save();

      return this.toModel(company);
    } catch (err) {
      if (err.code && err.code === 11000) {
        throw new GraphQLError(
          'you have already create a company with this account',
        );
      }
      throw new GraphQLError('internal server error');
    }
  }

  async edit(id: string, data: CreateCompanyData): Promise<CompanyModel> {
    try {
      const result = await this.company
        .findOneAndUpdate(
          { _id: id },
          {
            name: data.name,
            description: data.description,
            contactInfo: data.contactInfo,
          },
        )
        .exec();

      if (result === null) {
        throw new GraphQLError(
          `cannot find a company with an id ${id} that you have permission to edit`,
        );
      }

      return {
        id,
        name: data.name,
        description: data.description,
        contactInfo: data.contactInfo,
      };
    } catch (err) {
      if (err.code && err.code === 11000) {
        throw new GraphQLError(`duplicated company name`);
      }
      throw new GraphQLError(`internal server error`);
    }
  }

  async checkPermission(companyId: string, userId: string): Promise<boolean> {
    const result = await this.company.findOne({
      owner: userId,
      _id: companyId,
    });

    if (result === null) {
      return false;
    }

    return true;
  }
}
