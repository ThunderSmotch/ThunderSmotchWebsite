module.exports = {startSitemap, endSitemap, addURL}

const fs = require("fs");

let xml = '';

function startSitemap(){
    xml += `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
}

function endSitemap(){
    xml += `</urlset>`;
    return xml;
}

//Returns sitemap URL xml for a given page
//MAYBE implement lastmodified (prob not)
function addURL(url){

    if( url == 'https://thundersmotch.com' ) return;

    xml += `<url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
</url>`;
}