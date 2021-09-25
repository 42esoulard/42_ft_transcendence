import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UsersModule,
    ChatModule,
    AuthModule,
    PassportModule.register({ session: true })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
