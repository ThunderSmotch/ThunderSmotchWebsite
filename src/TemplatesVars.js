module.exports = {BuildNavbar, BuildProblemsList, GetVar}

const {RemoveOrderingPrefix, SplitStringUppercase} = require("./Utils");


let template_vars = {
    navbarHTML: "",
    problemsList: "",
}

function GetVar(name){
    return template_vars[name];
}

// Builds the HTML for the navbar from the pageTree and sets it to the global constant
// MAYBE see what's up with the fa caret thing & refactor this function
// MAYBE Eventually need to move on from this
function BuildNavbar(pageTree){

    let html = '<a href="/"><b>ThunderSmotch</b></a>\n';

    for(let page in pageTree.pages){
        let dir = page;
        let url = '/' + RemoveOrderingPrefix(dir);
        
        let title = SplitStringUppercase(RemoveOrderingPrefix(page));

        let nav = true;
        if(pageTree.pages[page].metadata.hasOwnProperty('navbar'))
            nav = pageTree.pages[page].metadata.navbar;

        //If it's the last page then make a <a> link
        if( Object.keys(pageTree.pages[page].pages).length === 0 || !nav){
            html += `<a href="${url}/">${title}</a>\n`;
        } else {
            html += `<div id='${page}' class="dropdown">
            <button class="dropbtn">${title}<i class="fa fa-caret-down"></i></button>
            <div class="dropdown-content">
            <div class="row">`;

            let dropPage = pageTree.pages[page].pages;
            for(let subpage in dropPage){

                let subdir = dir + '/' + subpage;
                let subtitle = SplitStringUppercase(RemoveOrderingPrefix(subpage));
                
                html+=`
                <div class="column">
                <h4>${subtitle}</h4>
                ${getSubpageButtons(dropPage[subpage].pages, subdir)}
                </div>
                `;
            }
            html += `</div>\n</div>\n</div>\n`;
        }
    }
    template_vars["navbarHTML"] = html;
}

//Returns HTML for a given topic inside a subject
function getSubpageButtons(pages, dir){

    var html = '';
    if(Object.keys(pages).length !== 0){
        for(let page in pages){

            let subdir = dir + '/' + page;
            let title = SplitStringUppercase(RemoveOrderingPrefix(page));
            html += `<a href="/${RemoveOrderingPrefix(subdir)}/">${title}</a>\n`
        }
    }
    return html;
}

//Builds the problems list from the page tree.
//TODO refactor tags
function BuildProblemsList(pageTree){
    try {
        let html = '<ol>';

        let problems = pageTree.pages['Problems'].pages;
        
        for(let ex in problems){
            let url = './' + ex + '/';
            html += `<li><a href=${url}>${problems[ex].metadata.title}</a> - Tags: ${problems[ex].metadata.tags}</li>`
        }

        html += '</ol>';
        template_vars["problemsList"] = html;
    } catch (err) {
        console.log("Could not build problems list:" + err);
    }
}