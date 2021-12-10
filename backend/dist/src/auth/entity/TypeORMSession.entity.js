'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.TypeORMSession = void 0;
const openapi = require('@nestjs/swagger');
const typeorm_1 = require('typeorm');
let TypeORMSession = class TypeORMSession {
  constructor() {
    this.expiredAt = Date.now();
    this.id = '';
    this.json = '';
  }
  static _OPENAPI_METADATA_FACTORY() {
    return {
      expiredAt: { required: true, type: () => Object, default: Date.now() },
      id: { required: true, type: () => Object, default: '' },
      json: { required: true, type: () => Object, default: '' },
    };
  }
};
__decorate(
  [
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)('bigint'),
    __metadata('design:type', Object),
  ],
  TypeORMSession.prototype,
  'expiredAt',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 255 }),
    __metadata('design:type', Object),
  ],
  TypeORMSession.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)('text'), __metadata('design:type', Object)],
  TypeORMSession.prototype,
  'json',
  void 0,
);
TypeORMSession = __decorate([(0, typeorm_1.Entity)()], TypeORMSession);
exports.TypeORMSession = TypeORMSession;
//# sourceMappingURL=TypeORMSession.entity.js.map
