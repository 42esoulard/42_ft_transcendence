import {
  createConnection,
  createQueryBuilder,
  ConnectionOptions,
} from 'typeorm';
import { Channels } from '../channels/entity/channels.entity';
import { configService } from '../config/config.service';

async function run() {
  await createConnection(
    configService.getTypeOrmConfig() as ConnectionOptions,
  ).then(() => {
    createQueryBuilder()
      .insert()
      .into(Channels)
      .values([{ id: 0, name: 'General', type: 'Public', owner: null }])
      .execute();
  });
}

run()
  .then(() => console.log('...wait for script to exit'))
  .catch((error) => console.error('seed error', error));
