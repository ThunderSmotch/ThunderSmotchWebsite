import { PathLike } from "fs";
import {config} from "./config";
import { CatDirs } from "./FileUtils";

/**
 * Sets text to lowercase and converts whitespace to hyphens
 * @param str - String to convert
 * @returns A string where all characters are lowercase and contiguous
 * whitespace is a hyphen '-'
 */
export function ToLowerCaseWithoutSpaces(str: string): string
{
    return str.replace(/\s+/g, '-').toLowerCase();
}

/**
 * Turns a date into the 'dd/mm/yyyy' format
 * @param date - Date to convert (defaults to current date if none given)
 * @returns Fixed length string in the dd/mm/yyyy format
 */
export function GetDayMonthYearString(date = new Date()) : string {
    let dd =  date.getDate();
    let mm =  date.getMonth() + 1;
    let yyyy = date.getFullYear();

    let day = dd < 10 ? '0' + String(dd) : String(dd);
    let mon = mm < 10 ? '0' + String(mm): String(mm);
    
    return day + '/' + mon + '/' + yyyy;
}

// Removes ordering prefix used in some directories
// Example 01.Mathematics -> Mathematics
/**
 * Removes the numeric ordering prefix from a string
 * @param string - String to remove prefix from
 * @returns String without ordering prefix
 * @example RemoveOrderingPrefix('01.Mathematics'); // returns 'Mathematics'
 */
export function RemoveOrderingPrefix(str: string) : string {
    let reg = /(?<=^|\/)[0-9]+\./g;
    return str.replace(reg, '');
}

// MAYBE Remove this if unneeded
/**
 * Split string on uppercase letters and return it with spaces
 * @param str - String to separate on the uppercase letters
 * @returns String where each subword, that starts with a capital letter is
 * separated from one another by a space
 */
export function SplitStringUppercase(str: string) : string{
    let res = str.match(/[A-Z][a-z0-9]+/g);

    if(res == null)
    {
        return str;
    }
    else
    {
        return res.join(" ");
    }
}

// Returns a page's URL from the given directory name
export function GetPageURL(dir: PathLike){
    let url = RemoveOrderingPrefix(dir as string);
    //TODO Lowercase with hyphens?
    //MAYBE Trailing slash as option
    return CatDirs(config.dev.url, url) + '/';
}