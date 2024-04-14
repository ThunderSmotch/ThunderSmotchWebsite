export {ToLowerCaseWithoutSpaces, GetDayMonthYearString}

/**
 * Sets text to lowercase and converts whitespace to hyphens
 * @param str - String to convert
 * @returns A string where all characters are lowercase and contiguous whitespace is a hyphen '-'
 */
function ToLowerCaseWithoutSpaces(str: string): string
{
    return str.replace(/\s+/g, '-').toLowerCase();
}

/**
 * Turns a date into the 'dd/mm/yyyy' format
 * @param date - Date to convert (defaults to current date if none given)
 * @returns Fixed length string in the dd/mm/yyyy format
 */
function GetDayMonthYearString(date = new Date()) : string {
    let dd =  date.getDate();
    let mm =  date.getMonth() + 1;
    let yyyy = date.getFullYear();

    let day = dd < 10 ? '0' + String(dd) : String(dd);
    let mon = mm < 10 ? '0' + String(mm): String(mm);
    
    return day + '/' + mon + '/' + yyyy;
}