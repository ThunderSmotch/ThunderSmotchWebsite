import fm from "front-matter";

import {config} from "./config";

import * as StringUtils from './StringUtils';
import * as FileUtils from './FileUtils';

export interface Metadata extends Record<string, any> 
{
    title: string;
    description?: string;

    sidebar?: boolean;
    hidden?: boolean;
    navbar?: boolean;

    tags?: string[];
    url: string;

    created?: string;
    modified?: string;
    iterations?: number;
}

/* Page Metadata 
 * 
 * 
 * 
 * hidden: boolean // If true the page will not show on the navigation bar
 */

let default_metadata: Metadata = 
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

/**
 * Returns the metadata for this directory, if present in the head of the main file
 * @param dir - Directory to where to find a main file to read Metadata from
 * @returns The Metadata for this file, if it exists, otherwise returns an empty object
 */
export function GetMetadata(dir: string) : Metadata
{
    let metadata = {} as Metadata;
    let dirpath = FileUtils.CatDirs(config.dev.filesdir, dir);

    try 
    {
        let main_file = FileUtils.GetMainFileInsideDir(dirpath);
        let fpath = FileUtils.CatDirs(dirpath, main_file);
        metadata = fm<Metadata>(FileUtils.GetFileData(fpath)).attributes;
    } 
    catch (error) 
    {
        //console.log(error);
    }

    return metadata;
}

/**
 * Gets the default value of a Metadata field
 * @param field - The Metadata field
 * @returns Default value for field
 */
export function GetDefaultField(field: string) : any
{
    return default_metadata[field];
}