import { Metadata } from "./Metadata";
import { PageTree } from "./PageTree";
import {RemoveOrderingPrefix, SplitStringUppercase, ToLowerCaseWithoutSpaces} from "./StringUtils"; 

let template_vars: Record<string, string> = 
{
    navbar: "",
    table_of_contents: "",
    sidebar: "",
    problemsList: "",
    list: ""
}

/**
 * Grabs a variable stored inside the template vars
 * @param name - The name of the template variable to get
 * @returns A string containing the requested template variable
 */
export function GetVar(name: string) : string 
{
    return template_vars[name];
}


export function BuildVarsAndUpdateBody(body: string, metadata: Metadata)
{
    body = BuildTableOfContentsAndUpdateBody(body); // Generates TOC and updates HTML with the section ids
    return body;
}

// Builds the HTML for the navbar from the pageTree and sets it to the global constant
// MAYBE see what's up with the fa caret thing & refactor this function
// MAYBE Eventually need to move on from this
export function BuildNavbar(pageTree: PageTree)
{

    let html = '<a href="/"><b>ThunderSmotch</b></a>\n'; // FIXME Hardcoded value

    for(let page in pageTree.pages)
    {
        let dir = page;
        let url = '/' + RemoveOrderingPrefix(dir);
        
        let title = SplitStringUppercase(RemoveOrderingPrefix(page));
        let metadata = pageTree.pages[page].metadata;

        if(metadata.hasOwnProperty('hidden') && metadata.hidden)
        {
            continue; // If page is hidden don't show it on navbar
        }

        // @ts-ignore
        let nav: boolean|undefined = true;
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

            let dropPage: Record<string, PageTree> = pageTree.pages[page].pages;
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
function getSubpageButtons(pages : Record<string, PageTree>, dir : string)
{

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

export function BuildList(pages: Record<string, PageTree>)
{
    let html = '';

    for(let pageName in pages)
    {
        let name = RemoveOrderingPrefix(pageName);
        let page = pages[pageName];
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
function BuildTableOfContentsAndUpdateBody(body : string)
{
    let set = new Set<string>();
    let previous_level = "";

    let reg = /<h(\d)>(.*?)<\/h(?:\d)>/gm;

    let html = "<ol>";

    body = body.replaceAll(reg, (match, p1, p2) => {
        let section_id = ToLowerCaseWithoutSpaces(p2);
        if(set.has(section_id))
        {
            section_id = section_id + "-1";
        }
        set.add(section_id);

        if(previous_level == "") // First match
        {
            previous_level = p1;
        }
        else if(previous_level < p1)
        {
            html += "<ol>";
        }
        else if(previous_level > p1)
        {
            html += "</li></ol>";
        }
        else
        {
            html += "</li>";
        }
        previous_level = p1;

        html += `<li><a href="#${section_id}">${p2}</a>`;
        return `<div id="${section_id}">${match}</div>`
    });
    html += "</li></ol>";

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
export function BuildSidebar(pages: Record<string, PageTree>, urlpath: string){
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