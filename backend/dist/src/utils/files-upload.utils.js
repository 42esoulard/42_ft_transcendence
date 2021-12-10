'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.removeFile =
  exports.IsFileExtensionSafe =
  exports.saveImageToStorage =
    void 0;
const path_1 = require('path');
const fs = require('fs');
const multer_1 = require('multer');
const file_type_1 = require('file-type');
const validFileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const validMimeTypes = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
function _imageFileFilter(req, file, callback) {
  if (!validMimeTypes.includes(file.mimetype)) {
    req.fileValidationError = 'Only image files are allowed!';
    return callback(null, false);
  }
  callback(null, true);
}
function _editFileName(req, file, callback) {
  var _a;
  const fileExtName = (0, path_1.extname)(file.originalname);
  let newName = 'user';
  if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.forty_two_login) {
    newName = req.user.forty_two_login;
  }
  console.log('new name:', `${newName}_tmp${fileExtName}`);
  callback(null, `${newName}_tmp${fileExtName}`);
}
exports.saveImageToStorage = {
  storage: (0, multer_1.diskStorage)({
    destination: './uploads/avatars',
    filename: _editFileName,
  }),
  fileFilter: _imageFileFilter,
  limits: { fileSize: 1024 * 1024 },
};
const IsFileExtensionSafe = async (filePath) => {
  try {
    const fileType = await (0, file_type_1.fromFile)(filePath);
    if (!validMimeTypes.includes(fileType.mime)) {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
};
exports.IsFileExtensionSafe = IsFileExtensionSafe;
const removeFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.log(error);
  }
};
exports.removeFile = removeFile;
//# sourceMappingURL=files-upload.utils.js.map
