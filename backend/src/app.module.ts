import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { MongooseModule } from '@nestjs/mongoose'

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
