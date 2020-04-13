const fs = require("fs");
const path = require("path");
const config = require("./config");

//Recursive File Search Function
//Returns 
var walk = function(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else { 
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}

//Make output folder
fs.mkdir(config.dev.outdir, { recursive: true }, (err) => {
    if (err) throw err;
});

//Copy Javascripts files
fs.mkdir(config.dev.outdir+'/js/', { recursive: true }, (err) => {
    if (err) throw err;
});

var jsfiles = walk("./js");
jsfiles.forEach(function(file) {
    fs.copyFile(file, config.dev.outdir+'/js/' + path.basename(file), (err) => {
        if (err) throw err;
    })
})

//Handle note files
var res = walk("./notes");
console.log(res)