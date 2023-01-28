module.exports = {Build404Page, BuildPage, BuildSidebar}

const fs = require("fs");

const config = require("./config");
const TemplatesParser = require("./TemplatesParser");
const Sitemap = require("./Sitemap");
const Utils = require("./Utils");
const { ok } = require("assert");

function BuildPage(outpath, body, metadata, sidebar='')
{
    let data = "";

    switch(metadata.type)
    {
        case "post":
            data = BuildPostPage(body, metadata, sidebar);
            break;
        case "problems":
            data = BuildProblemsListPage(body, metadata);
            break;
        case "problem":
            data = BuildProblemPage(body, metadata);
            break;
        case "tableofcontents":
            break; // TODO Incomplete
        default:
            return BuildDefaultPage(body, metadata);
    }

    ok(data, "Page data is empty, maybe you do not handle all metadata types!");

    fs.writeFileSync(outpath + '/index.html', data);
    Sitemap.AddURL(metadata.url);        
}

function BuildDefaultPage(body, metadata)
{
    return TemplatesParser.Parse("default_page.html", body, metadata);
}

function BuildPostPage(body, metadata, sidebar)
{
    return TemplatesParser.Parse("post_page.html", body, metadata, sidebar);
}

function BuildProblemPage(body, metadata)
{
    return TemplatesParser.Parse("problem_page.html", body, metadata);
}

function BuildProblemsListPage(body, metadata)
{
    return TemplatesParser.Parse("problems_list_page.html", body, metadata);
}

function Build404Page()
{
    let data = BuildDefaultPage(TemplatesParser.Parse("404.html"), 
        {title: "Page Not Found", 
        description: "Page was not found!", 
        url: config.dev.url + "404.html"});    
    fs.writeFileSync(config.dev.outdir + '/404.html', data);
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

        let pageURL = Utils.RemoveOrderingPrefix(page);
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