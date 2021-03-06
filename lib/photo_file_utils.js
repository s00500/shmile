var PhotoFileUtils, fs;

fs = require("fs");

PhotoFileUtils = (function() {
  var GENERATED_PHOTOS_PATH, GENERATED_THUMBS_PATH, composited_images, photo_path_to_url;
  GENERATED_PHOTOS_PATH = "public/photos/generated";
  GENERATED_THUMBS_PATH = "public/photos/generated/thumbs";
  composited_images = function(wantUrlPrefix, wantFullSize) {
    var file, files, i, path, prefix, ret;
    path = (wantFullSize ? GENERATED_PHOTOS_PATH : GENERATED_THUMBS_PATH);
    files = fs.readdirSync(path);
    ret = [];
    for (i in files) {
      file = files[i];
      if (file.match(/jpg$/)) {
        prefix = (wantUrlPrefix ? photo_path_to_url(path) + "/" : "");
        ret.push(prefix + file);
      }
    }
    return ret;
  };
  photo_path_to_url = function(relpath) {
    return relpath.replace(/^public/, "");
  };
  return {
    composited_images: composited_images,
    photo_path_to_url: photo_path_to_url
  };
})();

module.exports = PhotoFileUtils;
