import * as vscode from 'vscode';
import { readHTML, getPathToChrome, existsSync, readFile, readFilePath } from "./utils";
import * as pupeteer from 'puppeteer';

export default class PuppeteerBrowser {
	protected page: any;
	protected currentlyOpenTabfilePath: any;

    constructor (page: any, currentlyOpenTabfilePath: any) {
        if (typeof page === 'undefined') {
            throw new Error('Cannot be called directly');
        } else {
			this.page = page;
			this.currentlyOpenTabfilePath = currentlyOpenTabfilePath;
		}
    };

	static async build(url: string, { watcher }: any) {
		const settings = vscode.workspace.getConfiguration('vscode-devtools-for-chrome');
        const pathToChrome = settings.get('chromePath') as string || getPathToChrome();
		const currentlyOpenTabfilePath = await readFilePath();
		
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
			 watcher.close();
		 });
		//Target first tab
		const pages = await browser.pages();
		const page = pages[0];
		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15 * 1000 });

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

		if (linkTags.length > 0) {
			await this.page.$eval("head", () => console.log('%c $$$JS_INJECT: Loading Additional Link Tags', 'background: #222; color: #bada55'));
			this.createAsyncTag(linkTags, "href", "link");
		}
		if (scriptWithSrc.length > 0) {
			await this.page.$eval("head", () => console.log('%c $$$JS_INJECT: Loading Additional Script Tags', 'background: #222; color: #bada55'));
			this.createAsyncTag(scriptWithSrc, "src", "script");
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
	//Used in render to create network fetching scripts or links
	public async createAsyncTag (tag: any, prop: string, block: string) {
		await this.page.$eval("head", (elem: any, tag: any, prop: string, block: string) => {
			for (let val of tag) {
				let createdTag: any = document.createElement(block);
				if (val.id) {createdTag.id = val.id;};
				if (block === "link") { 
					createdTag.rel = "stylesheet"; 
					createdTag.type = 'text/css'; 
				} else if (block === "script") {
					createdTag.type = "text/javascript";
				}
				createdTag[prop] = val[prop];
				elem.appendChild(createdTag);
			}
		}, tag, prop, block);
		if (tag[tag.length - 1].id) {await this.page.waitForSelector(`#${tag[tag.length - 1].id}`)};
	};
}