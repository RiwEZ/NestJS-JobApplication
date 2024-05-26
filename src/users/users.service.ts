import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
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

  async findOne(
    username: string,
  ): Promise<{ id: string; username: string; password: string } | undefined> {
    // this could lead to a bug, should be findMany
    const result = await this.user.findOne({ username: username }).exec();

    if (result === null) {
      return undefined;
    }

    return {
      id: result._id.toString(),
      username: result.username,
      password: result.password,
    };
  }

  async create(username: string, password: string): Promise<CreateResult> {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new this.user({
        username,
        password: hashedPassword,
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
