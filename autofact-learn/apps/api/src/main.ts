import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  });

  const uploadDir = config.get<string>('UPLOAD_DIR') ?? 'uploads';
  app.useStaticAssets(join(process.cwd(), uploadDir), { prefix: '/uploads' });

  const swagger = new DocumentBuilder()
    .setTitle('AutoInspect API')
    .setDescription('Marketplace of used-car inspection reports')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);
  console.log(`API http://localhost:${port}/api/v1`);
  console.log(`Swagger http://localhost:${port}/api/docs`);
}
bootstrap();
