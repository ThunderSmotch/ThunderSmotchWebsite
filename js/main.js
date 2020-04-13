function loadFile(file){
    jQuery.get('./notes/'+ file +'.webtex', function(data) {
        data = parseWebtex(data);
        $(".content")[0].innerHTML=data;
        MathJax.typeset();
    });
}