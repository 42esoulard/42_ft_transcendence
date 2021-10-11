import { Request } from "express";
import { extname } from "path";

export const imageFileFilter = (req: Request, file: Express.Multer.File, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return callback(null, false);
  }
  callback(null, true);
};

export const editFileName = (req: Request, file: Express.Multer.File, callback) => {
  const fileExtName = extname(file.originalname);
  let newName = "user"; // default filename 
  if (req.user?.forty_two_login) {
    newName = req.user.forty_two_login;
  }
  callback(null, `${newName}${fileExtName}`);
};