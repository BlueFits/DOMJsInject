import * as vscode from 'vscode';
import { getPathToChrome, existsSync, readFile, readFilePath, readFolderPath } from "./utils";
import * as pupeteer from 'puppeteer';
import PuppeteerBrowser from './PuppeteerBrowser';
import * as path from "path";
import { PathLike } from "fs";


export default class PuppeteerBrowserLive extends PuppeteerBrowser {

    constructor (page: any, currentlyOpenTabfilePath: any, private jsPath: string) {
        super(page, currentlyOpenTabfilePath);
    };

	static async build(url: string, { watcher }: any) {
		const settings = vscode.workspace.getConfiguration('vscode-devtools-for-chrome');
        const pathToChrome = settings.get('chromePath') as string || getPathToChrome();
		const currentlyOpenTabfilePath = await readFilePath();
		console.log(path.resolve(await readFilePath()));
		const jsPath = path.resolve(await readFilePath());
		
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
		await page.goto(url, { waitUntil: 'load', timeout: 0 });

        return new PuppeteerBrowserLive(page, currentlyOpenTabfilePath, jsPath);
    };


	public async render() {
		try {
			//Read the file
			let bundleScript: string = await readFile(this.jsPath)! as string;

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
			}, bundleScript, "");

			await this.page.$eval("head", () => console.log('%c $$$JS_INJECT: Changes are live', 'background: #222; color: #bada55'));
		} catch(err) {
			throw err;
		}
	};
}