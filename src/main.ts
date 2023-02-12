import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule, {
    cors: true,
  });

  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('PORT');
  // app.enableCors({
  //   origin: [
  //     'http://naylam.virtualforce.io:3000',
  //     'http://52.23.163.127:3000',
  //     'http://www.naylam.virtualforce.io:3000',
  //   ],
  //   allowedHeaders:
  //     'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
  //   methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
  //   credentials: true,
  // });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port, () => {
    console.log('[WEB]', config.get<string>('PORT'));
    console.log('Server is UP at PORT 3000');
  });

  // Clearing tracking records to prevent any extra data in database
}

bootstrap();
