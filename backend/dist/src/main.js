'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const swagger_1 = require('@nestjs/swagger');
const app_module_1 = require('./app.module');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
const TypeORMSession_entity_1 = require('./auth/entity/TypeORMSession.entity');
const out_1 = require('connect-typeorm/out');
const typeorm_1 = require('typeorm');
const cookieParser = require('cookie-parser');
const FRONT_URL = `${process.env['FRONT_URL']}`;
const FRONT_URL_BIS = `${process.env['FRONT_URL_BIS']}`;
async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule);
  const sessionRepository = (0, typeorm_1.getRepository)(
    TypeORMSession_entity_1.TypeORMSession,
  );
  app.enableCors({
    credentials: true,
    origin: [FRONT_URL, FRONT_URL_BIS],
  });
  const config = new swagger_1.DocumentBuilder()
    .setTitle('ft_transcendence API')
    .setDescription('Because we will nail it !')
    .setVersion('1.0')
    .addServer(`${process.env.BASE_URL}`)
    .addOAuth2()
    .addCookieAuth('tokens')
    .build();
  const options = {
    operationIdFactory: (controllerKey, methodKey) => methodKey,
  };
  const document = swagger_1.SwaggerModule.createDocument(app, config, options);
  fs.writeFileSync('./api-spec.json', JSON.stringify(document));
  swagger_1.SwaggerModule.setup('api', app, document);
  app.use(
    session({
      cookie: {
        maxAge: 86400,
      },
      resave: false,
      saveUninitialized: false,
      store: new out_1.TypeormStore({}).connect(sessionRepository),
      secret: process.env.JWT_SECRET,
    }),
  );
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map
