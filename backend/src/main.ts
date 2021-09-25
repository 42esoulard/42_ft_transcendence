import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from "fs";
import * as session from 'express-session';
import * as passport from 'passport';
// import { Db } from "typeorm-static";
import { TypeORMSession } from './auth/entity/TypeORMSession.entity';
import { TypeormStore } from 'connect-typeorm/out';
import { getRepository } from 'typeorm';
// declare const module: any; // For Hot-Module Replacement

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const sessionRepository = getRepository(TypeORMSession);

  app.enableCors({
    credentials: true,
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"]
  }); // Mandatory to interact w/ vue js which is on a different port

  //Setting up the OpenApi to generate client sdk
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence API')
    .setDescription('Because we will nail it !')
    .setVersion('1.0')
    .addServer('http://localhost:' + process.env.PORT)
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  };
  const document = SwaggerModule.createDocument(app, config, options);

  // To save the api specification in root
  fs.writeFileSync("./api-spec.json", JSON.stringify(document));

  SwaggerModule.setup('api', app, document);

  // For Hot-Module Replacement
  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close());
  // }
  ////////////////////////////////////////

  // apply the express-session middleware as global
  app.use(
    session({
      cookie: {
        maxAge: 86412345,
      },
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({})
        .connect(sessionRepository),
      secret: 'my-secret',
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT);
}
bootstrap();
