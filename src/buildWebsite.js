module.exports = {parseDirText, SplitStringUppercase};
const fs = require("fs");
const fm = require("front-matter");
const path = require("path");

const config = require("./config");
const templates = require("./templates");
const parser = require("./webtexParser");
const sitemap = require("./sitemapBuilder");

//////////////// T O D O S ////////////////

//TODO someway of navigating between h2 h3 h4 headers on a page

//MAYBE Implement last modified on sitemap

//MAYBE some sort of bidirectional links (WIP)

//MAYBE Anki flashcards repositoriums for each file

//MAYBE make a subject page with navigation towards the several topics

//////////////////////Building the Website//////////////////////////////
ensureDirectoryExists(config.dev.outdir);
moveFilesFrom('js');
moveFilesFrom('style');
//Gets the page tree for the website
let pageTree = getPageTree();
templates.buildNavbar(pageTree);
sitemap.startSitemap();
//Build 404 page
build404Page();

parseDirectory(pageTree, '');

fs.writeFileSync(config.dev.outdir + '/sitemap.xml', sitemap.endSitemap());
////////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////

//Moves files from global input folder to output folder inside the output directory
function moveFiles(input, output) {

    if(!fs.existsSync(input)) return;

    //Create new folder inside output dir
    fs.mkdirSync(config.dev.outdir + '/'+ output +'/', { recursive: true }, (err) => {
        if (err)
            throw err;
    });

    //Move files to newly created folder
    let files = walk("./" + input);
    files.forEach(function (file) {
        fs.copyFile(file, config.dev.outdir + '/'+ output +'/' + path.basename(file), (err) => {
            if (err)
                throw err;
        });
    });
}

//Moves files from global folder to a folder inside the output directory
function moveFilesFrom(folder) {
    moveFiles(folder, folder);
}

//Returns a json object with the tree of all dirs and subdirs
//Also returns the pageName and if they should show on a sidebar or not
function getPageTree(dir=''){
    let fpath = dir == '' ? config.dev.filesdir : config.dev.filesdir + '/' + dir;
    
    let data = {
        metadata: {},
        pages: {}
    };
    
    //Try to find metadata for this page and save it on pageTree
    //MAYBE change this to just save sidebar flag
    dirname = parseDirText(dir.split('/').pop());
    data.metadata = getPageTreeMetadata(getMetadata(dir), dirname);

    //Find subdirs and store them on subpages property
    let subDirs = getSubDirs(fpath).sort();
    if(subDirs.length == 0) return data;

    subDirs.forEach( subDir => {
        let subDirPath = dir == '' ? subDir : dir + '/' + subDir;
        data.pages[subDir] = {};
        let page = getPageTree(subDirPath);
        if(page != null)
            data.pages[subDir] = page;
    });

    //if (dir == '') console.log(data.pages['Notes']);

    return data;
}

//Remove ordering text
function parseDirText(dir){
    return dir.replace(/[0-9]+\./g, '');
}

//Creates and parses this directory
//URL has no slash at the end
function parseDirectory(pageTree, dir='', parentSidebar = ''){

    //Make directory on output dir
    makeDirectory(dir);
    
    //Build sidebar
    let sidebar = parentSidebar;
    if(pageTree.metadata.sidebar == true){
        sidebar = templates.buildSidebar(pageTree.pages, parseDirText(dir));
    }

    //Convert files
    parseFiles(dir, sidebar);

    for(let page in pageTree.pages){
        let newDir = dir == '' ? page : dir + '/' + page;
        parseDirectory(pageTree.pages[page], newDir, sidebar);
    }
}

//Makes the directory structure for a given topic under a given subject
function makeDirectory(dir){
    //Check that it is a valid directory
    if(fs.statSync('./' + config.dev.filesdir + '/' + dir).isDirectory() == false) {
        console.log("GIVEN DIR IS NOT A DIRECTORY: " + dir);
        return false;
    }
    //If it is, create a new dir
    fs.mkdirSync(config.dev.outdir+'/'+parseDirText(dir), { recursive: true }, (err) => {if (err) throw err;});
}

//Check inside this dir for a file with metadata and return it
function getMetadata(dir){

    //Find webtex/html file and use that for the metadata
    let metadata;

    let dirpath = config.dev.filesdir + '/' + dir;

    let files = getFiles(dirpath).filter(file => { 
        let ext = path.extname(file);
        return ext == ".webtex" || ext == ".html";
    });

    if(files.length == 0){
        //console.log("NO METADATA FOUND ON: " + dirpath)
        metadata = {
            "title": "Default Title",
            "description": "I should've written a description for this...",
            "sidebar": false
        };
    }
    else {
        let fpath = dirpath + '/' + files[0];
        metadata = fm(fs.readFileSync(fpath, 'utf8')).attributes;
    }

    return metadata;
}

//Extract only relevant metadata flags for pageTree
function getPageTreeMetadata(metadata, dirname){
    
    //Default values
    let data = {
        title: "ThunderSmotch's Scribbles",
        sidebar: false,
    };

    //Read title prop
    if(metadata.hasOwnProperty('title')){
        data.title = metadata.title;

        if(data.title == 'Default Title')
            data.title = SplitStringUppercase(dirname);
    }

    //Read sidebar flag
    if(metadata.hasOwnProperty('sidebar')){
        data.sidebar = metadata.sidebar;
    }

    //Read hidden flag
    if(metadata.hasOwnProperty('hidden')){
        data.hidden = metadata.hidden;
    }

    return data;
}

//Check and parse all files inside given dir
function parseFiles(dir, sidebar) {
    let url = parseDirText(dir);
    let res = getFiles(config.dev.filesdir + '/' + dir);

    //Check if the output path exists
    let outpath = url == '' ? config.dev.outdir : config.dev.outdir + '/' + url;
    ensureDirectoryExists(outpath);
    
    res.forEach(file => parseFile(file, dir, outpath, sidebar));
}

//Parses a single file according to its extension
function parseFile(name, dir, outpath, sidebar) {

    let ext = path.extname(name);
    let filepath = dir == '' ? config.dev.filesdir + '/' + name : config.dev.filesdir + '/' + dir + '/' + name;

    if (ext == '.webtex') {
        let content = fm(fs.readFileSync(filepath, 'utf8'));
        let data = parser.parseWebtex(content.body);

        fs.writeFileSync(outpath + '/index.html', templates.buildHTML(data, content.attributes, sidebar));
        
        sitemap.addURL(getPageURL(dir)); //Helps building the sitemap
    }
    else if (ext == '.html') {
        var content = fm(fs.readFileSync(filepath, 'utf8'));
        fs.writeFileSync(outpath + '/index.html', templates.buildHTML(content.body, content.attributes, sidebar));
        
        sitemap.addURL(getPageURL(dir)); //Helps building the sitemap
    }
    else if (ext == '.js' || ext == '.png' || ext == '.jpg') {
        fs.copyFileSync(filepath, outpath + '/' + name);
    }
    else {
        console.log("File not handled: " + filepath);
    }
}

//Builds the 404 (page not found) default page
function build404Page(){
    ensureDirectoryExists(config.dev.outdir);
    fs.writeFileSync(config.dev.outdir + '/404.html', templates.build404HTML());
}

//Recursive File Search Function
//Returns list of all files inside dir (across all depth levels)
function walk(dir) {
    let results = [];
    let list = fs.readdirSync(dir);

    list.forEach(file => {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            /* Recursevely search into subdirectory */
            results = results.concat(walk(file));
        } else { 
            /* It is a file */
            results.push(file);
        }
    });

    return results;
}

//Get Dirs inside this Dir
function getSubDirs(dir){
    return fs.readdirSync(dir, {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
}

//Get Files inside this Dir
function getFiles(dir){
    return fs.readdirSync(dir, {withFileTypes: true}).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
}

//Split string on uppercase letters and return with spaces
function SplitStringUppercase(str){
    let res = str.match(/[A-Z][a-z]+|[0-9]+/g);
    try{
        return res.join(" ");
    } 
    catch{
        return str;
    }
}

function getPageURL(dir){
    let url = parseDirText(dir);
    return url == '' ? "https://thundersmotch.com/" : "https://thundersmotch.com/" + url + '/';
}

//Ensures Directory Exists
//TODO ensure subdirectories exist
function ensureDirectoryExists(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    fs.mkdirSync(dirname, {recursive: true});
  }