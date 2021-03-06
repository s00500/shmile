var EventEmitter, ImageCompositor, expect, fakeExec, fakeImageMagick, rewire, sinon;

expect = require("chai").expect;

rewire = require("rewire");

ImageCompositor = rewire("../lib/image_compositor");

EventEmitter = require("events").EventEmitter;

sinon = require("sinon");

fakeExec = function(command, cb) {};

fakeImageMagick = {
  convert: function(convertArgs, cb) {
    return cb();
  }
};

describe("ImageCompositor", function() {
  beforeEach(function() {
    ImageCompositor.__set__("im", fakeImageMagick);
    return ImageCompositor.__set__("exec", fakeExec);
  });
  describe("#constructor", function() {
    return it("returns instance of ImageCompositor", function() {
      var cc;
      cc = new ImageCompositor();
      return expect(cc).to.be["instanceof"](ImageCompositor);
    });
  });
  describe("#init", function() {
    return it("returns EventEmitter", function() {
      var ee;
      ee = new ImageCompositor().init();
      return expect(ee).to.be["instanceof"](EventEmitter);
    });
  });
  return describe("events", function() {
    return describe("on 'composite'", function() {
      return xit("emits 'laid_out' when done with step one", function() {
        var spy;
        this.it = new ImageCompositor().init();
        spy = sinon.spy();
        this.it.on("laid_out", spy);
        this.it.emit("composite");
        return expect(spy.called).to.be["true"];
      });
    });
  });
});

// ---
// generated by coffee-script 1.9.2
