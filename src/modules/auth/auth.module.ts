import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthHelper } from './auth.helper';
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth.strategy';
import { ConfigService } from '@nestjs/config';
import { TypeORMSharedModule } from '../../shared/modules/typeormshared.module';
import { SharedModule } from 'src/shared/modules/sharedModule.module';
import { AuthController } from './auth.controller';
import { jwtConstants } from 'src/shared/constants/index.constant';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeORMSharedModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: () => ({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '1d' },
      }),
    }),
    TypeOrmModule.forFeature([
      // please add entites in sharedmodule file and export.
    ]),
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthHelper, JwtStrategy],
  exports: [AuthService, AuthHelper],
})
export class AuthModule {}
