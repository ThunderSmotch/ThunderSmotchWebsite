const fs = require("fs");
const path = require("path");
const config = require("./config");

const templates = require("./templates")

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

//Copy stylesheets
var cssfiles = walk("./style");
cssfiles.forEach(function(file) {
    fs.copyFile(file, config.dev.outdir+'/' + path.basename(file), (err) => {
        if (err) throw err;
    })
})

//Build navbar

const physics = fs.readdirSync(config.dev.notesdir + "/Physics/")
const maths = fs.readdirSync(config.dev.notesdir + "/Mathematics/")
const other = fs.readdirSync(config.dev.notesdir + "/Other/")

const navbar = templates.buildNavbar(physics, maths, other);

//Build index.html
var indexhtml = templates.buildIndexHTML(navbar);
fs.writeFile(config.dev.outdir+"/index.html", indexhtml, function(err){
    if(err) console.log(err);
});

//Build subject page
createSubjectPages(physics, "Physics");
createSubjectPages(maths, "Mathematics");
createSubjectPages(other, "Other");


var res = walk("./notes");

for(var i = 0; i < res.length; i++){
    res[i] = res[i].replace(/(\.\/notes\/Physics\/|\.\/notes\/Other\/|\.\/notes\/Mathematics\/)/g, '')
}

console.log(res)

async function createSubjectPages(array, folder){
    if(array){
        array.forEach(subject => {

            if(fs.statSync('./notes/'+folder+'/'+subject).isDirectory() == false) return false;
            fs.mkdirSync(config.dev.outdir+'/notes/'+subject, { recursive: true }, (err) => {
                if (err) throw err;
            });

            fs.writeFileSync(config.dev.outdir+"/notes/"+subject+"/index.html", templates.buildSubjectHTML(navbar, subject), (err)=>{
                if(err){console.log(err)};
            })
        });
    }
}