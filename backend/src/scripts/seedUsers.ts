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
          { username: "Harry", avatar: "http://localhost:3000/users/avatars/default.jpg" },
          { username: "Ron", avatar: "http://localhost:3000/users/avatars/default.jpg" },
          { username: "Hermione", avatar: "http://localhost:3000/users/avatars/default.jpg" },
          { username: "Severus", avatar: "http://localhost:3000/users/avatars/default.jpg" }
        ])
        .execute();
    })
}

run()
  .then(_ => console.log('...wait for script to exit'))
  .catch(error => console.error('seed error', error));
