import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { MongooseModule } from '@nestjs/mongoose'
import { TechnologyModule } from './technology/technology.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LogModule } from './log/log.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({ 
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      isGlobal: true 
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'global',
          limit: 10,
          ttl: 60
        }
      ]
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI ?? 'mongodb://localhost:27017', {
      user: process.env.DATABASE_USER,
      pass: process.env.DATABASE_PASS,
      dbName: process.env.DATABASE_NAME,
    }),
    TechnologyModule,
    UserModule,
    AuthModule,
    LogModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
