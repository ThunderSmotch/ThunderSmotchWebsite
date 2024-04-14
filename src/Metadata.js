module.exports = {GetMetadata, GetDefaultField};
const fm = require("front-matter");
const fs = require("fs");

const config = require("./config");
const Utils = require("./Utils");
const StringUtils = require("./StringUtils");

/* Page Metadata 
 * 
 * 
 * 
 * hidden: boolean // If true the page will not show on the navigation bar
 */

let default_metadata = 
{
// Required fields
title: "ThunderSmotch",
description: "ThunderSmotch - Maths/Physics/Programming",

// Optional fields
sidebar: false, // FIXME Should a sidebar be generated at this point (this should be refactored better)
hidden: false,
navbar: true, // FIXME If navbar should be drawn WRONG This actually means if the page should be used in the navbar generation (see TemplateVars BuildNavbar)
tags: [],     
url: config.dev.url,
created:  StringUtils.GetDayMonthYearString(),
modified: StringUtils.GetDayMonthYearString(),
iterations: 1,
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