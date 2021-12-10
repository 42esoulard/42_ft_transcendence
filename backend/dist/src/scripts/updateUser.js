'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const typeorm_1 = require('typeorm');
const users_entity_1 = require('../users/entity/users.entity');
const config_service_1 = require('../config/config.service');
async function run(id) {
  const connection = await (0, typeorm_1.createConnection)(
    config_service_1.configService.getTypeOrmConfig(),
  );
  const userRepository = connection.getRepository(users_entity_1.Users);
  const userToUpdate = await userRepository.findOne(id);
  if (userToUpdate === undefined) {
    throw new Error('The user doesnt exist into database, cannot update');
  }
  userToUpdate.username = 'Bla';
  return userRepository.save(userToUpdate);
}
let argv = process.argv;
if (argv[2]) {
  run(Number(argv[2]))
    .then((userUpdated) => {
      console.log('Updated user:', userUpdated);
    })
    .catch((error) => console.error('update error', error));
} else {
  console.log(
    'You need to give the ID of the user you want to update as last argv',
  );
}
//# sourceMappingURL=updateUser.js.map
