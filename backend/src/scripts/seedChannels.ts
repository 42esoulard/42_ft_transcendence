import {
  createConnection,
  createQueryBuilder,
  ConnectionOptions,
} from 'typeorm';
import { configService } from '../config/config.service';
import { Channels } from 'src/channels/entity/channels.entity';

async function run() {
  await createConnection(
    configService.getTypeOrmConfig() as ConnectionOptions,
  ).then(() => {
    createQueryBuilder()
      .insert()
      .into(Channels)
      .values([
        {
          name: 'General',
          type: 'Public',
          password: '',
        },
      ])
      .orIgnore()
      .execute();
  });
}

run()
  .then((_) => console.log('...wait for channels seed script to exit'))
  .catch((error) => console.error('seed error', error));
