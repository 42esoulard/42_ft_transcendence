import { createConnection, ConnectionOptions } from 'typeorm';
import { Users } from '../users/entity/users.entity';
import { configService } from '../config/config.service';

/**
 * run as follow: npm run start:dev:db:update [idToUpdate]
 **/

async function run(id: number) {
  const connection = await createConnection(
    configService.getTypeOrmConfig() as ConnectionOptions,
  );
  const userRepository = connection.getRepository(Users);
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
