import * as vscode from 'vscode';
import { readHTML, getPathToChrome, existsSync } from "./utils";

const fs = require("fs");
const pupeteer = require("puppeteer");

export default class PuppeteerBrowser {
	private page: any;

    constructor (page: any) {
        if (typeof page === 'undefined') {
            throw new Error('Cannot be called directly');
        } else {
			this.page = page;
		}
    }

	static async build(url: string) {
		const settings = vscode.workspace.getConfiguration('vscode-devtools-for-chrome');
        const pathToChrome = settings.get('chromePath') as string || getPathToChrome();

		if (!pathToChrome || existsSync(pathToChrome)) {
            vscode.window.showErrorMessage('Chrome was not found. Chrome must be installed for this extension to function. If you have Chrome installed at a custom location you can specify it in the \'chromePath\' setting.');
            return;
        }

        let browser = await pupeteer.launch({
			executablePath: pathToChrome,
			headless: false,
			devtools: true,
			defaultViewport: null,
		});

		browser.on("targetcreated", async (target: any)=>{
			const page:any = await target.page();
			if(page) {page.close()};
		 });

		const pages = await browser.pages();
		const page = pages[0];
		await page.goto(url, { waitUntil: 'load' });

        return new PuppeteerBrowser(page);
    }

	private async readFile() {
		try {
			if(vscode.workspace.workspaceFolders !== undefined) {
				let currentlyOpenTabfilePath = await vscode.window.activeTextEditor?.document.uri.fsPath;
				let file: string = await fs.readFileSync(currentlyOpenTabfilePath).toString();
				return readHTML(file);
			} else {
				let message = "YOUR-EXTENSION: Working folder not found, open a folder an try again" ;
				vscode.window.showErrorMessage(message);
			}
		} catch (err) {
			throw err;
		}
	}

	public async start() {
		await this.render();
	}

	public async render() {
		let { scriptTxt, styleTxt }:any = await this.readFile();
		await this.page.$eval("head", (elem: any) => { 
			let script = document.createElement("script");
			let style = document.createElement("style");
			script.id="inject_script_id";
			style.id="inject_style_id";
			script.type = "text/javascript";			
			elem.appendChild(style);
			elem.appendChild(script);
		});
		await this.page.$eval("#inject_style_id", (elem: any, styleTxt: string) => elem.innerHTML = styleTxt , styleTxt);
		await this.page.$eval("#inject_script_id", (elem: any, scriptTxt: string) => elem.innerHTML = scriptTxt , scriptTxt);
		await this.page.$eval("head", () => console.log('%c $$$JS_INJECT: Changes are live', 'background: #222; color: #bada55'));

	}

	public async reloadTab () {
		await this.page.reload({ waitUntil: 'load' });
	}
}