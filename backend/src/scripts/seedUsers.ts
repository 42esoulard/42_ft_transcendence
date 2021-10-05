import { createConnection, createQueryBuilder, ConnectionOptions } from 'typeorm';
import { Users } from '../users/entity/users.entity';
import { configService } from '../config/config.service';

async function run() {
  await createConnection(configService.getTypeOrmConfig() as ConnectionOptions)
    .then(connection => {
      createQueryBuilder()
        .insert()
        .into(Users)
        .values([
          { username: "Harry", avatar: "path/to/avatar.img" },
          { username: "Ron", avatar: "path/to/avatar.img" },
          { username: "Hermione", avatar: "path/to/avatar.img" },
          { username: "Severus", avatar: "path/to/avatar.img" }
        ])
        .execute();
    })
}

run()
  .then(_ => console.log('...wait for script to exit'))
  .catch(error => console.error('seed error', error));
