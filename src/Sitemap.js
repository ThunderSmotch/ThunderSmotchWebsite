module.exports = {Start, End, AddURL};

const { ok } = require("assert");
const fs = require("fs");

const config = require("./config");

let xml = '';

let started = false;
let ended   = false;

function Start()
{
    xml += `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    started = true;
}

function End()
{
    xml += `</urlset>`;
    ended = true;
    
    // Write file to output
    fs.writeFileSync(config.dev.outdir + '/sitemap.xml', xml);
}

//Returns sitemap URL xml for a given page
//MAYBE implement lastmodified (prob not)
function AddURL(url){

    if( url == 'https://thundersmotch.com' ) return;

    xml += `<url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    </url>`;
}