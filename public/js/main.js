function loadFile(file){
    jQuery.get('./notes/'+ file +'.webtex', function(data) {
        data = parseWebtex(data);
        $(".content")[0].innerHTML=data;
        MathJax.typeset();
    });
}

$(document).ready(function(){
    $(".navbar").on( "click", "#notes a", function(e) {
        href = $(this).attr("href");
        loadFile(href)
        history.pushState('', 'New URL: '+href, href);
        e.preventDefault();
      });

})


$(function() {
    // THIS EVENT MAKES SURE THAT THE BACK/FORWARD BUTTONS WORK AS WELL
    window.onpopstate = function(event) {
        console.log("pathname: "+location.pathname);
        loadContent(location.pathname);
    };
});