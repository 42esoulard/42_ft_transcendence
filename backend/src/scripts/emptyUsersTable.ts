import {
  createConnection,
  createQueryBuilder,
  ConnectionOptions,
} from 'typeorm';
import { Users } from '../users/entity/users.entity';
import { configService } from '../config/config.service';

/**
 * Run in backend container:
 * $ npm run start:dev:db:empty
 */

async function run() {
  const connection = await createConnection(
    configService.getTypeOrmConfig() as ConnectionOptions,
  ).then((connection) => {
    createQueryBuilder().delete().from(Users).execute();
  });
}

run()
  .then((_) => console.log('...wait for script to exit'))
  .catch((error) => console.error('fetch error', error));

// ALTER SEQUENCE Users_id_seq RESTART WITH 1
