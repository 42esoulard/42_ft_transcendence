import {
  createConnection,
  createQueryBuilder,
  ConnectionOptions,
} from 'typeorm';
import { Users } from '../users/entity/users.entity';
import { configService } from '../config/config.service';
import { Channels } from 'src/channels/entity/channels.entity';

const defaultAvatar = 'http://localhost:3000/users/avatars/default.jpg';

async function run() {
  await createConnection(
    configService.getTypeOrmConfig() as ConnectionOptions,
  ).then((connection) => {
    createQueryBuilder()
      .insert()
      .into(Users)
      .values([
        {
          username: 'Owner',
          forty_two_login: 'Owner', //should not be necessary as owner is not a 42 user
          avatar: 'http://localhost:3000/users/avatars/owner.jpg',
        },
        {
          username: 'user1',
          forty_two_login: 'user1',
          avatar: defaultAvatar,
        },
      ])
      .orIgnore()
      .execute();

    createQueryBuilder()
      .insert()
      .into(Channels)
      .values([{ name: 'General', type: 'Public', owner: null }])
      .execute();
  });
}

run()
  .then((_) => console.log('...wait for script to exit'))
  .catch((error) => console.error('seed error', error));
