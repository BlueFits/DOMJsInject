// const cheerio = require('cheerio');
import * as vscode from 'vscode';
import * as cheerio from "cheerio";
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

const WIN_APPDATA = process.env.LOCALAPPDATA || '/';

const DEFAULT_CHROME_PATH = {
    LINUX: '/usr/bin/google-chrome',
    OSX: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    WIN: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    WIN_LOCALAPPDATA: path.join(WIN_APPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
    WINx86: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
};

export const enum Platform {
    Windows, OSX, Linux
}

export function existsSync(path: string): boolean {
    try {
        fs.statSync(path);
        return true;
    } catch (e) {
        return false;
    }
}

export function getPlatform(): Platform {
    const platform = os.platform();
    return platform === 'darwin' ? Platform.OSX :
        platform === 'win32' ? Platform.Windows :
            Platform.Linux;
}

export function getPathToChrome(): string {
    const platform = getPlatform();
    if (platform === Platform.OSX) {
        return existsSync(DEFAULT_CHROME_PATH.OSX) ? DEFAULT_CHROME_PATH.OSX : '';
    } else if (platform === Platform.Windows) {
        if (existsSync(DEFAULT_CHROME_PATH.WINx86)) {
            return DEFAULT_CHROME_PATH.WINx86;
        } else if (existsSync(DEFAULT_CHROME_PATH.WIN)) {
            return DEFAULT_CHROME_PATH.WIN;
        } else if (existsSync(DEFAULT_CHROME_PATH.WIN_LOCALAPPDATA)) {
            return DEFAULT_CHROME_PATH.WIN_LOCALAPPDATA;
        } else {
            return '';
        }
    } else {
        return existsSync(DEFAULT_CHROME_PATH.LINUX) ? DEFAULT_CHROME_PATH.LINUX : '';
    }
}

export const readHTML = (html: string) => {
    const $ = cheerio.load(html);
    return {
        scriptTxt: $("script").html(),
        styleTxt: $("style").html(),
    };
};

export const readFile = async (filePath: any): Promise<string | undefined> => {
    if(!filePath) {
        vscode.window.showErrorMessage("YOUR-EXTENSION: Working folder not found, open a folder an try again");
    } else {
        let file: string = await fs.readFileSync(filePath).toString();
        return file;
    }
}; 