module.exports = {
    ToLowerCaseWithoutSpaces,
    GetCurrentDayMonthYear
}

function ToLowerCaseWithoutSpaces(str)
{
    return str.replace(/\s+/g, '-').toLowerCase();
}

function GetCurrentDayMonthYear()
{
    let date = new Date();

    let dd =  date.getDate();
    let mm =  date.getMonth() + 1;
    let yyyy = date.getFullYear();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return dd + '/' + mm + '/' + yyyy;
}