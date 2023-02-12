import { ForgottenPassword } from './../../db/forgot-password.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../db/user.entity';
import { Not, Repository, ILike, In } from 'typeorm';
import {
  RegisterDto,
  LoginDto,
  UserDto,
  ProfileDto,
  ActiveCountryPostDto,
} from './auth.dto';
import { AuthHelper } from './auth.helper';
import { Roles } from '../../db/roles.entity';
import { ERoles } from 'src/shared/enums/roles.enum';
import { Country } from 'src/db/index.export';
import { ActiveCountryService } from '../country/activecountry.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(ForgottenPassword)
    private readonly forgottenPasswordRepository: Repository<ForgottenPassword>,
    public readonly helper: AuthHelper,
    private readonly activeCountry: ActiveCountryService,
  ) {}

  public async addConfig(user: User) {
    let country_selected = await this.countryRepository.findOne({
      where: {
        country_name: 'Saudi Arabia',
      },
    });

    if (!country_selected) {
      const addCountry = new Country();
      addCountry.country_name = 'Saudi Arabia';
      addCountry.status = true;
      addCountry.currency = 'SAR';
      addCountry.currencySymbol = 'SR';
      country_selected = await this.countryRepository.save(addCountry);
    }

    user.active_country = country_selected;
    await this.repository.save(user);
    console.log('Configuration Added');
  }
  public async register(body: RegisterDto) {
    const {
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      role,
      city,
      street,
      countryId,
      naylamDispatcherContractors,
      naylamDispatcherCountries,
    }: RegisterDto = body;
    let user: User = await this.repository.findOne({ where: { email } });

    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    let selected_role = await this.rolesRepository.findOne({
      where: { role_name: role },
    });
    user = new User();
    let companyDispatcher = false;

    const promises = [];

    if (countryId) {
      const selected_country = await this.countryRepository.findOne({
        where: { id: countryId },
      });
      if (selected_country) {
        user.active_country = selected_country;
        user.country = selected_country;
        companyDispatcher = true;
      }
    }

    if (!selected_role) {
      // Create if not exist
      const roles = new Roles();
      roles.role_name = role;
      await this.rolesRepository.save(roles);
      selected_role = roles;
    }
    if (
      naylamDispatcherCountries?.length > 0 &&
      naylamDispatcherContractors?.length > 0
    ) {
      promises.push(
        this.countryRepository.find({
          where: {
            id: In(naylamDispatcherCountries),
          },
        }),
      );
    }

    const [countries] = await Promise.all(promises);

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.city = city;
    user.street = street;
    user.mobileNumber = mobileNumber;
    user.password = this.helper.encodePassword(password);
    user.roles = selected_role;
    user.status = true;
    user.createdAt = new Date();
    user.naylamDispatcherCountries = countries;
    const saved = await this.repository.save(user);
    if (!companyDispatcher) await this.addConfig(saved);
    return { result: 'success' };
  }

  private async getCountry(user: User): Promise<any> {
    let country: any;

    if (user.roles.role_name === ERoles.NAYLAM_DIS) {
      country = user.naylamDispatcherCountries[0];
    } else if (user.roles.role_name === ERoles.COMPANY_DIS) {
      country = user.country;
    } else {
      // Set Saudi Arabia as active country by default
      country = await this.countryRepository.findOne({
        where: {
          country_name: 'Saudi Arabia',
        },
      });
    }
    return country;
  }

  public async login(body: LoginDto) {
    const { email, password }: LoginDto = body;
    const user = await this.repository.findOne({
      where: { email: ILike(email) },
    });
    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid: boolean = this.helper.isPasswordValid(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Wrong password', HttpStatus.NOT_FOUND);
    }

    const userData = await this.repository.findOne({
      where: { id: user.id },
      relations: {
        roles: true,
        country: true,
        naylamDispatcherCountries: true,
      },
    });
    if (!userData.status) {
      throw new HttpException('User is not active', HttpStatus.NOT_FOUND);
    }

    const country = await this.getCountry(userData);

    this.repository.update(user.id, {
      lastLoginAt: new Date(),
      active_country: country,
    });

    const uData = await this.repository.findOne({
      where: { id: user.id },
      select: ['id', 'firstName', 'lastName', 'email'],
      relations: [
        'roles',
        'active_country',
        'naylamDispatcherContractors',
        'naylamDispatcherCountries',
      ],
    });

    return {
      token: this.helper.generateToken(user),
      data: uData,
      activeCountry: uData['active_country'],
    };
  }

  public async refresh(user: User): Promise<string> {
    this.repository.update(user.id, { lastLoginAt: new Date() });

    return this.helper.generateToken(user);
  }
  public async listroles() {
    const result = await this.rolesRepository.find({
      where: { role_name: Not('admin') },
    });

    return {
      data: result,
    };
  }
  public async postRoles() {
    // This end point will be used once, when creating new DB. So, that new roles can be added.
    const roles = [
      'admin',
      'subAdmin',
      'naylamDispatcher',
      'companyDispatcher',
    ];
    for (const role of roles) {
      const selected_role = await this.rolesRepository.findOne({
        where: { role_name: role },
      });

      if (!selected_role) {
        // Create if not exist
        const roles = new Roles();
        roles.role_name = role;
        await this.rolesRepository.save(roles);
      }
    }
    const result = await this.rolesRepository.find();

    return {
      data: result,
    };
  }
  public async activeCountryList(body: any) {
    const { userId, countryId }: ActiveCountryPostDto = body;
    const user = await this.repository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new HttpException('', HttpStatus.NOT_FOUND);
    }
    const country = await this.countryRepository.findOne({
      where: {
        id: countryId,
      },
    });
    if (!country) {
      throw new HttpException('', HttpStatus.NOT_FOUND);
    }

    return {
      data: '',
    };
  }
  public async setBrowseCountry(body: ActiveCountryPostDto) {
    const { userId, countryId } = body;
    const user = await this.repository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new HttpException('', HttpStatus.NOT_FOUND);
    }
    let country = null;
    if (countryId !== -1) {
      country = await this.countryRepository.findOne({
        where: {
          id: countryId,
        },
      });
      if (!country) {
        throw new HttpException('', HttpStatus.NOT_FOUND);
      }
    }

    user.active_country = country;
    user.updatedAt = new Date();
    return {
      data: await this.repository.save(user),
    };
  }
  public async profile(user: User) {
    const userData = await this.repository.findOne({
      where: { id: user.id },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'city',
        'street',
        'mobileNumber',
        'avatar',
      ],
      relations: [
        'roles',
        'active_country',
        'naylamDispatcherContractors',
        'naylamDispatcherCountries',
      ],
    });

    return {
      data: userData,
    };
  }

  public async getUserProfile(id: number) {
    const userData = await this.repository.findOne({
      where: { id: id },
      relations: ['roles', 'country'],
    });

    if (!userData)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return {
      data: userData,
    };
  }

  public async updateProfile(user: User, body: ProfileDto) {
    const {
      firstName,
      lastName,
      mobileNumber,
      status,
      city,
      street,
      avatar,
      countryId,
      email,
    } = body;

    const userId = body?.userId ? body.userId : user.id;
    const userData = await this.repository.findOne({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobileNumber: true,
        avatar: true,
      },
      relations: { roles: true },
    });

    const roleId = body?.roleId !== 1 ? body?.roleId : userData?.rolesId;
    if (!userData)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const selected_country = await this.countryRepository.findOne({
      where: { id: countryId },
    });

    await this.repository.save({
      id: userId,
      firstName,
      lastName,
      avatar,
      mobileNumber,
      rolesId: roleId,
      status,
      city,
      email,
      contractor: null,
      country: selected_country,
      active_country: selected_country,
      street,
    });

    const userDataResult: UserDto = await this.repository.findOne({
      where: { id: userId },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'mobileNumber',
        'status',
        'avatar',
        'city',
        'status',
        'street',
      ],
      relations: ['roles', 'active_country'],
    });

    return {
      data: userDataResult,
    };
  }

  public async updateProfileSubAdmin(user: User, body: ProfileDto) {
    const { firstName, lastName, mobileNumber, street, city, avatar } = body;
    await this.repository.update(user.id, {
      firstName,
      lastName,
      mobileNumber,
      street,
      city,
      avatar,
    });

    const userData: UserDto = await this.repository.findOne({
      where: { id: user.id },
      relations: ['roles'],
    });

    return {
      data: userData,
    };
  }

  public async listUsers() {
    const result = await this.repository.find({
      where: { roles: { role_name: Not('admin') } },
      relations: ['roles'],
    }); // filter on inner table

    return {
      data: result,
      total_records: result.length,
    };
  }

  async createForgottenPasswordToken(
    email: string,
  ): Promise<ForgottenPassword> {
    const forgottenPassword = await this.forgottenPasswordRepository.findOne({
      where: { email },
    });
    if (
      forgottenPassword &&
      (new Date().getTime() - forgottenPassword.timeStamp.getTime()) / 60000 <
        15
    ) {
      throw new HttpException(
        'Token is sent recently. Please check your email.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      const model = new ForgottenPassword();
      model.email = email;
      model.newPasswordToken = (
        Math.floor(Math.random() * 900000) + 100000
      ).toString();
      model.timeStamp = new Date();

      const forgottenPasswordModel =
        await this.forgottenPasswordRepository.save(model);

      if (forgottenPasswordModel) {
        return forgottenPasswordModel;
      } else {
        throw new HttpException(
          'Something went wrong.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async sendEmailForgotPassword(email: string): Promise<any> {
    const userFromDb: User = await this.repository.findOne({
      where: { email },
    });
    if (!userFromDb)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async checkPassword(email: string, password: string) {
    const userFromDb: User = await this.repository.findOne({
      where: { email },
    });
    if (!userFromDb)
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);

    return this.helper.isPasswordValid(password, userFromDb.password);
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const userFromDb: User = await this.repository.findOne({
      where: { email },
    });
    if (!userFromDb)
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);

    userFromDb.password = this.helper.encodePassword(newPassword);

    await userFromDb.save();
    return true;
  }

  async getForgottenPasswordModel(
    newPasswordToken: string,
  ): Promise<ForgottenPassword> {
    return await this.forgottenPasswordRepository.findOne({
      where: { newPasswordToken },
    });
  }

  async removeForgottenPasswordModel(
    forgottenPasswordObj: ForgottenPassword,
  ): Promise<ForgottenPassword> {
    return await this.forgottenPasswordRepository.remove(forgottenPasswordObj);
  }

  async getUser(userid) {
    const user = await this.repository.findOne({
      where: { id: userid },
      relations: ['roles', 'active_country'],
    });

    return user;
  }
}
