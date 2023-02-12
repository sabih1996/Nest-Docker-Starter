import { ResetPasswordDto } from '../user/user.dto';
import {
  ResponseSuccess,
  ResponseError,
} from './../../common/dto/response.dto';
import {
  Body,
  Controller,
  Inject,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Req,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Patch,
  HttpException,
} from '@nestjs/common';
import { User } from '../../db/user.entity';
import {
  RegisterDto,
  LoginDto,
  ActiveCountryPostDto,
  ProfileDto,
} from './auth.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { AuthService } from './auth.service';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CurrentUser } from '../../shared/decoraters/user.decorator';
import { Roles } from '../../shared/decoraters/role.decorator';
import { ERoles } from 'src/shared/enums/roles.enum';
import { RequestDto } from 'src/common/dto/request.dto';

export interface IResponse {
  success: boolean;
  message: string;
  errorMessage: string;
  data: any[];
  error: any;
}

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly service: AuthService;

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  private register(@Body() body: RegisterDto) {
    return this.service.register(body);
  }

  @Post('login')
  private login(@Body() body: LoginDto) {
    return this.service.login(body);
  }

  @Post('set/browse/country')
  @UseInterceptors(ClassSerializerInterceptor)
  private setBrowseCountry(@Body() body: ActiveCountryPostDto) {
    return this.service.setBrowseCountry(body);
  }

  // ********************************************* */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  private getProfile(@CurrentUser() user: User) {
    return this.service.profile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  @Roles('admin')
  private getUserProfile(@Param() params) {
    return this.service.getUserProfile(params.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'subAdmin', 'naylamDispatcher', ERoles.COMPANY_DIS)
  private updateProfile(@Req() req: RequestDto, @Body() body: ProfileDto) {
    if (req.user.role === 'admin') {
      return this.service.updateProfile(<User>req.user, body);
    }
    return this.service.updateProfileSubAdmin(<User>req.user, body);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  private refresh(
    @Req() req,
    @CurrentUser() user: User,
  ): Promise<string | never> {
    return this.service.refresh(<User>req.user);
  }

  @Get('list/users')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private listUsers() {
    return this.service.listUsers();
  }

  @Get('list/roles')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private listRoles() {
    return this.service.listroles();
  }

  @Post('post/roles')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private postRoles() {
    return this.service.postRoles();
  }
  @Post('update/active/country')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private activeCountry(@Body() body) {
    return this.service.activeCountryList(body);
  }

  @Get('email/forgot-password/:email')
  public async sendEmailForgotPassword(@Param() params): Promise<IResponse> {
    try {
      const isEmailSent = await this.service.sendEmailForgotPassword(
        params.email,
      );
      if (isEmailSent) {
        return new ResponseSuccess(
          'Email is sent with code. Please check your email.',
          isEmailSent,
        );
      } else {
        throw new HttpException(
          'Something went wrong. Email is not sent with code.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Something went wrong. Email is not sent with code.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email/reset-password')
  @HttpCode(HttpStatus.OK)
  public async setNewPassord(
    @Body() resetPassword: ResetPasswordDto,
  ): Promise<IResponse> {
    try {
      let isNewPasswordChanged = false;
      if (resetPassword.email && resetPassword.password) {
        const isValidPassword = await this.service.checkPassword(
          resetPassword.email,
          resetPassword.password,
        );
        if (isValidPassword) {
          isNewPasswordChanged = await this.service.setPassword(
            resetPassword.email,
            resetPassword.newPassword,
          );
        } else {
          return new ResponseError('Password changed successfully.');
        }
      } else if (resetPassword.newPasswordToken) {
        const forgottenPasswordModel =
          await this.service.getForgottenPasswordModel(
            resetPassword.newPasswordToken,
          );
        isNewPasswordChanged = await this.service.setPassword(
          forgottenPasswordModel.email,
          resetPassword.newPassword,
        );
        if (isNewPasswordChanged)
          await this.service.removeForgottenPasswordModel(
            forgottenPasswordModel,
          );
      } else {
        throw new HttpException(
          'Something went wrong.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return new ResponseSuccess(
        'Password changed successfully.',
        isNewPasswordChanged,
      );
    } catch (error) {
      throw new HttpException('Invalid OTP.', HttpStatus.NOT_FOUND);
    }
  }
}
