module.exports = {GetMetadata, GetDefaultField};
const fm = require("front-matter");
const fs = require("fs");

const config = require("./config");
const Utils = require("./Utils");
const StringUtils = require("./StringUtils");

let default_metadata = 
{
// Required fields
title: "ThunderSmotch",
description: "ThunderSmotch - Maths/Physics/Programming",

// Optional fields
sidebar: false, // Should a sidebar be generated at this point
hidden: false,
navbar: true, // If navbar should be drawn
tags: [],     
url: config.dev.url,
created:  StringUtils.GetCurrentDayMonthYear(),
modified: StringUtils.GetCurrentDayMonthYear(),
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