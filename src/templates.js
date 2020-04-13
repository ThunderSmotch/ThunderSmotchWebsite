const path = require("path");

var headHTML = `
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

<script src="https://raw.githack.com/ThunderSmotch/WebTex/master/webtexParser.js"></script>

<script src="/js/includeElements.js"></script>
<script src="/js/main.js"></script>
<script src="/js/mathjaxConfig.js"></script>

<script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>	

<link rel="stylesheet" type="text/css" href="/style.css">
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
`;

function buildHTML(content, navbar){
    return `
<!DOCTYPE html>
<html>
<head>
    ${headHTML}
</head>

<body>
<div class="navbar">${navbar}</div>
<div class="content">
${content}
</div>
</body>
</html>
    `;
}

function buildIndexHTML(navbar){

var content = `
<h1>ThunderSmotch's Scribbles</h1>
</br>
This website archives some of my notes regarding Maths and Physics.
</br>
Feel free to share them! :))
</br>
<div id='main'>\\(E = mc^2\\)</div>
`;

    return buildHTML(content, navbar);
}

function buildSubjectHTML(navbar, subject){

    var content = `
    <h3>${subject}</h3>
    `

    return buildHTML(content, navbar);
};

function buildNavbar(physics, maths, other){

    var mathsButtons = addNoteButtons(maths);
    var physicsButtons = addNoteButtons(physics);
    var otherButtons = addNoteButtons(other);

    return `
<a href="/index.html">Home</a>
<a href="/about.html">About</a>
<div id="notes" class="dropdown">
    <button class="dropbtn">Notes<i class="fa fa-caret-down"></i></button>
    <div class="dropdown-content">
    <div class="row">
        <div class="column">
        <h3>Mathematics</h3>
        ${mathsButtons}
        </div>
        <div class="column">
        <h3>Physics</h3>
        ${physicsButtons}
        </div>
        <div class="column">
        <h3>Other</h3>
        ${otherButtons}
        </div>
    </div>
    </div>
</div>    
`;
}

function addNoteButtons(array){
    var html = '';
    if(array){
        array.forEach(folder => {
            html += `<a href="/notes/${folder}">${folder}</a>\n`;
        });
    }
    return html;
}

module.exports = {headHTML, buildIndexHTML, buildNavbar, buildHTML, buildSubjectHTML}