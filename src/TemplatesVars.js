module.exports = {BuildVarsAndUpdateBody, GetVar, BuildNavbar, BuildList, BuildSidebar}

const {RemoveOrderingPrefix, SplitStringUppercase} = require("./Utils");
const StringUtils = require("./StringUtils");

let template_vars = {
    navbar: "",
    table_of_contents: "",
    sidebar: "",
    problemsList: "",
    list: ""
}

function GetVar(name){
    return template_vars[name];
}

function BuildVarsAndUpdateBody(body, metadata)
{
    body = BuildTableOfContentsAndUpdateBody(body); // Generates TOC and updates HTML with the section ids
    return body;
}

// Builds the HTML for the navbar from the pageTree and sets it to the global constant
// MAYBE see what's up with the fa caret thing & refactor this function
// MAYBE Eventually need to move on from this
function BuildNavbar(pageTree){

    let html = '<a href="/"><b>ThunderSmotch</b></a>\n';

    for(let page in pageTree.pages){
        let dir = page;
        let url = '/' + RemoveOrderingPrefix(dir);
        
        let title = SplitStringUppercase(RemoveOrderingPrefix(page));
        let metadata = pageTree.pages[page].metadata;

        if(metadata.hasOwnProperty('hidden') && metadata.hidden){
            continue; // If page is hidden don't show it on navbar
        }

        let nav = true;
        if(metadata.hasOwnProperty('navbar'))
            nav = metadata.navbar;

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
    template_vars.navbar = html;
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

function BuildList(pages)
{
    let html = '';

    for(let page in pages)
    {
        let name = RemoveOrderingPrefix(page);
        page = pages[page];
        let url = './' + name + "/";

        if(page.metadata.hidden)
        {
            continue;
        }

        let date = page.metadata.created == undefined ? "" : page.metadata.created;
        let tags = page.metadata.tags == undefined ? "": page.metadata.tags;

        html += `<div>
        <h4 class="list_item"><a href=${url}>${page.metadata.title}</a></h4>
        ${date} <span class="unselectable">&nbsp;&middot;&nbsp;</span> ${tags}
        </div>`;
    }

    html += '';
    template_vars["list"] = html;
}

// Receives the HTML body of a post and builds the table of contents from
// the header tags inside
// TODO Add Post Title as first element of TOC
// TODO Nest enumerates for subsubsections and others
function BuildTableOfContentsAndUpdateBody(body)
{
    let reg = /<h(?:1|2|3|4)>(.*?)<\/h(?:1|2|3|4)>/gm;

    let html = "<ol>";

    body = body.replaceAll(reg, (match, p1) => {
        let section_id = StringUtils.ToLowerCaseWithoutSpaces(p1);
        html += `<li><a href="#${section_id}">${p1}</a></li>`;
        return `<div id="${section_id}">${match}</div>`
    });
    html += "</ol>";

    // Nothing got added
    if (html == "<ol></ol>")
    {
        template_vars.table_of_contents = "";
    }
    else 
    {
        template_vars.table_of_contents = html;
    }

    return body;
}

//Builds sidebar from a list of subpages
// TODO Cleanup this function
function BuildSidebar(pages, urlpath){
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

    template_vars.sidebar = sidebar;

    // TODO REMOVE
    return sidebar;
}