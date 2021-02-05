module.exports = {getMetadata, parseDirText};
const fs = require("fs");
const path = require("path");

const config = require("./config");
const templates = require("./templates");
const parser = require("./webtexParser");
const sitemap = require("./sitemapBuilder");

//////////////// T O D O S ////////////////

//MAYBE make a subject page with navigation towards the several topics

//MAYBE change the looks/text of the nav buttons

//TODO Build sitemap.xml (USE THE PAGE TREE FOR THIS)

//TODO someway of navigating between h2 h3 h4 headers on a page

//TODO some sort of bidirectional links (WIP)

//MAYBE Anki flashcards repositoriums for each file

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
function getPageTree(dir=''){
    let fpath = dir == '' ? config.dev.filesdir : config.dev.filesdir + '/' + dir;
    let subDirs = getSubDirs(fpath).sort();
    if(subDirs.length == 0) return null;

    let data = {};

    subDirs.forEach( subDir => {
        let subDirPath = dir + '/' + subDir;
        data[subDir] = {};
        let page = getPageTree(subDirPath);
        if(page != null)
            data[subDir] = page;
    });

    return data;
}

//Remove ordering text
function parseDirText(dir){
    return dir.replace(/[0-9]+\./g, '');
}

//Creates and parses this directory
//URL has no slash at the end
function parseDirectory(pageTree, dir='', parentSidebar = ''){

    makeDirectory(dir);

    //Build sidebar (maybe move this to the file parser)
    let subpages = getSubPages(pageTree); //Can be empty
    let metadata = getMetadata(dir);

    //Sidebar logic
    // True means it's the parent page
    //HACK this is so fucking stupid but it works...
    let sidebar = parentSidebar;
    if(metadata.sidebar == true){
        sidebar = templates.buildSidebar(subpages, parseDirText(dir), getPageNames(subpages, dir));
    }

    //Convert files
    parseFiles(dir, metadata, sidebar);

    for(let page in pageTree){
        let newDir = dir == '' ? page : dir + '/' + page;
        parseDirectory(pageTree[page], newDir, sidebar);
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

//Returns array with subpages
function getSubPages(pages) {

    let array = [];

    for(let page in pages)
        array.push(page);

    return array;
}

//Check inside this dir for metadata
function getMetadata(dir){
    let metadata;
    let url = parseDirText(dir);

    let fpath = config.dev.filesdir + '/' + dir + '/data.json';
    if(fs.existsSync(fpath)){
        metadata = require('../' + fpath);
        metadata["url"] = url == '' ? "https://thundersmotch.com/" : "https://thundersmotch.com/" + url + '/';
    } else{
        metadata = {
            "title": "Default Title",
            "description": "I should've written a description for this...",
            "url": "https://thundersmotch.com"
        };
    }
    return metadata;
}

//Check inside subdirs for the title of each subpage and returns an array of them
function getPageNames(pages, dir){
    let pageNames = [];

    pages.forEach(page => {
        let metadata = getMetadata(dir + '/' + page);
        pageNames.push(metadata.title);
    });

    return pageNames;
}

//Check and parse all files inside given dir
function parseFiles(dir, metadata, sidebar) {

    let url = parseDirText(dir);
    let res = getFiles(config.dev.filesdir + '/' + dir);

    //Check if the output path exists
    let outpath = url == '' ? config.dev.outdir : config.dev.outdir + '/' + url;
    ensureDirectoryExists(outpath);

    //Ignore data.json files
    res = res.filter(name => {return name != 'data.json';});
    
    res.forEach(file => parseFile(file, dir, outpath, metadata, sidebar))
}

//Parses a single file
function parseFile(name, dir, outpath, metadata, sidebar) {
    let ext = path.extname(name);
    let filepath = dir == '' ? config.dev.filesdir + '/' + name : config.dev.filesdir + '/' + dir + '/' + name;

    if (ext == '.webtex') {
        let content = fs.readFileSync(filepath, 'utf8');
        let data = parser.parseWebtex(content);
        fs.writeFileSync(outpath + '/index.html', templates.buildHTML(data, metadata, sidebar));
        sitemap.addURL(metadata.url); //Helps building the sitemap
    }
    else if (ext == '.html') {
        var content = fs.readFileSync(filepath, 'utf8');
        fs.writeFileSync(outpath + '/index.html', templates.buildHTML(content, metadata, sidebar));
        sitemap.addURL(metadata.url); //Helps building the sitemap
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

//Ensures Directory Exists
//TODO ensure subdirectories exist
function ensureDirectoryExists(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    fs.mkdirSync(dirname, {recursive: true});
  }