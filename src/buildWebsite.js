const config = require("./config");

const TemplatesVars = require("./TemplatesVars");
const Sitemap = require("./Sitemap");
const PageTree = require("./PageTree");
const FileParser = require("./FileParser");
const PagesBuilder = require("./PagesBuilder");
const Utils = require("./Utils");

//////////////////////Building the Website//////////////////
Utils.MakeDirectory(config.dev.outdir);

// Move files that do not need parsing
Utils.MoveFolderToOutput('js');
Utils.MoveFolderToOutput('style');

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
///////////////////// SITE BUILT /////////////////////

//FIXME Check for URL Name Clashes
//TODO Tag ordering? Or an url for posts/problems from a given tag.