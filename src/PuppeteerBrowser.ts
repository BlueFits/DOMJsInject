import * as vscode from 'vscode';
import { readHTML, getPathToChrome, existsSync, readFile } from "./utils";
import * as pupeteer from 'puppeteer';

export default class PuppeteerBrowser {
	private page: any;
	private currentlyOpenTabfilePath: any;

    constructor (page: any, currentlyOpenTabfilePath: any) {
        if (typeof page === 'undefined') {
            throw new Error('Cannot be called directly');
        } else {
			this.page = page;
			this.currentlyOpenTabfilePath = currentlyOpenTabfilePath;
		}
    }

	static async build(url: string, { onSaveCleaner }: any) {
		const settings = vscode.workspace.getConfiguration('vscode-devtools-for-chrome');
        const pathToChrome = settings.get('chromePath') as string || getPathToChrome();
		const currentlyOpenTabfilePath = vscode.workspace.workspaceFolders !== undefined ? await vscode.window.activeTextEditor?.document.uri.fsPath : null;
		
		if (!pathToChrome || !existsSync(pathToChrome)) {
            vscode.window.showErrorMessage('Chrome was not  found. Chrome must be installed for this extension to function. If you have Chrome installed at a custom location you can specify it in the \'chromePath\' setting.');
            return;
        }

        let browser = await pupeteer.launch({
			executablePath: pathToChrome,
			headless: false,
			devtools: true,
			defaultViewport: null,
		});
		//Event Listeners
		browser.on("targetcreated", async (target: any)=>{
			const page:any = await target.page();
			if(page) {page.close();};
		 });

		 browser.on("disconnected", async () => {
			 console.log("browser disconnected");
			 onSaveCleaner.dispose();
		 });
		//Target first tab
		const pages = await browser.pages();
		const page = pages[0];
		await page.goto(url, { waitUntil: 'load' });

        return new PuppeteerBrowser(page, currentlyOpenTabfilePath);
    }

	public getFilePath(): string {
		return this.currentlyOpenTabfilePath;
	}

	public async start() {
		await this.render();
	}

	public async render() {
		//Read the file
		let file: any = await readFile(this.currentlyOpenTabfilePath);
		//Parse the html
		let { scriptTxt, styleTxt }: any = readHTML(file);

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