import dedent from "dedent";

let xml = ''; 
let started = false;
let ended   = false;

/**
 * Starts the Sitemap appending the initial tags
 */
export function Start()
{
    if(started)
    {
        throw Error("Starting an already started Sitemap.");
    }

    xml += dedent`
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n
    `;
    started = true;
}

/**
 * Ends the Sitemap appending the final tag
 */
export function End()
{
    if(!started)
    {
        throw Error("Ending Sitemap without having started it.");
    } 
    else if(ended)
    { 
        throw Error("Attempting to end an already finished Sitemap.") 
    }

    xml += `</urlset>`;
    ended = true;
}

/**
 * Appends URL to the Sitemap
 * @param url - URL of the page
 */
export function AddURL(url: string)
{
    if(url.length == 0)
    {
        throw Error("Can't add empty url to Sitemap.");
    }

    xml += dedent`
    <url>
        <loc>${url}</loc>
        <changefreq>daily</changefreq>
    </url>\n
    `;
}

/**
 * Returns the Sitemap
 * @returns String with the Sitemap XML
 */
export function GetXML() : string
{
    if(!started || !ended)
    {
        throw Error("Sitemap is incomplete. Did you call Start and End?");
    }

    return xml;
}