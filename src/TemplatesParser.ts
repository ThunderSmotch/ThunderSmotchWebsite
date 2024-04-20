import {config} from './config';
import * as FileUtils from './FileUtils';
import {Metadata, GetDefaultField} from './Metadata';
import {GetVar} from './TemplatesVars';

export function Parse(template_name: string, body="", metadata: Metadata=({} as Metadata)) 
{
    let data = FileUtils.GetFileData(FileUtils.CatDirs(config.dev.templatesdir, template_name));

    // Check for conditions
    data = data.replace(/(?:<%if)+?\s+(.*?)\s+(?:%>)+?(.*?)(?:<%endif%>)/gs,
        (match, condition, body) => {
            if(GetVar(condition)) return body;
            return "";
        });

    // Include other template files
    let reg = new RegExp("(?:<%\\+)+?\\s+(.*?)\\s+(?:%>)+?", 'g');
    data = data.replace(reg, 
    function(match, p1){
        return Parse(p1, body, metadata);
    });

    // Include variables
    let reg2 = new RegExp("(?:<%v)+?\\s+(.*?)\\s+(?:%>)+?", 'g');
    data = data.replace(reg2, 
    (match, p1) => {
        if(p1 == "body" && body) return body;
        return GetVar(p1);
    })

    // Include metadata
    let reg3 = new RegExp("(?:<%m)+?\\s+(.*?)\\s+(?:%>)+?", 'g');
    data = data.replace(reg3, 
    (match, p1) => {
        if(p1 in metadata)
            return metadata[p1];
        else
            return GetDefaultField(p1);
    })

    // Other parses

    return data;
}