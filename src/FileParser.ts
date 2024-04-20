import * as StringUtils from './StringUtils';
import * as FileUtils from './FileUtils';

import fs from "fs";
import path from "path";

import fm, {FrontMatterResult } from "front-matter";

import {config} from "./config";
import * as PagesBuilder from "./PagesBuilder";
import * as WebtexParser from "./WebtexParser";
import * as TemplatesVars from "./TemplatesVars";
import { PageTree } from './PageTree';
import { Metadata } from './Metadata';

export function ParseDirectory(pageTree: PageTree, dir=''){
    //Make same directory on output dir
    FileUtils.MakeDirectory(FileUtils.CatDirs(config.dev.outdir, StringUtils.RemoveOrderingPrefix(dir)));
    
    //FIXME Local File Variables should not be made here
    // MAYBE move this to the BuildPageAndVars function by providing the pageTree there
    // Build sidebar if sidebar metadata is true
    if(pageTree.metadata.sidebar == true){
        TemplatesVars.BuildSidebar(pageTree.pages, StringUtils.RemoveOrderingPrefix(dir));
    }
    if(pageTree.metadata.type == 'list')
    {
        TemplatesVars.BuildList(pageTree.pages);
    }

    //Convert files
    ParseFiles(dir);

    // Recurse into subdirectories
    for(let page in pageTree.pages){
        let new_dir = FileUtils.CatDirs(dir, page);
        ParseDirectory(pageTree.pages[page], (new_dir as string));
    }
}

//Check and parse all files inside given dir
function ParseFiles(dir: string) {
    let url = StringUtils.RemoveOrderingPrefix(dir);
    let res = FileUtils.GetFilesInsideDir(FileUtils.CatDirs(config.dev.filesdir, dir));

    //Check if the output path exists
    let outpath = FileUtils.CatDirs(config.dev.outdir, url);
    FileUtils.MakeDirectory(outpath);
    
    res.forEach((file) => ParseFile(file as string, dir, outpath as string));
}

//Parses a single file according to its extension
function ParseFile(name: string, dir: string, outpath: string) {
    let ext = path.extname(name);

    let filepath = FileUtils.CatDirs(config.dev.filesdir, dir) + '/' + name;

    if(config.dev.mainexts.includes(ext)) // It's a main file!
    {
        let data = fm<Metadata>(fs.readFileSync(filepath, 'utf8'));
        ParseMainFile(ext, data, StringUtils.GetPageURL(dir), outpath);
    }
    else if (ext == '.js' || ext == '.png' || ext == '.jpg') { // Copy the file to the folder
        fs.copyFileSync(filepath, outpath + '/' + name);
    }
    else { // If unknown, do nothing to it!
        console.log("File not handled: " + filepath);
    }
}

function ParseMainFile(type: string, data: FrontMatterResult<Metadata>, url: string, outpath: string)
{    
    let body = data.body;
    if(type == ".webtex")
    {
        body = WebtexParser.Parse(body);
    }

    let metadata = data.attributes;
    metadata.url = url;

    PagesBuilder.BuildPage(outpath, body, metadata);
}