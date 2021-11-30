import { createConnection, ConnectionOptions } from 'typeorm';
import { Users } from '../users/entity/users.entity';
import { configService } from '../config/config.service';

async function run() {
  const connection = await createConnection(
    configService.getTypeOrmConfig() as ConnectionOptions,
  );
  const userRepository = connection.getRepository(Users);
  return userRepository.find();
}

run()
  .then((users) => console.log(users))
  .catch((error) => console.error('select error', error));
