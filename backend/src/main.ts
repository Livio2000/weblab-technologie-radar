import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common'
import helmet from 'helmet'
import * as compression from 'compression'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({}));
  app.enableVersioning({
    type: VersioningType.URI
  });
  app.use(helmet());
  app.use(compression());

  await app.listen(process.env.PORT ?? 4000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT ?? 4000}`);
  });
}
bootstrap();
