import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from './fortytwo.strategy';
import { SessionSerializer } from './utils/Serializer';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionSerializer, FortyTwoStrategy],
  imports: [UsersModule]
})
export class AuthModule {}
