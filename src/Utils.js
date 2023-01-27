module.exports = {RemoveOrderingPrefix, 
    GetFilesInsideDir, 
    GetMainFileInsideDir, 
    SplitStringUppercase, 
    GetSubDirs, 
    CatDirs,
    MakeDirectory,
    GetAllFilesRecursively,
    MoveFolderFromTo,
    MoveFolderToOutput,
    GetPageURL}

const fs = require("fs");
const path = require("path");

const config = require("./config");
const { ok } = require("assert");

// Returns a page's URL from the given directory name
function GetPageURL(dir){
    let url = RemoveOrderingPrefix(dir);
    return url == '' ? config.dev.url : config.dev.url + url + '/';
}

// Removes ordering prefix used in some directories
// Example 01.Mathematics -> Mathematics
function RemoveOrderingPrefix(string){
    return string.replace(/[0-9]+\./g, '');
}

//Get Files inside this Dir
function GetFilesInsideDir(dir){
    return fs.readdirSync(dir, {withFileTypes: true}).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
}

// Returns the name of the main file inside dir or null if it does not exist
function GetMainFileInsideDir(dir){
    let main_files = GetFilesInsideDir(dir).filter(file => { 
        let ext = path.extname(file);
        return config.dev.mainexts.includes(ext);
    });

    if(main_files.length == 0) return null;

    ok(main_files.length == 1, "More than one main file detected inside directory: " + dir);

    return main_files[0];
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

//Get Dirs inside this Dir
function GetSubDirs(dir){
    return fs.readdirSync(dir, {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name).sort();
}

// Concatenates dir1 to dir2
function CatDirs(dir1, dir2)
{
    ok(dir1 != '' || dir2 != '', "Both dirs are empty strings!")
    
    if(dir1 == '')
    {
        return dir2;
    } 
    else if(dir2 == '')
    {
        return dir1;
    }
    else
    {
        return dir1 + '/' + dir2;
    }
}

function MakeDirectory(dpath) {
    var dirname = path.dirname(dpath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    fs.mkdirSync(dirname, {recursive: true});
    return true;
}

// Recursive File Search Function
// Returns list of all files inside dir (across all depth levels)
function GetAllFilesRecursively(dir) {
    let results = [];
    let list = fs.readdirSync(dir);

    list.forEach(file => {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            /* Recursevely search into subdirectory */
            results = results.concat(GetAllFilesRecursively(file));
        } else { 
            /* It is a file */
            results.push(file);
        }
    });

    return results;
}


function MoveFolderToOutput(folder_name)
{
    MoveFolderFromTo(folder_name, CatDirs(config.dev.outdir, folder_name));
}

//Moves files from input folder to output folder
function MoveFolderFromTo(input, output) {

    if(!fs.existsSync(input)) {
        console.log("Folder '" + input + "' does not exist! Cannot move it to output directory.");
        return;
    }

    //Create new folder inside output dir
    fs.mkdirSync(config.dev.outdir + '/'+ output +'/', { recursive: true }, (err) => {
        if (err)
            throw err;
    });

    //Move files to newly created folder
    let files =  GetAllFilesRecursively("./" + input);
    files.forEach(function (file) {
        fs.copyFile(file, config.dev.outdir + '/'+ output +'/' + path.basename(file), (err) => {
            if (err)
                throw err;
        });
    });
}