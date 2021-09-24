import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './fortytwo.guard';
import { FortyTwoStrategy } from './fortytwo.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy]
})
export class AuthModule {}
