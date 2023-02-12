import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActiveCountryService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  async getUser(userId: number) {
    const user = await this.repository.findOne({
      where: { id: userId },
      relations: ['roles', 'active_country', 'country'],
    });

    return user;
  }
}
