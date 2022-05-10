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
    };

	static async build(url: string, { onSaveCleaner }: any) {
		const settings = vscode.workspace.getConfiguration('vscode-devtools-for-chrome');
        const pathToChrome = settings.get('chromePath') as string || getPathToChrome();
		const currentlyOpenTabfilePath = vscode.workspace.workspaceFolders !== undefined ? await vscode.window.activeTextEditor?.document.uri.fsPath : null;
		
		if (!pathToChrome || !existsSync(pathToChrome)) {
            vscode.window.showErrorMessage('Chrome was not  found. Chrome must be installed for this extension to function. If you have Chrome installed at a custom location you can specify it in the \'chromePath\' setting.');
            return;
        };

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
			 onSaveCleaner.dispose();
		 });
		//Target first tab
		const pages = await browser.pages();
		const page = pages[0];
		await page.goto(url, { waitUntil: 'load' });

        return new PuppeteerBrowser(page, currentlyOpenTabfilePath);
    };

	public getFilePath(): string {
		return this.currentlyOpenTabfilePath;
	};

	public async start() {
		await this.render();
	};

	public async render() {
		//Read the file
		let file: any = await readFile(this.currentlyOpenTabfilePath);
		//Parse the html
		let { scriptWithSrc, scriptTxt, styleTxt, linkTags }: any = readHTML(file);
		if (scriptWithSrc.length > 0) {
			await this.page.$eval("head", () => console.log('%c $$$JS_INJECT: Loading Additional Script Tags', 'background: #222; color: #bada55'));
			await this.page.$eval("head", (elem: any, scriptWithSrc: any) => {
				for (let val of scriptWithSrc) {
					let scriptSrc = document.createElement("script");
					if (val.id) {scriptSrc.id = val.id;};
					scriptSrc.src = val.src;
					elem.appendChild(scriptSrc);
				}
			}, scriptWithSrc);
			if (scriptWithSrc[scriptWithSrc.length - 1]) {await this.page.waitForSelector(`#${scriptWithSrc[scriptWithSrc.length - 1].id}`);};
		}
		if (linkTags.length > 0) {
			console.log(Boolean(linkTags[linkTags.length - 1].id));
			await this.page.$eval("head", () => console.log('%c $$$JS_INJECT: Loading Additional Link Tags', 'background: #222; color: #bada55'));
			await this.page.$eval("head", (elem: any, linkTags: any) => {
				for (let val of linkTags) {
					let linkTag = document.createElement("link");
					if (val.id) {linkTag.id = val.id;};
					linkTag.href = val.href;
					elem.appendChild(linkTag);
				}
			}, linkTags);
			if (linkTags[linkTags.length - 1].id) {await this.page.waitForSelector(`#${linkTags[linkTags.length - 1].id}`);};
		}
		if (linkTags.length > 0 || scriptWithSrc.length > 0) {
			// await this.page.waitForNavigation();
			await this.page.waitForTimeout(1000);
		}
		await this.page.$eval("head", (elem: any, scriptTxt: any, styleTxt: any) => { 
			let script = document.createElement("script");
			let style = document.createElement("style");
			style.id = "inject_style_id";
			style.innerHTML = styleTxt;
			script.id="inject_script_id";
			script.type = "text/javascript";	
			script.text = scriptTxt;
			elem.appendChild(style);
			elem.appendChild(script);
		}, scriptTxt, styleTxt);
		await this.page.$eval("head", () => console.log('%c $$$JS_INJECT: Changes are live', 'background: #222; color: #bada55'));
	};

	public async reloadTab () {
		await this.page.reload({ waitUntil: 'load' });
	};
}