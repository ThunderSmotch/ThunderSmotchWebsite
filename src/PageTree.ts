import {config} from './config';
import * as FileUtils from './FileUtils';
import * as Metadata from './Metadata';

export type PageTree = {
    metadata: Metadata.Metadata;
    pages: Record<string, PageTree>;
}

/**
 * Recursively builds a tree of all the available pages on the website together with their relevant metadata.
 * @param dir - Current directory used to make a PageTree
 * @returns A PageTree of this directory containing the metadata and its subpages
 */
export function GetPageTree(dir = '')
{
    
    let pageTree: PageTree = 
    {
        metadata: Metadata.GetMetadata(dir),
        pages: {}
    };

    //TODO What was the purpose of this?
    //let pretty_name = StringUtils.RemoveOrderingPrefix(dir.split('/').pop()); 

    //Find subdirs and store them on pages property
    let subDirs = FileUtils.GetSubDirs(FileUtils.CatDirs(config.dev.filesdir, dir));

    if(subDirs.length == 0)
    {
        return pageTree;
    }

    subDirs.forEach( subDir => 
    {
        let subDirPath = FileUtils.CatDirs(dir, subDir);
        pageTree.pages[subDir] = GetPageTree(subDirPath as string);
    });

    return pageTree;
}