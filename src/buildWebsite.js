const fs = require("fs");
const path = require("path");

const config = require("./config");
const templates = require("./templates");
const parser = require("./webtexParser");

//TODO only generate page if it was updated recently
//////////////////////Building the Website//////////////////////////////
makeOutputFolder();
moveFilesFrom('js');
moveFilesFrom('style');
//Get all notes directories
const subjects = getNotesSubjects();
templates.buildNavbar(subjects);
buildIndexHTML();
buildAboutHTML();

//MAYBE Make this code work for any depth of folders.
//Loop over topics
for(let subject in subjects){
    subjects[subject].forEach(topic => {
        makeTopicDirectory(subject, topic);
        let pages = getTopicPages(subject, topic);
        let sidebar = templates.buildSidebar(pages);
        moveTopicFiles(subject, topic);
        parseTopicNotes(subject, topic, sidebar);
        createTopicIndexPage(subject, topic, sidebar);
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
    fs.writeFile(config.dev.outdir + "/about.html", abouthtml, function (err) {
        if (err)
            console.log(err);
    });
}

//Returns list of subjects (dirs of notes) and their topics (subdirs)
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
    let res = walk(spath).map(file => {
        return path.basename(file);
    });

    res.filter(file => {
       return path.extname(file).toLowerCase() === '.webtex' || path.extname(file).toLowerCase() === '.html';
    });

    //Remove extension names
    res = res.map(file => {
        return (file.split('.')[0] + '.html');
    });

    if(fs.existsSync('./' + spath + '/data.json')){
        let data = require('../' + spath + '/data.json');
        res = orderPages(res, data['files']);
    } else if(!indexFileExists(spath)){
        res.unshift('index.html');
    }

    return res;
}

//Check relative path to see if an index file exists
//HACK only working for HTML and Webtex (should generalize this)
function indexFileExists(spath) {
    return fs.existsSync('./' + spath + '/index.html') || fs.existsSync('./' + spath + '/index.webtex');
}

//Moves images and other files that do not need parsing
function moveTopicFiles(subject, topic){
    let ipath = 'notes' + '/' + subject + '/' + topic;
    let opath = '/notes' + '/' + subject + '/' + topic;

    //Implement moving
    moveFiles(ipath + '/img', opath + '/img');
}

//Check and parse all files relating to given subject
function parseTopicNotes(subject, topic, sidebar) {
    let spath = config.dev.notesdir + '/' + subject + '/' + topic;
    let res = walk(spath);
    for (let i = 0; i < res.length; i++) {

        var ext = path.extname(res[i]);
        var base = path.basename(res[i]);
        var filepath = res[i].substr(1).split('.')[0];

        if (ext == '.webtex') {
            var content = fs.readFileSync(res[i], 'utf8');
            var data = parser.parseWebtex(content);
            fs.writeFileSync(config.dev.outdir + filepath + '.html', templates.buildHTML(data, sidebar));
        }
        else if (ext == '.html') {
            var content = fs.readFileSync(res[i], 'utf8');
            fs.writeFileSync(config.dev.outdir + filepath + '.html', templates.buildHTML(content, sidebar));
        }
        else if (ext == '.png' || ext == '.jpg') {
            fs.copyFileSync(res[i], config.dev.outdir + filepath + ext);
        }
        else {
            console.log("File not handled: " + filepath + ext);
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
    fs.mkdirSync(config.dev.outdir, { recursive: true }, (err) => {
        if (err)
            throw err;
    });
}

//Makes the directory structure for a given topic under a given subject
function makeTopicDirectory(subject, topic){
    let fpath = 'notes/'+subject+'/'+topic;
    if(fs.statSync('./'+fpath).isDirectory() == false) return false;
    fs.mkdirSync(config.dev.outdir+'/'+fpath, { recursive: true }, (err) => {
        if (err) throw err;
    });
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
        if(pages.includes(page + '.html'))
            result.push(page + '.html');
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