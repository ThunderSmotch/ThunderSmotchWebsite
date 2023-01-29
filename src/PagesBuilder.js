module.exports = {Build404Page, BuildPage}

const fs = require("fs");

const config = require("./config");
const TemplatesParser = require("./TemplatesParser");
const TemplatesVars = require("./TemplatesVars");
const Sitemap = require("./Sitemap");
const Utils = require("./Utils");
const { ok } = require("assert");

function BuildPage(outpath, body, metadata)
{
    let data = "";

    body = TemplatesVars.BuildVarsAndUpdateBody(body, metadata);

    switch(metadata.type)
    {
        case "post":
            data = BuildPostPage(body, metadata);
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
            data = BuildDefaultPage(body, metadata);
    }

    ok(data, "Page data is empty, maybe you do not handle all metadata types!");

    fs.writeFileSync(outpath + '/index.html', data);
    
    if(metadata.hidden != true)
        Sitemap.AddURL(metadata.url);        
}

function BuildDefaultPage(body, metadata)
{
    return TemplatesParser.Parse("default_page.html", body, metadata);
}

function BuildPostPage(body, metadata)
{
    return TemplatesParser.Parse("post_page.html", body, metadata);
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