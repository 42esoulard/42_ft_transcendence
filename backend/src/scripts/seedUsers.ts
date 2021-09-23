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
      { firstname: "Harry", lastname: "Potter", password: "password", salt: "salt" },
      { firstname: "Ron", lastname: "Weasley", password: "password", salt: "salt" },
      { firstname: "Hermione", lastname: "Granger", password: "password", salt: "salt" },
      { firstname: "Severus", lastname: "Rogue", password: "password", salt: "salt" }
    ])
    .execute();
  })
}

run()
.then(_ => console.log('...wait for script to exit'))
.catch(error => console.error('seed error', error));
