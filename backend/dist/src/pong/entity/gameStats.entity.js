"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStats = void 0;
const openapi = require("@nestjs/swagger");
const users_entity_1 = require("../../users/entity/users.entity");
const typeorm_1 = require("typeorm");
let GameStats = class GameStats {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, ladderLevel: { required: true, type: () => Number }, user: { required: true, type: () => require("../../users/entity/users.entity").Users } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GameStats.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GameStats.prototype, "ladderLevel", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => users_entity_1.Users, (user) => user.gameStats, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_entity_1.Users)
], GameStats.prototype, "user", void 0);
GameStats = __decorate([
    (0, typeorm_1.Entity)('gameStats')
], GameStats);
exports.GameStats = GameStats;
//# sourceMappingURL=gameStats.entity.js.map