'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const typeorm_1 = require('typeorm');
const users_entity_1 = require('../users/entity/users.entity');
const config_service_1 = require('../config/config.service');
async function run() {
  const connection = await (0, typeorm_1.createConnection)(
    config_service_1.configService.getTypeOrmConfig(),
  ).then((connection) => {
    (0, typeorm_1.createQueryBuilder)()
      .delete()
      .from(users_entity_1.Users)
      .execute();
  });
}
run()
  .then((_) => console.log('...wait for script to exit'))
  .catch((error) => console.error('fetch error', error));
//# sourceMappingURL=emptyUsersTable.js.map
