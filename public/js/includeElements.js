$(document).ready(function () {
    $("div[data-include]").each(function () {                
        $(this).load($(this).attr("data-include"));
    });
});