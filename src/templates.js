module.exports = {buildIndexHTML, buildNavbar, buildHTML, buildSubjectHTML, buildSidebar, buildAboutHTML, buildHTMLWithComments}
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

<link rel="stylesheet" type="text/css" href="/style/webtex.css">
<link rel="stylesheet" type="text/css" href="/style/style.css">
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-168636305-2"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-168636305-2');
</script>
`;

//Comment Section (powered by Hyvor Talk)
let commentSection = `
<div id="hyvor-talk-view"></div>
<script type="text/javascript">
    var HYVOR_TALK_WEBSITE = 1227; // DO NOT CHANGE THIS
    var HYVOR_TALK_CONFIG = {
        url: false,
        id: false
    };
</script>
<script async type="text/javascript" src="//talk.hyvor.com/web-api/embed"></script>
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

//Builds any page by inserting the head and the content and a comment section below
function buildHTMLWithComments(content, sidebar=''){
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
    <br>
    ${commentSection}
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
This website archives some of my notes regarding Maths and Physics and other stuff! Currently it still looks very barebones but I intend to add more content to it in the near future.
</br>
Feel free to share the site with friends! :)
</br>
</br>
<div id='main'>\\(Latex\\quad is\\quad cool...\\)</div>
`;

    return buildHTML(content);
}

//About page for the Website
function buildAboutHTML(){

    var content = `
    <h1>ThunderSmotch - Carlos Couto</h1>
    </br>
    Someone who loves physics, maths and computer science. Always procrastinating...
    </br>
    You can find me at:</br>
    <ul>
    <li>Email: thundersmotch@gmail.com</li>
    <li><a href='https://github.com/ThunderSmotch'>Github</a></li>
    </ul>
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
            html += `<a href="/notes/${subfolder}/${folder}/index.html">${folder}</a>\n`;
        });
    }
    return html;
}