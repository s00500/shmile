var CameraControl, ImageCompositor, PhotoFileUtils, State, StubCameraControl, camera, ccKlass, dotenv, exec, exp, express, fs, http, io, jade, sys, web, yaml;
express = require("express");
jade = require("jade");
http = require("http");
sys = require("sys");
fs = require("fs");
yaml = require("yaml");
dotenv = require("dotenv");
exec = require("child_process").exec;
dotenv.load();

console.log("printer is: " + process.env.PRINTER_ENABLED);

PhotoFileUtils = require("./lib/photo_file_utils");
StubCameraControl = require("./lib/stub_camera_control");
CameraControl = require("./lib/camera_control");
ImageCompositor = require("./lib/image_compositor");

exp = express();

web = http.createServer(exp);

exp.configure(function() {
  exp.set("views", __dirname + "/views");
  exp.set("view engine", "jade");
  exp.use(express.json());
  exp.use(express.methodOverride());
  exp.use(exp.router);
  return exp.use(express["static"](__dirname + "/public"));
});

exp.get("/", function(req, res) {
  return res.render("index", {
    title: "shmile",
    extra_css: []
  });
});

exp.get("/gallery", function(req, res) {
  return res.render("gallery", {
    title: "gallery!",
    extra_css: ["photoswipe/photoswipe"],
    image_paths: PhotoFileUtils.composited_images(true)
  });
});

State = {
  image_src_list: []
};

ccKlass = process.env['STUB_CAMERA'] === "true" ? StubCameraControl : CameraControl;

camera = new ccKlass().init();

camera.on("photo_saved", function(filename, path, web_url) {
  return State.image_src_list.push(path);
});

io = require("socket.io").listen(web);

web.listen(3000);

io.sockets.on("connection", function(websocket) {
  sys.puts("Web browser connected");
  camera.on("camera_begin_snap", function() {
    return websocket.emit("camera_begin_snap");
  });
  camera.on("camera_snapped", function() {
    return websocket.emit("camera_snapped");
  });
  camera.on("photo_saved", function(filename, path, web_url) {
    return websocket.emit("photo_saved", {
      filename: filename,
      path: path,
      web_url: web_url
    });
  });
  websocket.on("snap", function() {
    return camera.emit("snap");
  });
  websocket.on("all_images", function() {});
  return websocket.on("composite", function() {
    var compositer = new ImageCompositor(State.image_src_list).init();
    compositer.emit("composite");
    compositer.on("composited", function(output_file_path) {
      console.log("Finished compositing image. Output image is at ", output_file_path);
      State.image_src_list = [];
      if (process.env.PRINTER_ENABLED === "true") {
        console.log("Printing image at ", output_file_path);
        exec("lpr -o " + process.env.PRINTER_IMAGE_ORIENTATION + " -o media=\"" + process.env.PRINTER_MEDIA + "\" " + output_file_path);
      }
      return websocket.broadcast.emit("composited_image", PhotoFileUtils.photo_path_to_url(output_file_path));
    });
    return compositer.on("generated_thumb", function(thumb_path) {
      return websocket.broadcast.emit("generated_thumb", PhotoFileUtils.photo_path_to_url(thumb_path));
    });
  });
});
