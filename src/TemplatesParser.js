module.exports = {Parse}

const config = require("./config");

const Utils = require("./Utils");
const Metadata = require("./Metadata");

const {GetVar} = require("./TemplatesVars");

function Parse(template_name, body="", metadata={}, sidebar="") {
    let data = Utils.GetFileData(Utils.CatDirs(config.dev.templatesdir, template_name));

    // Include other template files
    let reg = new RegExp("(?:<%\\+)+?\\s+(.*)\\s+(?:%>)+?", 'g');
    data = data.replace(reg, 
    function(match, p1){
        return Parse(p1);
    });

    // Include variables
    let reg2 = new RegExp("(?:<%v)+?\\s+(.*)\\s+(?:%>)+?", 'g');
    data = data.replace(reg2, 
    (match, p1) => {
        if(p1 == "body" && body) return body;
        if(p1 == "sidebar" && sidebar) return sidebar;
        return GetVar(p1);
    })

    // Include metadata
    let reg3 = new RegExp("(?:<%m)+?\\s+(.*)\\s+(?:%>)+?", 'g');
    data = data.replace(reg3, 
    (match, p1) => {
        if(p1 in metadata)
            return metadata[p1];
        else
            return Metadata.GetDefaultField(p1);
    })

    // Other parses

    return data;
}