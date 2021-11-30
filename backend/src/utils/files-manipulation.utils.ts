import Jimp from 'jimp/es';

export const handleAvatar = async (filePath: string, newFilePath: string) => {
  await Jimp.read(filePath)
    .then(async (avatar) => {
      const crop =
        avatar.bitmap.width < avatar.bitmap.height
          ? avatar.bitmap.width
          : avatar.bitmap.height;
      avatar
        // Resize to the min(width, height) take the middle of the picture as reference
        .cover(
          crop,
          crop,
          Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE,
        )
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(newFilePath); // save

      return newFilePath;
    })
    .catch((err) => {
      console.error(err);
    });
};
