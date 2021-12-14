'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handleAvatar = void 0;
const es_1 = require('jimp/es');
const handleAvatar = async (filePath, newFilePath) => {
  await es_1.default
    .read(filePath)
    .then(async (avatar) => {
      const crop =
        avatar.bitmap.width < avatar.bitmap.height
          ? avatar.bitmap.width
          : avatar.bitmap.height;
      avatar
        .cover(
          crop,
          crop,
          es_1.default.HORIZONTAL_ALIGN_CENTER |
            es_1.default.VERTICAL_ALIGN_MIDDLE,
        )
        .quality(60)
        .greyscale()
        .write(newFilePath);
      return newFilePath;
    })
    .catch((err) => {
      console.error(err);
    });
};
exports.handleAvatar = handleAvatar;
//# sourceMappingURL=files-manipulation.utils.js.map
