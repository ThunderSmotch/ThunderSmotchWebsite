module.exports = {GetMetadata, GetDefaultField};
const fm = require("front-matter");
const fs = require("fs");


const config = require("./config");
const Utils = require("./Utils");

// TODO Most pages need some sensible defaults
// I should fix the GetMetadata function so that the attributes returned from frontmatter are replacing
// the default ones
let default_metadata = 
{
title: "ThunderSmotch",
description: "ThunderSmotch - Maths/Physics/Programming",
sidebar: false, // Should a sidebar be generated at this point
hidden: false,
navbar: true, // If navbar should be drawn
tags: [],     // FIXME check this
url: config.dev.url
};

//Check inside this directory for a file with metadata and return the metadata
function GetMetadata(dir)
{
    let metadata = {};
    let dirpath = Utils.CatDirs(config.dev.filesdir, dir);
    
    let main_file = Utils.GetMainFileInsideDir(dirpath);
    if(main_file != null) 
    {
        let fpath = Utils.CatDirs(dirpath, main_file);
        metadata = fm(fs.readFileSync(fpath, 'utf8')).attributes;
    }

    return metadata;
}

function GetDefaultField(field)
{
    return default_metadata[field];
}