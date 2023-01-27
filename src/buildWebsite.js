const fm = require("front-matter");
const fs = require("fs");
const path = require("path");

const config = require("./config");
const templates = require("./templates");

const Sitemap = require("./SitemapBuilder");
const PageTree = require("./PageTree");
const FileParser = require("./FileParser");
const Utils = require("./Utils");

//////////////// T O D O S ////////////////

//TODO someway of navigating between h2 h3 h4 headers on a page

//MAYBE Implement last modified on sitemap

//MAYBE some sort of bidirectional links (WIP)

//MAYBE Anki flashcards repositoriums for each file

//MAYBE make a subject page with navigation towards the several topics

//////////////////////Building the Website//////////////////////////////
Utils.MakeDirectory(config.dev.outdir);

// Move files that do not need parsing
Utils.MoveFolderToOutput('js');
Utils.MoveFolderToOutput('style');

//Gets the page tree for the website
let pageTree = PageTree.GetPageTree();

// Building templates
templates.buildNavbar(pageTree);
templates.buildProblemsList(pageTree);

// Adding pages
Sitemap.Start();
//Build 404 page
fs.writeFileSync(config.dev.outdir + '/404.html', templates.build404HTML());
FileParser.ParseDirectory(pageTree, '');
Sitemap.End();