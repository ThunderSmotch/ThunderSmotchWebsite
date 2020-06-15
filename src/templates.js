module.exports = {buildIndexHTML, buildNavbar, buildHTML, buildSubjectHTML, buildSidebar}
const path = require("path");

//Navbar HTML to be set during build
let navbarHTML = '';
//Head HTML appended to all pages
let headHTML = `
<title>ThunderSmotch</title>

<link rel="shortcut icon" href="/style/favicon.ico"/>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

<script src="https://raw.githack.com/ThunderSmotch/WebTex/master/webtexParser.js"></script>

<script src="/js/mathjaxConfig.js"></script>
<script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>	

<link rel="stylesheet" type="text/css" href="/style/style.css">
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
`;

//Builds any page by inserting the head and the content
function buildHTML(content, sidebar=''){
    return `
<!DOCTYPE html>
<html>
<head>
    ${headHTML}
</head>

<body>
<div class="navbar">${navbarHTML}</div>
<div id="main">
    <div id="sidebar">${sidebar}</div>
    <div class="content">
    ${content}
    </div>
</div>

<div class="footer">
  <p>Made by <a href="https://github.com/ThunderSmotch">ThunderSmotch</a> | 2020 |</p>
</div>

</body>
</html>
    `;
}

//Main page for the Website
function buildIndexHTML(){

var content = `
<h1>ThunderSmotch's Scribbles</h1>
</br>
This website archives some of my notes regarding Maths and Physics and other stuff!
</br>
Feel free to share them! :))
</br>
</br>
<div id='main'>\\(Latex\\quad is\\quad cool...\\)</div>
`;

    return buildHTML(content);
}

//Build HTML index page
function buildSubjectHTML(subject, sidebar, html){

    let content = `
    <h3>${subject}</h3>
    ${html}
    `
    return buildHTML(content, sidebar);
};

//Builds sidebar from a list of pages
function buildSidebar(pages){
    let listitems = '';

    pages.forEach(page => {
        //Capitalize Name
        let name = page.split('.')[0];
        name = name.charAt(0).toUpperCase() + name.substring(1);
        //Add to list
        listitems += `<a href="./${page}">${name}</a></br>`
    });

    let sidebar = `
    <div class='sidebar'>
    <div class='sidebarTitle'>Navigation</div>
    ${listitems}
    </div>`;

    return sidebar;
}

//Builds the HTML for the navbar and sets it to the global constant
function buildNavbar(subjects){

    let subjectsHTML = '';
    for(let subject in subjects){
        subjectsHTML+=`
        <div class="column">
        <h4>${subject}</h4>
        ${getTopicButtons(subjects[subject], subject)}
        </div>
        `;
    }

    navbarHTML = `
    <a href="/index.html">Home</a>
    <a href="/about.html">About</a>
    <div id="notes" class="dropdown">
        <button class="dropbtn">Notes<i class="fa fa-caret-down"></i></button>
        <div class="dropdown-content">
        <div class="row">
        ${subjectsHTML}
        </div>
        </div>
    </div>    
`;
}

//Returns HTML for a given topic inside a subject
function getTopicButtons(array, subfolder){
    var html = '';
    if(array){
        array.forEach(folder => {
            html += `<a href="/notes/${subfolder}/${folder}/">${folder}</a>\n`;
        });
    }
    return html;
}