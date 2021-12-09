import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as session from 'express-session';
import * as passport from 'passport';
import { TypeORMSession } from './auth/entity/TypeORMSession.entity';
import { TypeormStore } from 'connect-typeorm/out';
import { getRepository } from 'typeorm';
import * as cookieParser from 'cookie-parser';

const FRONT_URL = `${process.env['FRONT_URL']}`;
const FRONT_URL_BIS = `${process.env['FRONT_URL_BIS']}`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const sessionRepository = getRepository(TypeORMSession);

  app.enableCors({
    credentials: true,
    origin: [FRONT_URL, FRONT_URL_BIS],
  }); // Mandatory to interact w/ vue js which is on a different port

  //Setting up the OpenApi to generate client sdk
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence API')
    .setDescription('Because we will nail it !')
    .setVersion('1.0')
    .addServer(`${process.env.BASE_URL}`)
    .addOAuth2()
    .addCookieAuth('tokens')
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);

  // To save the api specification in root
  fs.writeFileSync('./api-spec.json', JSON.stringify(document));

  SwaggerModule.setup('api', app, document);

  // apply the express-session middleware as global
  app.use(
    session({
      cookie: {
        maxAge: 86400, //in seconds (1 day)
      },
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({}).connect(sessionRepository),
      secret: process.env.JWT_SECRET,
    }),
  );

  // Need to enable cookie parser to read cookie between backend and frontend, containing acces token
  // Finally the method choosen, as localstorage not being safe
  app.use(cookieParser());

  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT);
}
bootstrap();
