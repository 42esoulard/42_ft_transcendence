"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const users_entity_1 = require("../users/entity/users.entity");
const config_service_1 = require("../config/config.service");
const channels_entity_1 = require("../channels/entity/channels.entity");
const role_enum_1 = require("../auth/models/role.enum");
const defaultAvatar = 'http://localhost:3000/users/avatars/default.jpg';
async function run() {
    await (0, typeorm_1.createConnection)(config_service_1.configService.getTypeOrmConfig()).then((connection) => {
        (0, typeorm_1.createQueryBuilder)()
            .insert()
            .into(users_entity_1.Users)
            .values([
            {
                username: 'Owner',
                forty_two_login: 'Owner',
                avatar: 'http://localhost:3000/users/avatars/Owner.jpg',
                role: role_enum_1.Role.OWNER,
            },
            {
                username: 'user1',
                forty_two_login: 'user1',
                avatar: defaultAvatar,
            },
        ])
            .orIgnore()
            .execute();
    });
}
run()
    .then((_) => console.log('...wait for script to exit'))
    .catch((error) => console.error('seed error', error));
//# sourceMappingURL=seedUsers.js.map