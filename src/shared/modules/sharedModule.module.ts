import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FailedLoginAttempts } from 'src/db/failed-login-attempts.entity';
import { ForgottenPassword } from 'src/db/forgot-password.entity';
import { Country } from 'src/db/index.export';
import { Roles } from 'src/db/roles.entity';
import { User } from 'src/db/user.entity';
import { ActiveCountryService } from 'src/modules/country/activecountry.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Roles,
      ForgottenPassword,
      FailedLoginAttempts,
      Country,
    ]),
  ],
  exports: [
    ActiveCountryService,
    TypeOrmModule.forFeature([Roles, ForgottenPassword, FailedLoginAttempts]),
  ],
  providers: [ActiveCountryService],
})
export class SharedModule {}
