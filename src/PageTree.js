module.exports = {GetPageTree};

const config = require("./config");

const Utils = require("./Utils");
const Metadata = require("./Metadata");


// Recursive method to build a tree of all the available pages on the website together with their relevant metadata.
function GetPageTree(dir=''){
    let fpath = Utils.CatDirs(config.dev.filesdir, dir);
    
    let data = {
        metadata: {},
        pages: {}
    };
    
    pretty_name = Utils.RemoveOrderingPrefix(dir.split('/').pop());
    
    data.metadata = Metadata.GetMetadata(dir);

    //Find subdirs and store them on pages property
    let subDirs = Utils.GetSubDirs(fpath);

    if(subDirs.length == 0) return data;

    subDirs.forEach( subDir => {
        let subDirPath = Utils.CatDirs(dir, subDir);
        data.pages[subDir] = {};
        let page = GetPageTree(subDirPath);
        data.pages[subDir] = page;
    });

    return data;
}