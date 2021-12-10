"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_service_1 = require("../config/config.service");
const channels_entity_1 = require("../channels/entity/channels.entity");
async function run() {
    await (0, typeorm_1.createConnection)(config_service_1.configService.getTypeOrmConfig()).then(() => {
        (0, typeorm_1.createQueryBuilder)()
            .insert()
            .into(channels_entity_1.Channels)
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
//# sourceMappingURL=seedChannels.js.map