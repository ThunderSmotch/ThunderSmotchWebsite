module.exports = { Parse }

//TODO: Detect line break as two blank linebreaks on the tex file.
function Parse(data){
    
    data = removeComments(data);
    data = replaceFigures(data);
    data = replaceLinks(data);
    data = replaceSpoiler(data);
    data = replaceSections(data);
    data = replaceMathEnvironments(data);
    data = replaceLists(data);
    data = replaceParagraphs(data);
    data = replaceStyling(data);
    data = replaceFootnotes(data);
    data = replaceTodos(data);
    data = replaceScripts(data);
    data = replaceGeogebra(data);
    
    return data;
}

//Replaces lists with the corresponding html tags
function replaceLists(data){
    data = replaceList(data, 'itemize', 'ul');
    data = replaceList(data, 'enumerate', 'ol');
    return data;
}

//Replace a list environment env that has 
function replaceList(data, env, tag){
    var reg = new RegExp('\\\\begin{'+env+'}[\\s\\r\\n]+([\\s\\S]*?)\\\\end{'+env+'}', 'g')

    var str = data.replace(reg, 
    function (match, p1){
        return `<${tag}>
        ${replaceItem(p1)}
        </${tag}>`
    });
    
    return str;
}

//Replaces item by the tag li
//BUG Does not work with nested lists
function replaceItem(text){

    let reg = /\\item\s(((?!\\item )(.|\n))+)/gms;

    text = text.replace(reg,
        function(match, p1){
            return `<li>${p1}</li>`    
        });

    return text;
}

//Replaces todos with a red div
function replaceTodos(data){
    let reg = /\\TODO{(.+)}/g;

    data = data.replace(reg, 
        function(match, p1){
            return `<div class='todo'><b>To-Do: </b>${p1}</div>`;
        })
    return data;
}

//Replace footnotes by anchors with the content of them shown on the bottom of the page.
function replaceFootnotes(data){
    let counter = 0; //Number of footnotes
    let footnotes = `<br><hr><b>Footnotes:</b><br>`;

    let strings = data.split("\\footnote{");
    if (strings.length > 1)
    {
        data = strings[0];

        for (let i = 1; i < strings.length; i++) 
        {
            counter++;
            const text = strings[i];
            let paranthesis_count = 1; // The initial '{' is eaten by the split
            
            // Find closing '}'
            let closing_index = -1;
            let prev_char = 0;
            for (let c = 0; c < text.length; c++) {
                const char = text[c];
                if (char == '{' && prev_char != "\\")
                {
                    paranthesis_count++;
                }
                else if(char == '}' && prev_char != "\\")
                {
                    paranthesis_count--;
                    if(paranthesis_count == 0) // Found it
                    {
                        closing_index = c;
                        break; 
                    }
                }
                prev_char = char;
            }

            if (closing_index == -1)
            {
                throw SyntaxError("No closing parenthesis found!"); // TODO Better debug messages, referencing file and line
            }

            let footnote_text = text.substring(0, closing_index);
            let next_text = text.substring(closing_index + 1);
            
            let footnote = `<a id="Reference${counter}" href="#Footnote${counter}">[${counter}]</a> - ${footnote_text} <br>`;
            footnotes = footnotes.concat(footnote);

            data += `<sup><a id="Footnote${counter}" href="#Reference${counter}">[${counter}]</a></sup>${next_text}`
        }
    }
    if(counter){ data = data.concat(footnotes); } 
    return data;
}

//Replace \geogebra{material_id} by the Geogebra embed
function replaceGeogebra(data){
    let reg = /\\geogebra{(.+)}/g;

    data = data.replace(reg,
        function (match, p1){
            return `<div class="geogebraApp" id="ggb-${p1}"></div>
            <script>  
                var ggbApp_${p1} = new GGBApplet({"material_id":"${p1}", "width": 800 , "height": 600, "playButton":true, "showFullscreenButton":true, "scaleContainerClass":"geogebraApp"}, true);
                window.addEventListener("load", function() { 
                    ggbApp_${p1}.inject('ggb-${p1}');
                });
            </script>`;
    });

    return data;
}

//Replace script commands with a script tag
function replaceScripts(data){
    let reg = /\\script{(.+)}/g;

    data = data.replace(reg, 
        function (match, p1){
            return `<div id='${p1}'><script async type="module" src="js/${p1}"></script></div>`;
        });

    return data;
}

//Replace figure environments with the img html tag
function replaceFigures(data){
    let reg = /\\begin{figure}[\s\S]*?includegrap[\s\S]+?{([\S]+)}[\s\S]*?\\end{figure}/mg;

    data = data.replace(reg, (match, p1)=>{
        return `<img alt='${p1}' src='./${p1}'>`;
    });

    return data;
}

//Removes comments (lines starting with %)
function removeComments(data){
    let reg = /^%[\s\S]+?$/gm;

    data = data.replace(reg, '');

    return data;
}

//Empty p tags are appearing due to the presence of divs and other tags inside p elements
//Maybe fixed now with a regex change!

//Puts p tags around everything that resembles a paragraph
function replaceParagraphs(data){
    let reg = /^[^<\r\n][^\r\n]+((\r|\n|\r\n)[^\r\n]+)*/gm;

    data = data.replace(reg, (match)=>{
        return `<p>${match}</p>`;
    });

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

//Replaces amsmath environments with the according divs
function replaceMathEnvironments(data){
    data = replaceMathEnvironment(data, 'definition');
    data = replaceMathEnvironment(data, 'example');
    data = replaceMathEnvironment(data, 'exercise');
    data = replaceMathEnvironment(data, 'theorem');
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
    var reg = new RegExp('\\\\' + 'href' + '\\*?{(.+?)}{(.+?)}', 'g');

    var str = data.replace(reg, 
        function (match, p1, p2){
            return `<a href='${p1}'>${p2}</a>`;
        });
    return str;
}

//Replaces a simple \command{text} or \command*{text} with a <tag>text</tag>
function replaceCommand(data, cmdName, tag){
    var reg = new RegExp('\\\\' + cmdName + '\\*?{(.*?)}', 'g');

    var str = data.replace(reg, 
        function (match, p1){
            return `<${tag}>${p1}</${tag}>`;
        });
    return str;
}