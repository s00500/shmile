var EventEmitter, ImageCompositor, exec, fs, im;
im = require("imagemagick");
exec = require("child_process").exec;
fs = require("fs");

EventEmitter = require("events").EventEmitter;
var IMAGE_HEIGHT = 800;
var IMAGE_WIDTH = 1200;
var IMAGE_PADDING = 50;
var TOTAL_HEIGHT = IMAGE_HEIGHT * 2 + IMAGE_PADDING * 3;
var TOTAL_WIDTH = IMAGE_WIDTH * 2 + IMAGE_PADDING * 3;

ImageCompositor = (function() {
  ImageCompositor.prototype.defaults = {
    overlay_src: "public/images/overlay.png",
    tmp_dir: "public/temp",
    output_dir: "public/photos/generated",
    thumb_dir: "public/photos/generated/thumbs"
  };

  function ImageCompositor(img_src_list, opts, cb) {
    this.img_src_list = img_src_list != null ? img_src_list : [];
    this.opts = opts != null ? opts : null;
    this.cb = cb;
    console.log("img_src_list is: " + this.img_src_list);
    if (this.opts === null) {
      this.opts = this.defaults;
    }
  }

  ImageCompositor.prototype.init = function() {

    var emitter = new EventEmitter();
    emitter.on("composite", (function(_this) {
      return function() {
        var FINAL_OUTPUT_PATH, FINAL_OUTPUT_THUMB_PATH, GEOMETRIES, IMAGE_GEOMETRY, OUTPUT_FILE_NAME, OUTPUT_PATH, convertArgs, doCompositing, doGenerateThumb, i, j, ref, resizeCompressArgs, utcSeconds;
        convertArgs = ["-size", TOTAL_WIDTH + "x" + TOTAL_HEIGHT, "canvas:white"];
        utcSeconds = (new Date()).valueOf();
        IMAGE_GEOMETRY = IMAGE_WIDTH + "x" + IMAGE_HEIGHT;
        OUTPUT_PATH = _this.opts.tmp_dir + "/out.jpg";
        OUTPUT_FILE_NAME = utcSeconds + ".jpg";
        FINAL_OUTPUT_PATH = _this.opts.output_dir + "/gen_" + OUTPUT_FILE_NAME;
        FINAL_OUTPUT_THUMB_PATH = _this.opts.thumb_dir + "/thumb_" + OUTPUT_FILE_NAME;
        GEOMETRIES = [IMAGE_GEOMETRY + "+" + IMAGE_PADDING + "+" + IMAGE_PADDING, IMAGE_GEOMETRY + "+" + (2 * IMAGE_PADDING + IMAGE_WIDTH) + "+" + IMAGE_PADDING, IMAGE_GEOMETRY + "+" + IMAGE_PADDING + "+" + (IMAGE_HEIGHT + 2 * IMAGE_PADDING), IMAGE_GEOMETRY + "+" + (2 * IMAGE_PADDING + IMAGE_WIDTH) + "+" + (2 * IMAGE_PADDING + IMAGE_HEIGHT)];
        for (i = j = 0, ref = _this.img_src_list.length - 1; j <= ref; i = j += 1) {
          convertArgs.push(_this.img_src_list[i]);
          convertArgs.push("-geometry");
          convertArgs.push(GEOMETRIES[i]);
          convertArgs.push("-composite");
        }
        convertArgs.push(OUTPUT_PATH);
        console.log("executing: convert " + (convertArgs.join(" ")));
        im.convert(convertArgs, function(err, stdout, stderr) {
          if (err) {
            throw err;
          }
          emitter.emit("laid_out", OUTPUT_PATH);
          return doCompositing();
        });
        doCompositing = function() {
          var compositeArgs;
          compositeArgs = ["-gravity", "center", _this.opts.overlay_src, OUTPUT_PATH, "-geometry", TOTAL_WIDTH + "x" + TOTAL_HEIGHT, FINAL_OUTPUT_PATH];
          console.log("executing: composite " + compositeArgs.join(" "));
          return exec("composite " + compositeArgs.join(" "), function(error, stderr, stdout) {
            if (error) {
              throw error;
            }
            emitter.emit("composited", FINAL_OUTPUT_PATH);
            return doGenerateThumb();
          });
        };
        resizeCompressArgs = ["-size", "25%", "-quality", "20", FINAL_OUTPUT_PATH, FINAL_OUTPUT_THUMB_PATH];
        return doGenerateThumb = function() {
          return im.convert(resizeCompressArgs, function(e, out, err) {
            if (err) {
              throw err;
            }
            return emitter.emit("generated_thumb", FINAL_OUTPUT_THUMB_PATH);
          });
        };
      };
    })(this));
    return emitter;
  };

  return ImageCompositor;

})();

module.exports = ImageCompositor;
