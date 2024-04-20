import fs, { PathLike } from "fs";
import path from "path";

import {config} from "./config";

// MAYBE Evaluate need of the fs Sync functions and transition to async versions for performance reasons

/**
 * Writes a string to a file
 * @param str - Data to write to file
 * @param path - Path to write to, including filename and extension
 */
export function WriteStringToFile(str: string, path: PathLike){
    fs.writeFileSync(path, str);
}

/**
 * Opens file and gets its content
 * @param filepath - File to get data from
 * @param encoding - Data encoding
 * @returns String with the data
 */
export function GetFileData(filepath: PathLike, encoding: BufferEncoding = 'utf-8') : string
{
    if(!fs.existsSync(filepath))
    {
        throw Error("File at " + filepath + "does not exist!");
    }
    let buffer = fs.readFileSync(filepath, {encoding: encoding});
    return buffer;
}

/**
 * Recursively creates directories from the given path
 * @param dir - Path to directory to create
 */
export function MakeDirectory(dir: PathLike): void {
    if (fs.existsSync(dir)) {
        return;
    }
    fs.mkdirSync(dir, {recursive: true});
}

/**
 * Joins dir1 with dir2 if both are valid directories (returning just the valid one if the other is not)
 * @param dir1 - Path from first directory
 * @param dir2 - Path from second directory
 * @returns A valid path obtained by merging dir1 and dir2
 */
export function CatDirs(dir1: PathLike, dir2: PathLike): PathLike
{
    if(dir1 == '' && dir2 == '')
    {
        throw Error("Attempting to cat two empty dirs.");
    }
    
    if(dir1 == '')
    {
        return dir2;
    } 
    else if(dir2 == '')
    {
        return dir1;
    }
    else
    {
        return dir1 + '/' + dir2;
    }
}

/**
 * Recursively searchs for all files inside a given directory
 * @param dir - Directory to start searching from
 * @returns List of all filepaths found (across all depth levels)
 */
export function GetAllFilesRecursively(dir: PathLike) {
    if(!fs.existsSync(dir))
    {
        throw Error("Could not find directory '" + dir + "'");
    }
    
    let filepaths: PathLike[] = [];
    
    let dir_contents = fs.readdirSync(dir);
    dir_contents.forEach((file_or_dir) => 
    {
        let path = CatDirs(dir, file_or_dir);
        let stat = fs.statSync(path);
        if(stat && stat.isDirectory()) /* Recursively search into subdirectory */
        { 
            filepaths = filepaths.concat(GetAllFilesRecursively(path));
        } else /* It is a file */
        { 
            filepaths.push(path);
        }
    });

    return filepaths;
}

/**
 * Moves all files from input directory to the output directory, creating it if it does not exist.
 * @param input - Directory to copy from
 * @param output - Directory to copy to
 */
export function MoveFolderFromTo(input: PathLike, output: PathLike) {

    if(!fs.existsSync(input)) 
    {
        throw Error("Folder '" + input + "' does not exist! Cannot move it to output directory.");
    }

    let output_path = CatDirs(config.dev.outdir, output);
    MakeDirectory(output_path);

    //Move files to newly created folder
    let files = GetAllFilesRecursively(input);
    files.forEach(old_filepath => 
    {
        let new_filepath = CatDirs(output_path, path.basename(old_filepath as string));

        fs.copyFile(old_filepath, new_filepath, (err) => 
        {
           if (err) throw err;
        });
    });
}

/**
 * Gets subdirectories inside the given directory
 * @param dir Directory where to look for subdirectories
 * @returns List of all the names of the found subdirectories
 */
export function GetSubDirs(dir: PathLike){
    return fs.readdirSync(dir, {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name).sort();
}

/**
 * Gets file names for files inside given directory
 * @param dir Directory where to look for files
 * @returns List of filenames (with extension) inside dir
 */
export function GetFilesInsideDir(dir: PathLike): PathLike[]{
    return fs.readdirSync(dir, {withFileTypes: true}).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
}

/**
 * Searches the directory (non-recursively) for files matching the given extensions
 * @param dir - Directory to search for files
 * @param exts - Extensions we want to match with (with dot)
 * @returns An array of filepaths for files matching the givenextensions
 */
export function GetFilesInsideDirWithExtension(dir: PathLike, exts: string[])
{
    let files = GetFilesInsideDir(dir).filter(file => {
        return exts.includes(path.extname(file as string));
    })
    return files;
}

/**
 * Returns the name of the main file inside dir or throws Error if it does not exist
 * @param dir - Directory to search for main file
 * @returns Name of the main file (or of first main file if more than one is found)
 */
export function GetMainFileInsideDir(dir: PathLike): PathLike {
    let files = GetFilesInsideDirWithExtension(dir, config.dev.mainexts);

    if(files.length == 0)
    {
        throw Error("No main file found inside '" + dir + "'");
    }
    else
    {
        if(files.length > 1)
        {
            console.log("Found more than one main file in '" + dir + "'");
            console.log("Found: ", files);
        }

        return files[0];
    }
}