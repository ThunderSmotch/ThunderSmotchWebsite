module.exports = {
    ToLowerCaseWithoutSpaces,
    GetCurrentDayMonthYear
}

export {ToLowerCaseWithoutSpaces, GetCurrentDayMonthYear}

function ToLowerCaseWithoutSpaces(str: string)
{
    return str.replace(/\s+/g, '-').toLowerCase();
}

function GetCurrentDayMonthYear()
{
    let date = new Date();

    let dd =  date.getDate();
    let mm =  date.getMonth() + 1;
    let yyyy = date.getFullYear();

    let day = dd < 10 ? '0' + String(dd) : String(dd);
    let mon = mm < 10 ? '0' + String(mm): String(mm);
    
    return day + '/' + mon + '/' + yyyy;
}