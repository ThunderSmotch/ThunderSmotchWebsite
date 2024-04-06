module.exports = {ParseDirectory};

const fs = require("fs");
const path = require("path");
const fm = require("front-matter");

const config = require("./config");
const Utils = require("./Utils");
const PagesBuilder = require("./PagesBuilder");
const WebtexParser = require("./WebtexParser");
const TemplatesVars = require("./TemplatesVars");

function ParseDirectory(pageTree, dir=''){
    //Make same directory on output dir
    Utils.MakeDirectory(Utils.CatDirs(config.dev.outdir, Utils.RemoveOrderingPrefix(dir)));
    
    //FIXME Local File Variables should not be made here
    // MAYBE move this to the BuildPageAndVars function by providing the pageTree there
    // Build sidebar if sidebar metadata is true
    if(pageTree.metadata.sidebar == true){
        TemplatesVars.BuildSidebar(pageTree.pages, Utils.RemoveOrderingPrefix(dir));
    }
    if(pageTree.metadata.type == 'list')
    {
        TemplatesVars.BuildList(pageTree.pages);
    }

    //Convert files
    ParseFiles(dir);

    // Recurse into subdirectories
    for(let page in pageTree.pages){
        let new_dir = Utils.CatDirs(dir, page);
        ParseDirectory(pageTree.pages[page], new_dir);
    }
}

//Check and parse all files inside given dir
function ParseFiles(dir) {
    let url = Utils.RemoveOrderingPrefix(dir);
    let res = Utils.GetFilesInsideDir(Utils.CatDirs(config.dev.filesdir, dir));

    //Check if the output path exists
    let outpath = Utils.CatDirs(config.dev.outdir, url);
    Utils.MakeDirectory(outpath);
    
    res.forEach(file => ParseFile(file, dir, outpath));
}

//Parses a single file according to its extension
function ParseFile(name, dir, outpath) {
    let ext = path.extname(name);

    let filepath = Utils.CatDirs(config.dev.filesdir, dir) + '/' + name;

    if(config.dev.mainexts.includes(ext)) // It's a main file!
    {
        let content = fm(fs.readFileSync(filepath, 'utf8'));
        ParseMainFile(ext, content, Utils.GetPageURL(dir), outpath);
    }
    else if (ext == '.js' || ext == '.png' || ext == '.jpg') { // Copy the file to the folder
        fs.copyFileSync(filepath, outpath + '/' + name);
    }
    else { // If unknown, do nothing to it!
        console.log("File not handled: " + filepath);
    }
}

function ParseMainFile(type, content, url, outpath)
{    
    let data = content.body;
    if(type == ".webtex")
    {
        data = WebtexParser.Parse(data);
    }

    let metadata = content.attributes;
    metadata.url = url;

    PagesBuilder.BuildPage(outpath, data, metadata);
}