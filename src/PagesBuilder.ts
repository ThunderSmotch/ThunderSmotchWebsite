import {config} from './config';

import * as Sitemap from "./Sitemap";
import * as FileUtils from "./FileUtils";
import * as TemplatesParser from './TemplatesParser';
import * as TemplatesVars from './TemplatesVars';
import { Metadata } from './Metadata';
import { ok } from 'assert';

export function BuildPage(outpath: string, body: string, metadata: Metadata)
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

    //FIXME Remove assert
    ok(data, "Page data is empty, maybe you do not handle all metadata types!");

    FileUtils.WriteStringToFile(data, outpath + '/index.html');
    
    if(metadata.hidden != true)
        Sitemap.AddURL(metadata.url);        
}

function BuildPageFromTemplate(template: string, body: string, metadata: Metadata)
{
    return TemplatesParser.Parse(template, body, metadata);
}

export function Build404Page()
{
    let data = BuildPageFromTemplate("type/default.html", TemplatesParser.Parse("404.html"), 
        {title: "Page Not Found", 
        description: "Page was not found!", 
        url: config.dev.url + '/' + "404.html"});
    FileUtils.WriteStringToFile(data, config.dev.outdir + '/404.html');
}