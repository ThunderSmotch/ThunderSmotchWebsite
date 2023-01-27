module.exports = {ParseDirectory};

const fs = require("fs");
const path = require("path");
const fm = require("front-matter");

const templates = require("./templates"); // TODO look at this require
const config = require("./config");
const Utils = require("./Utils");
const Sitemap = require("./SitemapBuilder");

const WebtexParser = require("./WebtexParser");

function ParseDirectory(pageTree, dir='', parentSidebar = ''){

    //Make directory on output dir
    makeDirectory(dir);
    
    //Build sidebar
    let sidebar = parentSidebar;
    if(pageTree.metadata.sidebar == true){
        sidebar = templates.buildSidebar(pageTree.pages, Utils.RemoveOrderingPrefix(dir));
    }

    //Convert files
    ParseFiles(dir, sidebar);

    for(let page in pageTree.pages){
        let newDir = dir == '' ? page : dir + '/' + page;
        ParseDirectory(pageTree.pages[page], newDir, sidebar);
    }
}

//Check and parse all files inside given dir
function ParseFiles(dir, sidebar) {
    let url = Utils.RemoveOrderingPrefix(dir);
    let res = Utils.GetFilesInsideDir(Utils.CatDirs(config.dev.filesdir, dir));

    //Check if the output path exists
    let outpath = Utils.CatDirs(config.dev.outdir, url);
    Utils.MakeDirectory(outpath);
    
    res.forEach(file => parseFile(file, dir, outpath, sidebar));
}

//Makes the directory structure for a given topic under a given subject
function makeDirectory(dir){
    //Check that it is a valid directory
    if(fs.statSync('./' + config.dev.filesdir + '/' + dir).isDirectory() == false) {
        console.log("GIVEN DIR IS NOT A DIRECTORY: " + dir);
        return false;
    }
    //If it is, create a new dir
    fs.mkdirSync(config.dev.outdir+'/'+ Utils.RemoveOrderingPrefix(dir), { recursive: true }, (err) => {if (err) throw err;});
}

//Parses a single file according to its extension
function parseFile(name, dir, outpath, sidebar) {

    let ext = path.extname(name);
    let filepath = dir == '' ? config.dev.filesdir + '/' + name : config.dev.filesdir + '/' + dir + '/' + name;

    if (ext == '.webtex') {
        let content = fm(fs.readFileSync(filepath, 'utf8'));
        let data = WebtexParser.Parse(content.body);

        let metadata = content.attributes;
        metadata.url = Utils.GetPageURL(dir);

        fs.writeFileSync(outpath + '/index.html', templates.buildHTML(data, metadata, sidebar));
        
        Sitemap.AddURL(Utils.GetPageURL(dir)); //Helps building the sitemap
    }
    else if (ext == '.html') {
        var content = fm(fs.readFileSync(filepath, 'utf8'));

        let metadata = content.attributes;
        metadata.url = Utils.GetPageURL(dir);

        fs.writeFileSync(outpath + '/index.html', templates.buildHTML(content.body, metadata, sidebar));
        
        Sitemap.AddURL(Utils.GetPageURL(dir)); //Helps building the sitemap
    }
    else if (ext == '.js' || ext == '.png' || ext == '.jpg') {
        fs.copyFileSync(filepath, outpath + '/' + name);
    }
    else {
        console.log("File not handled: " + filepath);
    }
}