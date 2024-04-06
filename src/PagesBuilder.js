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

    // Swap this for a file check of a "type.html" template present
    if(metadata.type)
    {
        data = BuildPageFromTemplate("type/" + metadata.type + ".html", body, metadata);
    }
    else
    {
        data = BuildPageFromTemplate("type/default.html", body, metadata);
    }

    ok(data, "Page data is empty, maybe you do not handle all metadata types!");

    fs.writeFileSync(outpath + '/index.html', data);
    
    if(metadata.hidden != true)
        Sitemap.AddURL(metadata.url);        
}

function BuildPageFromTemplate(template, body, metadata)
{
    return TemplatesParser.Parse(template, body, metadata);
}

function Build404Page()
{
    let data = BuildPageFromTemplate("type/default.html", TemplatesParser.Parse("404.html"), 
        {title: "Page Not Found", 
        description: "Page was not found!", 
        url: config.dev.url + "404.html"});    
    fs.writeFileSync(config.dev.outdir + '/404.html', data);
}