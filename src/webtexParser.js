module.exports = { parseWebtex }

function parseWebtex(data){
    
    data = replaceStyling(data);
    data = replaceLinks(data);
    data = replaceSpoiler(data);
    data = replaceSections(data);
    data = replaceMathEnvironments(data)

    return data;
}

//Replaces the styling by HTML tags
function replaceStyling(data){
    data = replaceCommand(data, 'textit', 'i');
    data = replaceCommand(data, 'textbf', 'b');
    data = replaceCommand(data, 'underline', 'u');

    return data;
}

//Replace href
function replaceLinks(data){
    data = replaceHref(data);

    return data;
}

//Replaces Sections by HTML headers
function replaceSections(data){
    data = replaceCommand(data, 'chapter', 'h1');
    data = replaceCommand(data, 'section', 'h2');
    data = replaceCommand(data, 'subsection', 'h3');
    data = replaceCommand(data, 'subsubsection', 'h4');
    data = replaceCommand(data, 'paragraph', 'h5');
    data = replaceCommand(data, 'subparagraph', 'h6');

    return data;
}


function replaceMathEnvironments(data){
    data = replaceMathEnvironment(data, 'definition');

    return data;
}

//Replace a math environment env that has title
function replaceMathEnvironment(data, env){
    var reg = new RegExp('\\\\begin{'+env+'}\\[(.+)\\][\\s\\r\\n]+([\\s\\S]*?)\\\\end{'+env+'}', 'g')

    var str = data.replace(reg, 
    function (match, p1, p2){
        return `
<div class='${env}' title='${p1}'>
${p2}
</div>
`;
    }
);
return str;
}

//Replaces \begin{spoiler}[info] with the details HTML tag using the power of Regex
function replaceSpoiler(data){
    var str = data.replace(/\\begin{spoiler}\[(.+)\][\s\r\n]+([\s\S]*?)\\end{spoiler}/g, 
        function (match, p1, p2){
            return `<details>
<summary>${p1}</summary>
<div>
${p2}
</div>
</details>`;
        }
    );
    return str;
}

//Replaces \href{link}{text} with <a href='link'>text</a>.
function replaceHref(data){
    var reg = new RegExp('\\\\' + 'href' + '\\*?{(.+)}{(.+)}', 'g');

    var str = data.replace(reg, 
        function (match, p1, p2){
            return `<a href='${p1}'>${p2}</a>`;
        });
    return str;
}

//Replaces a simple \command{text} or \command*{text} with a <tag>text</tag>
function replaceCommand(data, cmdName, tag){
    var reg = new RegExp('\\\\' + cmdName + '\\*?{(.+)}', 'g');

    var str = data.replace(reg, 
        function (match, p1){
            return `<${tag}>${p1}</${tag}>`;
        });
    return str;
}