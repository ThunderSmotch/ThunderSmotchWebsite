const fs = require("fs");
const path = require("path");
const config = require("./config");

const templates = require("./templates");
const parser = require("./webtexParser");
const { buildSubjectHTML } = require("./templates");

//////////////////////Building the Website//////////////////////////////
makeOutputFolder();
moveFilesFrom('js');
moveFilesFrom('style');
//Get all notes directories
const subjects = getNotesSubjects();
templates.buildNavbar(subjects);
buildIndexHTML();

for(let subject in subjects){
    subjects[subject].forEach(topic => {
        makeTopicDirectory(subject, topic);
        let pages = getTopicPages(subject, topic);
        let sidebar = templates.buildSidebar(pages);
        createTopicIndexPage(subject, topic, sidebar);
        parseTopicNotes(subject, topic, sidebar);
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
    } else{
        res.unshift('index.html');
    }

    return res;
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
        else {
            console.log("File not handled: " + filepath + ext);
        }
    }
}

//Moves files from global folder to a folder inside the output directory
function moveFilesFrom(folder) {
    //Create new folder inside output dir
    fs.mkdirSync(config.dev.outdir + '/'+ folder +'/', { recursive: true }, (err) => {
        if (err)
            throw err;
    });

    //Move files to newly created folder
    let files = walk("./" + folder);
    files.forEach(function (file) {
        fs.copyFile(file, config.dev.outdir + '/'+ folder +'/' + path.basename(file), (err) => {
            if (err)
                throw err;
        });
    });
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

//Creates a index page for each subject
function createTopicIndexPage(subject, topic, sidebar){
    let spath = 'notes/' + subject + '/' + topic;
    let html='No available info.';
    
    //Grab info html from json if available
    if(fs.existsSync('./' + spath + '/data.json')){
        let data = require('../' + spath + '/data.json');
        html = data['info'];
    }

    fs.writeFileSync(config.dev.outdir+"/"+spath+"/index.html", templates.buildSubjectHTML(topic, sidebar, html), err =>{
        if(err){console.log(err)};
    })
}

//Orders pages according to json if available
function orderPages(pages, data){
    let result = [];
    result.push('index.html');

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