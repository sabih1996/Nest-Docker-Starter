import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { AuthHelper } from '../auth/auth.helper';
import { JwtStrategy } from '../auth/auth.strategy';
import { TypeORMSharedModule } from '../../shared/modules/typeormshared.module';
import { AuthService } from '../auth/auth.service';
import { SharedModule } from 'src/shared/modules/sharedModule.module';

@Module({
  imports: [TypeORMSharedModule, AuthModule, SharedModule],
  controllers: [UserController],
  providers: [UserService, AuthService, AuthHelper, JwtStrategy],
})
export class UserModule {}
