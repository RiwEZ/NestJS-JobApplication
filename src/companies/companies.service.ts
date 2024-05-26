import { Injectable } from '@nestjs/common';
import { Company } from './companies.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IsNotEmpty } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { CompanyModel } from './companies.model';

@InputType()
export class CreateCompanyBody {
  @Field()
  @IsNotEmpty()
  name: string;
  @Field()
  description: string;
  @Field()
  contactInfo: string;
}

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private company: Model<Company>) {}

  async getAll(): Promise<CompanyModel[]> {
    const result = await this.company.find().exec();
    return result.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      description: r.description,
      contactInfo: r.contactInfo,
    }));
  }

  async create(body: CreateCompanyBody): Promise<CompanyModel | undefined> {
    try {
      const company = new this.company({
        name: body.name,
        description: body.description,
        contactInfo: body.contactInfo,
        admins: [],
      });
      await company.save();

      return {
        id: company._id.toString(),
        name: company.name,
        description: company.description,
        contactInfo: company.contactInfo,
      };
    } catch (err) {
      // check for mongo DuplicateKey error, for duplicated company name
      if (err.code && err.code === 11000) {
      }
      return undefined;
    }
  }
}
