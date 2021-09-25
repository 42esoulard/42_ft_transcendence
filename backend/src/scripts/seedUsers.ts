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
      { username: "Harry", password: "password", salt: "salt", avatar: "path/to/avatar.img", two_fa: false },
      { username: "Ron", password: "password", salt: "salt", avatar: "path/to/avatar.img", two_fa: false },
      { username: "Hermione", password: "password", salt: "salt", avatar: "path/to/avatar.img", two_fa: false },
      { username: "Severus", password: "password", salt: "salt", avatar: "path/to/avatar.img", two_fa: false }
    ])
    .execute();
  })
}

run()
.then(_ => console.log('...wait for script to exit'))
.catch(error => console.error('seed error', error));
