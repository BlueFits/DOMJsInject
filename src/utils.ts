const cheerio = require('cheerio');

export const readHTML = (html: string) => {
    const $ = cheerio.load(html);
    return {
        scriptTxt: $("script").html(),
        styleTxt: $("style").html(),
    };
};