var fs = require("fs");
var ImageCompositor = require("./lib/image_compositor");
var PHOTOS_PATH = "public/photos";

console.log("LOL");
files = fs.readdirSync(PHOTOS_PATH);
y=0;
var image_sets = [];
var image_src_list = [];
for (i in files) {
  file = files[i];
  if (file.match(/jpg$/)) {
    if(y < 4){
    image_src_list.push(PHOTOS_PATH+'/'+file);
    y++;
    }else{
    y=1;
    image_sets.push(image_src_list);
    image_src_list = [];
    image_src_list.push(PHOTOS_PATH+'/'+file);
    }
  }
}

//console.log(JSON.stringify(image_sets));
console.log(JSON.stringify(image_sets[0]));

var x = 0;
function doThing(){
var compositer = new ImageCompositor(image_sets[x]).init();
compositer.emit("composite");
compositer.on("composited", function(output_file_path) {
  console.log("done "+x);
  x++;
  if(x <= image_sets.length)doThing();
});
}


doThing();
