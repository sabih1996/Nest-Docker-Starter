import {
  ClassSerializerInterceptor,
  Controller,
  Req,
  UseGuards,
  UseInterceptors,
  Put,
  Body,
  Inject,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Post,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import {
  CountryDto,
  CountryUpdateDto,
  ResetPasswordDto,
  UpdateRoleDto,
  UpdateUserDto,
} from './user.dto';
import { User } from '../../db/user.entity';
import { UserService } from './user.service';
import { UsersList } from '../../common/interfaces/user.interface';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decoraters/role.decorator';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Put('role/update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private updateName(
    @Body() body: UpdateRoleDto,
    @Req() req: Request,
  ): Promise<User> {
    return this.service.updateRoleUser(body, req);
  }

  @Put('reset/password')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private resetPassword(@Body() body: ResetPasswordDto, @Req() req: Request) {
    return this.service.resetPassword(body, req);
  }

  @Get('list')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private listUsers() {
    return this.service.listUsers();
  }

  /**
   * @author Sabih Ul Hassan
   * @param page
   * @param status
   * @param body
   */

  @Post('list/filters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async users(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status', new DefaultValuePipe('')) status: string,
    @Body() body: UsersList,
  ) {
    return this.service.usersListing(
      {
        page,
        limit,
      },
      body,
      status,
    );
  }

  @Post('country/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'subAdmin')
  @UseInterceptors(ClassSerializerInterceptor)
  private country(@Body() body: CountryDto, @Req() req: Request) {
    return this.service.addCountry(body, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('country/list')
  private getList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('country_name', new DefaultValuePipe('')) country_name = '',
    @Query('status', new DefaultValuePipe(null)) status = null,
  ) {
    return this.service.listCountries(
      {
        page,
        limit,
      },
      {
        country_name,
        status,
      },
    );
  }

  @Get('country/list/active')
  private getActiveList() {
    return this.service.listActiveCountries();
  }

  @Patch('country/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'subAdmin')
  private updateProfile(@Body() body: CountryUpdateDto) {
    return this.service.updateCountries(body);
  }

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateUser(@Param('id') id: number, @Body() body: UpdateUserDto) {
    return this.service.updateUser(id, body);
  }

  /**
   * Get country by id
   * @author Sabih Ul Hassan
   * @param id
   */

  @Get('country/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(ClassSerializerInterceptor)
  public singleCountry(@Param('id') id: number) {
    return this.service.singleCountry(id);
  }
}
