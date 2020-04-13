module.exports = { parseWebtex }

function parseWebtex(data){
    
    data = replaceSpoiler(data);
    data = replaceSections(data);

    return data;
}

function replaceSections(data){
    data = replaceCommand(data, 'chapter', 'h1');
    data = replaceCommand(data, 'section', 'h2');
    data = replaceCommand(data, 'subsection', 'h3');
    data = replaceCommand(data, 'subsubsection', 'h4');
    data = replaceCommand(data, 'paragraph', 'h5');
    data = replaceCommand(data, 'subparagraph', 'h6');

    return data;
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

//Replaces a simple \command{text} or \command*{text} with a <tag>text</tag>
function replaceCommand(data, cmdName, tag){
    var reg = new RegExp('\\\\' + cmdName + '\\*?{(.+)}', 'g');

    var str = data.replace(reg, 
        function (match, p1){
            return `<${tag}>${p1}</${tag}>`;
        });
    return str;
}