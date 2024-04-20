import {config} from "./config";
import * as TemplatesVars from "./TemplatesVars";
import * as Sitemap from "./Sitemap";
import * as FileUtils from "./FileUtils";
import * as PageTree from './PageTree';
import * as FileParser from "./FileParser";
import * as PagesBuilder from "./PagesBuilder";

//////////////////////Building the Website//////////////////
FileUtils.MakeDirectory(config.dev.outdir);

// Move files that do not need parsing
FileUtils.MoveFolderFromTo('js', 'js');
FileUtils.MoveFolderFromTo('style', 'style');

// Gets the page tree for the website
let pageTree = PageTree.GetPageTree();

// Building global templates variables
TemplatesVars.BuildNavbar(pageTree);

// Adding pages
Sitemap.Start();
//Build 404 page
PagesBuilder.Build404Page();
FileParser.ParseDirectory(pageTree, '');
Sitemap.End();
FileUtils.WriteStringToFile(Sitemap.GetXML(), config.dev.outdir + "/sitemap.xml");
///////////////////// SITE BUILT /////////////////////

//FIXME Check for URL Name Clashes
//TODO Tag ordering? Or an url for posts/problems from a given tag.


//TODO Search for @ts-ignore and fix them