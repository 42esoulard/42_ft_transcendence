import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
import { PresenceGateway } from './presence.gateway';

@Module({
  providers: [PresenceGateway],
  // imports: [
  //   JwtModule.register({
  //     secret: process.env.JWT_SECRET,
  //   }),
  // ]
})
export class PresenceModule {}
