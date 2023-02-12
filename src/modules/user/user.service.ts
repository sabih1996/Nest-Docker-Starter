import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ILike,
  Repository,
  Not,
  FindOptionsWhere,
  FindOptionsRelations,
} from 'typeorm';
import { Request } from 'express';
import {
  CountryDto,
  CountryUpdateDto,
  ResetPasswordDto,
  UpdateRoleDto,
  UpdateUserDto,
} from './user.dto';
import { User } from '../../db/user.entity';
import { AuthHelper } from '../auth/auth.helper';
import { Roles } from '../../db/roles.entity';
import { UsersList } from '../../common/interfaces/user.interface';
import { Country } from '../../db/country.entity';
import { ActiveCountryService } from '../country/activecountry.service';
import { isEmpty } from 'lodash';
import { userListFilter } from './user-query.data';
import { PaginatedResponse } from 'src/common/dto/response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    private readonly activeCountry: ActiveCountryService,
    private readonly helper: AuthHelper,
  ) {}
  public async updateRoleUser(
    body: UpdateRoleDto,
    req: Request,
  ): Promise<User> {
    const user: User = <User>req.user;
    if (!user) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }
    let selected_role = await this.rolesRepository.findOne({
      where: { role_name: body.role },
    });

    if (!selected_role) {
      // Create if not exist
      const roles = new Roles();
      roles.role_name = body.role;
      await this.rolesRepository.save(roles);
      selected_role = roles;
    }
    user.roles = selected_role;

    return this.repository.save(user);
  }

  public async resetPassword(body: ResetPasswordDto, req: Request) {
    const { password, newPassword }: ResetPasswordDto = body;
    const user: User = <User>req.user;

    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
    const isPasswordValid: boolean = this.helper.isPasswordValid(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Incorrect password', HttpStatus.NOT_FOUND);
    }

    const _newPassword = this.helper.encodePassword(newPassword);
    user.password = _newPassword;
    this.repository.update(user.id, user);
    return { result: 'updated.' };
  }

  async usersList() {
    return this.repository.findAndCount();
  }

  public async listUsers() {
    const result = await this.repository.find({
      where: { roles: { role_name: Not('admin') } },
      relations: ['roles'],
    });

    return {
      data: result,
      total_records: await this.repository.count(),
    };
  }

  async usersListing(
    options: IPaginationOptions,
    body: UsersList,
    status: string | boolean,
  ) {
    const limit = Number(options.limit);
    const offset = (Number(options.page) - 1) * limit;

    const users = await this.repository.findAndCount({
      where: userListFilter(body, status),
      take: limit,
      skip: offset,
      relations: {
        roles: true,
        country: true,
        naylamDispatcherCountries: true,
      },
      order: { createdAt: 'DESC' },
    });
    const totalUsers = users[1];
    return {
      users: users[0],
      totalUsers: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: options.page,
    };
  }

  public async addCountry(body: CountryDto, req: Request) {
    const { country_name, countryCode, imageUrl } = body;

    let country = await this.countryRepository.findOne({
      where: { country_name: country_name },
    });
    if (country) {
      throw new HttpException('Country already exists', HttpStatus.CONFLICT);
    }

    country = new Country();
    country.country_name = country_name;
    country.countryCode = countryCode;

    if (country_name === 'Saudi Arabia') {
      country.currency = 'SAR';
      country.currencySymbol = 'SR';
    } else {
      country.currency = 'USD';
      country.currencySymbol = '$';
    }

    country.status = true;
    country.imageUrl = imageUrl;
    await this.countryRepository.save(country);
    return { result: 'Country has been added.' };
  }

  public async listCountries(options: IPaginationOptions, params: any) {
    const limit = Number(options.limit);
    const offset = (Number(options.page) - 1) * limit;
    const { country_name } = params;
    let status = params.status;
    if (status === '') {
      status = null;
    }
    const result = await this.countryRepository.findAndCount({
      where: {
        ...(status !== null && { status: status }),
        ...(country_name !== '' && {
          country_name: ILike(`%${country_name}%`),
        }),
      },
      order: {
        id: 'ASC',
      },
      take: limit,
      skip: offset,
    });
    const totalRecords = result[1];
    return {
      countries: result[0],
      totalCountries: totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: options.page,
    };
  }

  public async listActiveCountries() {
    const result = await this.countryRepository.find({
      where: { status: true },
      order: {
        id: 'ASC',
      },
    });
    return {
      countries: result,
    };
  }

  public async updateCountries(body: CountryUpdateDto) {
    const { id, countryName } = body;

    const country = await this.singleCountry(id);
    if (!country.data) {
      throw new HttpException('', HttpStatus.NOT_FOUND);
    }
    await this.countryRepository.update(id, {
      ...body,
      country_name: countryName,
    });
    const result = await this.countryRepository.find({
      order: {
        id: 'ASC',
      },
    });
    await this.singleCountry(id);

    return {
      countries: result,
    };
  }

  public async getUser(
    where: FindOptionsWhere<User>,
    relations?: FindOptionsRelations<User>,
  ): Promise<User> {
    const user = await this.repository.findOne({ where, relations });

    if (!user) {
      throw new UnprocessableEntityException('User not found');
    }

    return user;
  }

  public async updateUser(
    userId: number,
    updateBody: UpdateUserDto,
  ): Promise<User> {
    await this.getUser({ id: userId });

    if (isEmpty(updateBody)) {
      throw new BadRequestException('Please provide a valid body to update');
    }

    let role: Roles;

    if (updateBody.role) {
      role = await this.rolesRepository.findOne({
        where: { id: updateBody.role },
      });

      delete updateBody.role;
    }

    await this.repository.update(userId, {
      ...updateBody,
      roles: role,
    });

    return await this.getUser({ id: userId }, { roles: true });
  }

  public async singleCountry(id: number) {
    const country = await this.countryRepository.findOne({
      where: { id },
    });

    return new PaginatedResponse(true, HttpStatus.OK, country);
  }
}
