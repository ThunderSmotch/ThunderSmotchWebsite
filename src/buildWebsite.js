const fs = require("fs");
const path = require("path");

const config = require("./config");
const templates = require("./templates");
const parser = require("./webtexParser");
const { dir } = require("console");

//////////////////////Building the Website//////////////////////////////
makeOutputFolder();
moveFilesFrom('js');
moveFilesFrom('style');
//Get all notes directories
const subjects = getNotesSubjects();
templates.buildNavbar(subjects);
//Build Specific Pages
buildIndexHTML();
buildAboutHTML();
build404HTML();

//MAYBE Make this code work for any depth of folders.
//Loop over topics
for(let subject in subjects){
    //MAYBE make a subject page with navigation towards the several topics
    //TODO back and next links on pages
    subjects[subject].forEach(topic => {
        makeTopicDirectory(subject, topic);
        let dirpath = `notes/${subject}/${topic}`;
        let pages = getTopicPages(subject, topic);
        
        let metadata = getMetadata(dirpath);

        let pageNames = getPageNames(pages, dirpath);

        let sidebar = templates.buildSidebar(pages, dirpath, pageNames); //TODO Change this to use some metadata

        //Parse topic files
        parseFiles(dirpath, metadata, sidebar);
        createTopicIndexPage(subject, topic, sidebar);

        pages.forEach(page => {
            //Parse each page files
            let dir = dirpath + '/' + page;
            let meta = getMetadata(dir);
            parseFiles(dir, meta, sidebar);
        });
    });
}

////////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////

//Builds the main page of the website
function buildIndexHTML() {
    var indexhtml = templates.buildIndexHTML();
    fs.writeFile(config.dev.outdir + "/index.html", indexhtml, function (err) {
        if (err)
            console.log(err);
    });
}

//Builds the about page of the website
function buildAboutHTML() {
    var abouthtml = templates.buildAboutHTML();
    ensureDirectoryExists(config.dev.outdir + '/about/index.html')
    fs.writeFile(config.dev.outdir + "/about/index.html", abouthtml, function (err) {
        if (err)
            console.log(err);
    });
}

//Builds the 404 page of the website
function build404HTML() {
    var html = templates.build404HTML();
    fs.writeFile(config.dev.outdir + "/404.html", html, function (err) {
        if (err)
            console.log(err);
    });
}

//Returns list of subjects (directories of the notes folder) and their topics (subdirectories therein)
function getNotesSubjects(){
    let test = fs.readdirSync(config.dev.notesdir);
    let subjects = {};
    test.forEach(subject => {
        subjects[subject] = fs.readdirSync(config.dev.notesdir + '/' + subject);
    });
    return subjects;
}

//Returns array with topic pages (ordered if possible)
function getTopicPages(subject, topic) {
    let spath = config.dev.notesdir + '/' + subject + '/' + topic;
    let pages = getSubDirs(spath);

    //Ordering is data.json exists
    if(fs.existsSync('./' + spath + '/data.json')){
        let data = require('../' + spath + '/data.json');
        pages = orderPages(pages, data['files']);
    } 

    return pages;
}

//Check relative path to see if an index file exists
//HACK only working for HTML and Webtex (should generalize this)
function indexFileExists(spath) {
    return fs.existsSync('./' + spath + '/index.html') || fs.existsSync('./' + spath + '/index.webtex');
}

//Check inside this dir for metadata
function getMetadata(dir){
    let metadata;
    if(fs.existsSync(dir + '/data.json')){
        metadata = require('../' + dir + '/data.json');
        metadata["url"] = "https://thundersmotch.com/" + dir;
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
    let res = getFiles(dir);

    //Ignore data.json files
    res = res.filter(name => {return name != 'data.json';});

    for (let i = 0; i < res.length; i++) {

        var ext = path.extname(res[i]);
        var filepath = dir + '/' + res[i];

        if (ext == '.webtex') {
            var content = fs.readFileSync(filepath, 'utf8');
            var data = parser.parseWebtex(content);
            var outpath = config.dev.outdir + '/' + dir + '/index.html';
            ensureDirectoryExists(outpath);
            fs.writeFileSync(outpath, templates.buildHTMLWithComments(data, metadata, sidebar));
        }
        else if (ext == '.html') {
            var content = fs.readFileSync(filepath, 'utf8');
            var outpath = config.dev.outdir + '/' + dir + '/index.html';
            ensureDirectoryExists(outpath);
            fs.writeFileSync(outpath, templates.buildHTMLWithComments(content, metadata, sidebar));
        }
        else if (ext == '.js' || ext == '.png' || ext == '.jpg'){
            let outpath = config.dev.outdir + '/' + filepath;
            ensureDirectoryExists(outpath);
            fs.copyFileSync(filepath, outpath);
        }
        else {
            console.log("File not handled: " + filepath);
        }
    }
}

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

//Read config and create folder where website will be built into
function makeOutputFolder() {
    fs.mkdirSync(config.dev.outdir, { recursive: true }, (err) => {if (err) throw err; });
}

//Makes the directory structure for a given topic under a given subject
function makeTopicDirectory(subject, topic){
    let fpath = 'notes/' + subject + '/' + topic;
    if(fs.statSync('./'+fpath).isDirectory() == false) return false;
    fs.mkdirSync(config.dev.outdir+'/'+fpath, { recursive: true }, (err) => {if (err) throw err;});
}

//Creates a index page for each subject if it does not exist
function createTopicIndexPage(subject, topic, sidebar){
    let spath = 'notes/' + subject + '/' + topic;
    
    //If index page already exists then cancel this
    if(indexFileExists(spath)){
        return;
    }

    //If there is no index page we make one
    let html='No index page was provided. This is a default index page.';

    fs.writeFileSync(config.dev.outdir+"/"+spath+"/index.html", templates.buildSubjectHTML(topic, sidebar, html), err =>{
        if(err){console.log(err)};
    })
}

//Orders pages according to json if available
function orderPages(pages, data){
    let result = [];

    data.forEach(page => {
        if(pages.includes(page))
            result.push(page);
    });

    return result;
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
function ensureDirectoryExists(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    fs.mkdirSync(dirname, {recursive: true});
  }