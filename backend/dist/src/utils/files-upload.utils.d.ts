/// <reference types="multer" />
import { Request } from 'express';
declare function _imageFileFilter(
  req: Request,
  file: Express.Multer.File,
  callback: any,
): any;
export declare const saveImageToStorage: {
  storage: import('multer').StorageEngine;
  fileFilter: typeof _imageFileFilter;
  limits: {
    fileSize: number;
  };
};
export declare const IsFileExtensionSafe: (
  filePath: string,
) => Promise<boolean>;
export declare const removeFile: (filePath: string) => void;
export {};
