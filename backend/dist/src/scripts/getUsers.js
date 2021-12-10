'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const typeorm_1 = require('typeorm');
const users_entity_1 = require('../users/entity/users.entity');
const config_service_1 = require('../config/config.service');
async function run() {
  const connection = await (0, typeorm_1.createConnection)(
    config_service_1.configService.getTypeOrmConfig(),
  );
  const userRepository = connection.getRepository(users_entity_1.Users);
  return userRepository.find();
}
run()
  .then((users) => console.log(users))
  .catch((error) => console.error('select error', error));
//# sourceMappingURL=getUsers.js.map
