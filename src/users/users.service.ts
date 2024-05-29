import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserKind } from './users.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

export enum CreateResult {
  Success,
  Duplicated,
  Failed,
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private user: Model<User>) {}

  async findOne(username: string): Promise<(User & { id: string }) | null> {
    try {
      const result = await this.user.findOne({ username }).exec();

      if (result === null) {
        return null;
      }

      return {
        id: result._id.toString(),
        username: result.username,
        password: result.password,
        kind: result.kind,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async create(
    username: string,
    password: string,
    kind: UserKind,
  ): Promise<CreateResult> {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new this.user({
        username,
        password: hashedPassword,
        kind,
      });
      await user.save();
      return CreateResult.Success;
    } catch (err) {
      // check for mongo DuplicateKey error, for duplicated username
      if (err.code && err.code === 11000) {
        return CreateResult.Duplicated;
      }
      return CreateResult.Failed;
    }
  }
}
