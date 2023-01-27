module.exports = {buildNavbar, buildHTML, buildSidebar, build404HTML, buildProblemsList}
const path = require("path");
const { config } = require("process");

const {RemoveOrderingPrefix, SplitStringUppercase} = require("./Utils");

//Navbar HTML to be set during build
let navbarHTML = '';

//Problems List
let problemsList = '';

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
    
    if(metadata.type == 'post'){
        return postPageTemplate(content, metadata, sidebar);
    } else if (metadata.type == 'problem'){
        return problemPageTemplate(content, metadata);
    } else if (metadata.type == 'problems'){
        return problemsListPageTemplate(content, metadata);
    } else if (metadata.type == 'tableofcontents') {
        return tableOfContentsPageTemplate(content, metadata, sidebar);
    }
    else {
        return defaultPageTemplate(content, metadata, sidebar);
    }
}

//Builds the 404 page
function build404HTML(){

    var content = `
    <h1>This page could not be found!</h1>
    </br>
    <span>For problems or suggestions please enter in contact with thundersmotch@gmail.com.</span><br>
    <span>Maybe this page was moved elsewhere. Check the navigation bar above to see if you can still find it!</span>
    `;

    var metadata = {
        "title": "Page Not Found",
        "description": "That page could not be found.",
        "url": "https://thundersmotch.com/404.html"
    }
    
    return buildHTML(content, metadata);
}

//Builds sidebar from a list of subpages
function buildSidebar(pages, urlpath){
    let listitems = '';
    let item_id = 0;

    listitems +=  `<a n="${item_id}" href="/${urlpath}/">Index</a></br>`;

    for(let page in pages){
        
        //If page is hidden skip this iteration
        if(pages[page].metadata.hasOwnProperty('hidden')){
            if(pages[page].metadata.hidden)
                continue;
        }

        let pageURL = RemoveOrderingPrefix(page);
        let pageName = pages[page].metadata.title;
    
        item_id++;
        listitems += `<a n="${item_id}" href="/${urlpath}/${pageURL}/">${pageName}</a></br>`
    }

    let sidebar = `
    <div class='sidebar'>
    <div class='sidebarTitle'>Navigation</div>
    ${listitems}
    </div>`;

    return sidebar;
}

//Builds the HTML for the navbar from the pageTree and sets it to the global constant
//MAYBE see what's up with the fa caret thing & refactor this function
function buildNavbar(pageTree){

    let html = '<a href="/"><b>ThunderSmotch</b></a>\n';

    for(let page in pageTree.pages){
        let dir = page;
        let url = '/' + RemoveOrderingPrefix(dir);
        
        let title = SplitStringUppercase(RemoveOrderingPrefix(page));

        let nav = true;
        if(pageTree.pages[page].metadata.hasOwnProperty('navbar'))
            nav = pageTree.pages[page].metadata.navbar;

        //If it's the last page then make a <a> link
        if( Object.keys(pageTree.pages[page].pages).length === 0 || !nav){
            html += `<a href="${url}/">${title}</a>\n`;
        } else {
            html += `<div id='${page}' class="dropdown">
            <button class="dropbtn">${title}<i class="fa fa-caret-down"></i></button>
            <div class="dropdown-content">
            <div class="row">`;

            let dropPage = pageTree.pages[page].pages;
            for(let subpage in dropPage){

                let subdir = dir + '/' + subpage;
                let subtitle = SplitStringUppercase(RemoveOrderingPrefix(subpage));
                
                html+=`
                <div class="column">
                <h4>${subtitle}</h4>
                ${getSubpageButtons(dropPage[subpage].pages, subdir)}
                </div>
                `;
            }
            html += `</div>\n</div>\n</div>\n`;
        }
    }
    navbarHTML = html;
}

//Builds the problems list from the page tree.
//TEMP maybe
//TODO refactor tags
function buildProblemsList(pageTree){
    try {
        let html = '<ol>';

        let problems = pageTree.pages['Problems'].pages;
        
        for(let ex in problems){
            let url = './' + ex + '/';
            html += `<li><a href=${url}>${problems[ex].metadata.title}</a> - Tags: ${problems[ex].metadata.tags}</li>`
        }

        html += '</ol>';
        problemsList = html;
    } catch (err) {
        console.log("Could not build problems list:" + err);
    }
}

//Returns HTML for a given topic inside a subject
function getSubpageButtons(pages, dir){

    var html = '';
    if(Object.keys(pages).length !== 0){
        for(let page in pages){

            let subdir = dir + '/' + page;
            let title = SplitStringUppercase(RemoveOrderingPrefix(page));
            html += `<a href="/${RemoveOrderingPrefix(subdir)}/">${title}</a>\n`
        }
    }
    return html;
}

//Returns the HTML for the head html tag
function getHead(title = 'Home', description = 'ThunderSmotch - Maths/Physics/Programming', url="https://thundersmotch.com/"){
    title = title + ' | ThunderSmotch';

    return `    
    <!-- SEO STUFF -->
    <title>${title}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="description" content="${description}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="canonical" href="${url}" />
    <!-- Open Graph data -->
    <meta property="og:title" content="${title}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
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

//Returns the footer HTML
function getFooter(){
    return `
<p>Made by <a href="https://github.com/ThunderSmotch">ThunderSmotch</a> | 2023 |</p>
`;
}

//Default page template
function defaultPageTemplate(content, metadata){
     //Return HTML
     return `
 <!DOCTYPE html>
 <html>
 <head>
     ${getHead(metadata.title, metadata.description, metadata.url)}
 </head>
 
 <body>
 <div class="navbar">${navbarHTML}</div>
 <div id="main">
     <div class="content nosidebar">
     ${content}
     </div>
 </div>
 
 <div class="footer">
   ${getFooter()}
 </div>
 
 </body>
 </html>
     `
}

//Post template
function postPageTemplate(content, metadata, sidebar){
     //Handle sidebar
     let noSidebar = '';
     if(sidebar == '')
         noSidebar = 'nosidebar';
     
     //Return HTML
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
     <div class="nav_links">
     <a href='#' class='nav_button' id='nav_previous' style='float:left;'> <- Previous </a>
     <a href='#' class='nav_button' id='nav_next' style='float:right;'> Next -> </a>
     
     <script>
     let aa = document.querySelector('.sidebar a[href="' + window.location.pathname + '"]');
     let prev = document.getElementById('nav_previous');
     let next = document.getElementById('nav_next');
     let n = aa.getAttribute("n");

     let sidebar_p = document.querySelector('.sidebar a[n="' + (parseInt(n)-1) + '"]');
     let sidebar_n = document.querySelector('.sidebar a[n="' + (parseInt(n)+1) + '"]');

     if(sidebar_p == null) {
        prev.style = 'display: none;'
     } else {
         prev.innerText = '<- ' + sidebar_p.innerText;
         prev.href = sidebar_p.href;
     }
     if(sidebar_n == null){
        next.style = 'display:none;'
     } else {
        next.innerText = sidebar_n.innerText + ' ->';
        next.href = sidebar_n.href;   
     }

     </script>
     </div>
     <br>
     ${commentSection}
     </div>
 </div>
 
 <div class="footer">
   ${getFooter()}
 </div>
 
 </body>
 </html>
     `;
}

//Problem template
function problemPageTemplate(content, metadata){

    let source = '';
    if(metadata.hasOwnProperty('source')){
        source = "</br><b>Source:</b> " + metadata.source;
    }

    let tags = '';
    if(metadata.hasOwnProperty('tags')){
        tags = "</br><b>Tags:</b> " + metadata.tags
    }

    //Return HTML
    return `
<!DOCTYPE html>
<html>
<head>
    ${getHead(metadata.title, metadata.description, metadata.url)}
</head>

<body>
<div class="navbar">${navbarHTML}</div>
<div id="main">
    <div class="content nosidebar">
    <h3>${metadata.title}</h3>
    ${content}
    ${source}
    ${tags}

    <br>
     ${commentSection}
    </div>
</div>

<div class="footer">
  ${getFooter()}
</div>

</body>
</html>
    `
}

//Problems list template
function problemsListPageTemplate(content, metadata){
    //Return HTML
    return `
<!DOCTYPE html>
<html>
<head>
    ${getHead(metadata.title, metadata.description, metadata.url)}
</head>

<body>
<div class="navbar">${navbarHTML}</div>
<div id="main">
    <div class="content nosidebar">
    ${content}<br>
    ${problemsList}
    </div>
</div>

<div class="footer">
  ${getFooter()}
</div>

</body>
</html>
    `
}

//Table of contents template
function tableOfContentsPageTemplate(content, metadata, sidebar){
    //Handle sidebar
    let noSidebar = '';
    if(sidebar == '')
        noSidebar = 'nosidebar';
    
    //Return HTML
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
    <div class="nav_links">
    <a href='#' class='nav_button' id='nav_previous' style='float:left;'> <- Previous </a>
    <a href='#' class='nav_button' id='nav_next' style='float:right;'> Next -> </a>
    
    <script>
    let aa = document.querySelector('.sidebar a[href="' + window.location.pathname + '"]');
    let prev = document.getElementById('nav_previous');
    let next = document.getElementById('nav_next');
    let n = aa.getAttribute("n");

    let sidebar_p = document.querySelector('.sidebar a[n="' + (parseInt(n)-1) + '"]');
    let sidebar_n = document.querySelector('.sidebar a[n="' + (parseInt(n)+1) + '"]');

    if(sidebar_p == null) {
       prev.style = 'display: none;'
    } else {
        prev.innerText = '<- ' + sidebar_p.innerText;
        prev.href = sidebar_p.href;
    }
    if(sidebar_n == null){
       next.style = 'display:none;'
    } else {
       next.innerText = sidebar_n.innerText + ' ->';
       next.href = sidebar_n.href;   
    }

    </script>
    </div>
    <br>
    ${commentSection}
    </div>
</div>

<div class="footer">
  ${getFooter()}
</div>

</body>
</html>
    `;
}