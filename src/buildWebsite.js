const fs = require("fs");
const path = require("path");
const config = require("./config");

const templates = require("./templates");
const parser = require("./webtexParser");

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
fs.mkdirSync(config.dev.outdir, { recursive: true }, (err) => {
    if (err) throw err;
});

//Copy Javascripts files
fs.mkdirSync(config.dev.outdir+'/js/', { recursive: true }, (err) => {
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
const physics = fs.readdirSync(config.dev.notesdir + "/physics/")
const maths = fs.readdirSync(config.dev.notesdir + "/mathematics/")
const other = fs.readdirSync(config.dev.notesdir + "/other/")

const navbar = templates.buildNavbar(physics, maths, other);

//Build index.html
var indexhtml = templates.buildIndexHTML(navbar);
fs.writeFile(config.dev.outdir+"/index.html", indexhtml, function(err){
    if(err) console.log(err);
});

//Make directories for each subject
makeDirectoriesSubjects(physics, "physics");
makeDirectoriesSubjects(maths, "mathematics");
makeDirectoriesSubjects(other, "other");

var res = walk(config.dev.notesdir);
for(var i = 0; i < res.length; i++){

    var ext = path.extname(res[i]);
    var base = path.basename(res[i]);
    var filepath = res[i].substr(1).split('.')[0];

    if(ext == '.webtex'){
        var content = fs.readFileSync(res[i], 'utf8');
        var data = parser.parseWebtex(content);
        fs.writeFileSync(config.dev.outdir + filepath + '.html', templates.buildHTML(data, navbar));
    } else if(ext == '.html'){
        var content = fs.readFileSync(res[i], 'utf8');
        fs.writeFileSync(config.dev.outdir + filepath + '.html', templates.buildHTML(content, navbar));
    } else {
        console.log("File not handled: " + filepath + ext);
    }
}

//Build subject page
createSubjectPages(physics, "physics");
createSubjectPages(maths, "mathematics");
createSubjectPages(other, "other");


////////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////

function makeDirectoriesSubjects(array, folder){
    if(array){
        array.forEach(subject => {
            var fpath = 'notes/'+folder+'/'+subject;
            if(fs.statSync('./'+fpath).isDirectory() == false) return false;
            fs.mkdirSync(config.dev.outdir+'/'+fpath, { recursive: true }, (err) => {
                if (err) throw err;
            });
        });
    }
}

//Creates a index page for each subject
//TODO: add indexing :P
function createSubjectPages(array, folder){
    if(array){
        array.forEach(subject => {
            var spath = 'notes/' + folder + '/' + subject;

            var pages = walk(config.dev.outdir+'/'+spath).map(string => path.basename(string));

            if(fs.statSync('./'+spath).isDirectory() == false) return false;
            fs.writeFileSync(config.dev.outdir+"/"+spath+"/index.html", templates.buildSubjectHTML(subject, pages, navbar), (err)=>{
                if(err){console.log(err)};
            })
        });
    }
}