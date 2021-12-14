import { Request } from 'express';
import { extname } from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { fromFile } from 'file-type';

const validFileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const validMimeTypes = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

function _imageFileFilter(req: Request, file: Express.Multer.File, callback) {
  if (!validMimeTypes.includes(file.mimetype)) {
    req.fileValidationError = 'Only image files are allowed!';
    return callback(null, false);
  }
  callback(null, true);
}

function _editFileName(req: Request, file: Express.Multer.File, callback) {
  const fileExtName = extname(file.originalname);
  let newName = 'user'; // default filename
  if (req.user?.forty_two_login) {
    newName = req.user.forty_two_login;
  }
  console.log('new name:', `${newName}_tmp${fileExtName}`);
  callback(null, `${newName}_tmp${fileExtName}`);
}

export const saveImageToStorage = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: _editFileName,
  }),
  fileFilter: _imageFileFilter,
  limits: { fileSize: 1024 * 1024 }, //(in bytes)
};

export const IsFileExtensionSafe = async (
  filePath: string,
): Promise<boolean> => {
  try {
    const fileType = await fromFile(filePath);
    if (!validMimeTypes.includes(fileType.mime)) {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
};

export const removeFile = (filePath: string) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.log(error);
  }
};
