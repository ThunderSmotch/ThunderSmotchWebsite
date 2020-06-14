module.exports = {headHTML, buildIndexHTML, buildNavbar, buildHTML, buildSubjectHTML}

const path = require("path");

//Navbar HTML to be set during build
var navbarHTML = '';

var headHTML = `
<title>ThunderSmotch</title>

<link rel="shortcut icon" href="/style/favicon.ico"/>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

<script src="https://raw.githack.com/ThunderSmotch/WebTex/master/webtexParser.js"></script>

<script src="/js/mathjaxConfig.js"></script>
<script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>	

<link rel="stylesheet" type="text/css" href="/style/style.css">
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
`;

function buildHTML(content){
    return `
<!DOCTYPE html>
<html>
<head>
    ${headHTML}
</head>

<body>
<div class="navbar">${navbarHTML}</div>
<div class="content">
${content}
</div>

<div class="footer">
  <p>Made by <a href="https://github.com/ThunderSmotch">ThunderSmotch</a> | 2020 |</p>
</div>

</body>
</html>
    `;
}

function buildIndexHTML(){

var content = `
<h1>ThunderSmotch's Scribbles</h1>
</br>
This website archives some of my notes regarding Maths and Physics and other stuff!
</br>
Feel free to share them! :))
</br>
<div id='main'>\\(E = mc^2\\)</div>
`;

    return buildHTML(content);
}

function buildSubjectHTML(subject, pages){

    var listitems = '';

    pages.forEach(page => {
        listitems += `<li><a href="./${page}">${page}</a></li>`
    });

    var content = `
    <h3>${subject}</h3>

    <ul>
    ${listitems}
    </ul>
    `

    return buildHTML(content);
};

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