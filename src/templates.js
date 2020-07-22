module.exports = {buildIndexHTML, buildNavbar, buildHTML, buildSubjectHTML, buildSidebar, buildAboutHTML, build404HTML, buildHTMLWithComments}
const path = require("path");
const { config } = require("process");

//Navbar HTML to be set during build
let navbarHTML = '';

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
function buildHTML(content, metadata, sidebar=''){
    
    let noSidebar = '';
    if(sidebar == '')
        noSidebar = 'nosidebar';
    
    
    return `
<!DOCTYPE html>
<html>
<head>
    ${getHead(metadata.title, metadata.description, metadata.url)}
</head>

<body>
<div class="navbar">${navbarHTML}</div>
<div id="main">
    <div id="sidebar">${sidebar}</div>
    <div class="content ${noSidebar}">
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
function buildHTMLWithComments(content, metadata, sidebar=''){
    
    let noSidebar = '';
    if(sidebar == '')
        noSidebar = 'nosidebar';
    
    return `
<!DOCTYPE html>
<html>
<head>
    ${getHead(metadata.title, metadata.description, metadata.url)}
</head>

<body>
<div class="navbar">${navbarHTML}</div>
<div id="main">
    <div id="sidebar">${sidebar}</div>
    <div class="content ${noSidebar}">
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
<div id='main' style='text-align: center'>\\(Latex\\ is\\ cool...\\quad You\\ should\\ learn\\ it! \\)</div>
`;

var metadata = {
    "title": "Home",
    "description": "Website connecting physics, maths and programming with the intent of having interactive topics.",
    "url": "https://thundersmotch.com"
}

    return buildHTML(content, metadata);
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

    var metadata = {
        "title": "About",
        "description": "About page for ThunderSmotch's Website.",
        "url": "https://thundersmotch.com/about"
    }
    
    return buildHTML(content, metadata);
}

//404 page for the Website
function build404HTML(){

    var content = `
    <h1>This page could not be found!</h1>
    </br>
    For problems or suggestions please enter in contact with thundersmotch@gmail.com.
    </br>
    Maybe this page was moved elsewhere. Check the navigation bar above to see if you can still find it!
    `;

    var metadata = {
        "title": "Page Not Found",
        "description": "That page could not be found.",
        "url": "https://thundersmotch.com/404.html"
    }
    
        return buildHTML(content, metadata);
    }

//Build HTML index page
function buildSubjectHTML(subject, sidebar, html){

    let content = `
    <h3>${subject}</h3>
    ${html}
    `;

    let metadata = {
        "title": subject,
        "description": "Main page for" + subject + ". Needs additional metadata.",
        "url": "https://thundersmotch.com"
    };

    return buildHTML(content, metadata, sidebar);
};

//Builds sidebar from a list of pages
function buildSidebar(pages, dirpath, pageNames){
    let listitems = '';

    listitems +=  `<a href="/${dirpath}/">Index</a></br>`;

    for(let i = 0; i < pages.length; i++){
        listitems += `<a href="/${dirpath}/${pages[i]}/">${pageNames[i]}</a></br>`
    }

    let sidebar = `
    <div class='sidebar'>
    <div class='sidebarTitle'>Navigation</div>
    ${listitems}
    </div>`;

    return sidebar;
}

//Builds the HTML for the navbar and sets it to the global constant
function buildNavbar(pageTree){

    let subjectsHTML = '';
    for(let subject in pageTree){
        subjectsHTML+=`
        <div class="column">
        <h4>${pageTree[subject].title}</h4>
        ${getTopicButtons(pageTree[subject].pages, subject)}
        </div>
        `;
    }

    navbarHTML = `
    <a href="/">Home</a>
    <a href="/about/">About</a>
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
function getTopicButtons(pages, folder){
    var html = '';
    if(Object.keys(pages).length !== 0){
        for(let page in pages){
            html += `<a href="/notes/${folder}/${page}/">${pages[page].title}</a>\n`
        }
    }
    return html;
}

//Returns the HTML for the head html tag
function getHead(title = 'Home', description = 'ThunderSmotch - Maths/Physics/Programming', url="https://thundersmotch.com"){
    title = title + ' | ThunderSmotch';

    return `    
    <!-- SEO STUFF -->
    <title>${title}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="description" content="${description}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="canonical" href="${url}/" />
    <!-- Open Graph data -->
    <meta property="og:title" content="${title}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}/" />
    <meta property="og:image" content="https://i.stack.imgur.com/59O8g.png" />
    <meta property="og:description" content="${description}" /> 
    <!-- END OF SEO STUFF -->

    <link rel="shortcut icon" href="/style/favicon.ico"/>
    
    <script src="/js/mathjaxConfig.js"></script>
    <script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
    <script src="https://www.geogebra.org/apps/deployggb.js"></script>
    
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
}