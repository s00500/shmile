var EventEmitter, StubCameraControl, fs;

EventEmitter = require("events").EventEmitter;

fs = require("fs-extra");


/*
 * Fake camera controller for frontend testing.
 */

StubCameraControl = (function() {
  function StubCameraControl() {}

  StubCameraControl.prototype.emitter = new EventEmitter();

  StubCameraControl.prototype.paths = {
    cwd: "public/temp",
    web_image_dir: "/temp",
    fixtures: "test/fixtures",
    photo_file: "test_photo.jpg"
  };

  StubCameraControl.prototype.photoPath = function() {
    return this.paths.cwd + "/" + this.paths.photo_file;
  };

  StubCameraControl.prototype.webPhotoPath = function() {
    return this.paths.web_image_dir + "/" + this.paths.photo_file;
  };

  StubCameraControl.prototype.photoFixturePath = function() {
    return this.paths.fixtures + "/" + this.paths.photo_file;
  };

  StubCameraControl.prototype.init = function() {
    this.emitter.on("snap", (function(_this) {
      return function() {
        _this.emitter.emit("camera_begin_snap");
        _this.emitter.emit("camera_snapped");
        fs.copySync(_this.photoFixturePath(), _this.photoPath());
        return _this.emitter.emit("photo_saved", _this.paths.photo_file, _this.photoPath(), _this.webPhotoPath());
      };
    })(this));
    return this.emitter;
  };

  return StubCameraControl;

})();

module.exports = StubCameraControl;
