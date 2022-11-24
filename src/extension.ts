import * as vscode from 'vscode';
import PuppeteerBrowser from './PuppeteerBrowser';
import PuppeteerBrowserLive from './PuppeteerBrowserLive';
import Validator from "validator";
import * as fs from "fs";
import * as cheerio from "cheerio";
import * as parsePath from "parse-filepath";
import * as chokidar from "chokidar";

import commands from "./constants/commands";
import templates from "./constants/templates";
import { menu, ES6_TEMPLATE, VANILLA_TEMPLATE, PERS_COOKIE_TEMPLATE } from "./constants/menu";
import { readFilePath, readFile, readHTML } from "./utils";
import cdbMakePropTemp from "./constants/templates/cdb/cdb_make_prop_temp";

const { DOM_LAUNCH, GEN_PERS_TEMPLATE, GEN_CDB_FILES, CDB_MAKE_PROP, DOM_LIVE } = commands;
const { es6TemplateGen, vanillaTemplateGen, persCookieTemplateGen } = templates;

export async function activate(context: any) {

	let browserInstance: any = null;

	//Methods
	const reloadAction = async () => {
		await browserInstance.reloadTab();
		await browserInstance.render();
	};

	//Commands
	context.subscriptions.push((vscode as any).commands.registerCommand(CDB_MAKE_PROP, async () => {
		const currentlyOpenTabfilePath = await readFilePath();
		const file: any = await readFile(currentlyOpenTabfilePath);
		const txts = file.split(/;| /).filter((val: string) => (val.includes("$var_") || val.includes("direct__")));
		let varArg = ``;
		let directArg = ``;
		for (const txt of txts) {
			if (txt[0] === "$") {
				const prop = txt.slice(5) + ': "",';
				varArg = varArg + (prop.trim() + " ");
			} 
			else if (txt[0] === "d") {
				const prop = txt.slice(8) + ': "",';
				directArg = directArg + (prop.trim()+ " ");
			}
		}
		fs.appendFileSync(currentlyOpenTabfilePath, cdbMakePropTemp(varArg, directArg));
		(vscode as any).window.showInformationMessage("Successfully created props");
	}));

	context.subscriptions.push((vscode as any).commands.registerCommand(GEN_CDB_FILES, async () => {
		const currentlyOpenTabfilePath = await readFilePath();
		const file: any = await readFile(currentlyOpenTabfilePath);
		const scriptData: any = eval(readHTML(file).scriptTxt);
		const pathInfo =  parsePath(currentlyOpenTabfilePath);
		const folderDir = `${pathInfo.dir}/${pathInfo.name}_files`;

		for (let fileProp of scriptData) {
			const prop:string[] = fileProp && fileProp.var && Object.keys(fileProp.var);
			const directProp: string[] = fileProp && fileProp.direct && Object.keys(fileProp.direct);
			const $ = cheerio.load(file, {});
			$('script').remove();
			let modifiedHTML:string | null = null;
			if (!prop) {throw new Error("Must have a var property in object file");}
			for (const varProp of prop) {
				let value = fileProp.var[varProp];
				$(`[$var_${varProp}]`).html(value);
				$(`[$var_${varProp}]`).removeAttr(`$var_${varProp}`);
				modifiedHTML = $.html();
			}
			if (directProp) {
				for (const directPropName of directProp) {
					let replace = "direct__" + directPropName;
					let re = new RegExp(replace, "g");
					modifiedHTML = modifiedHTML && modifiedHTML.replace(re, fileProp.direct[directPropName]);
				}
			}
			if (!modifiedHTML) { console.log("Value is null"); return;};
			if (!fs.existsSync(folderDir)) {fs.mkdirSync(folderDir);};
			fs.writeFileSync(`${folderDir}/${fileProp.name}.html`, modifiedHTML);
		}

		(vscode as any).window.showInformationMessage("Successfully generated files");
	}));

	context.subscriptions.push((vscode as any).commands.registerCommand(DOM_LAUNCH, async () => {
		let url = await (vscode as any).window.showInputBox({prompt: 'Url', placeHolder: 'Url'});
		if (!url) {throw new Error("cancelled");} else if (!Validator.isURL(url)) {throw new Error("Not a valid url");};
		const watcher = chokidar.watch(await readFilePath(), {ignored: /^\./, persistent: true});
        watcher
		.on('change', async function(path: any) {
			reloadAction();
			console.log('File', path, 'has been updated');
		})
		.on('error', function(error: any) {console.error('Error happened', error);});
		browserInstance = await PuppeteerBrowser.build(url, { watcher });
		await browserInstance.start();
	}));

	context.subscriptions.push((vscode as any).commands.registerCommand(DOM_LIVE, async () => {
		let url = await (vscode as any).window.showInputBox({prompt: 'Url', placeHolder: 'Url'});
		if (!url) {throw new Error("cancelled");} else if (!Validator.isURL(url)) {throw new Error("Not a valid url");};
		const watcher = chokidar.watch(await readFilePath(), {ignored: /^\./, persistent: true});
        watcher
		.on('change', async function(path: any) {
			reloadAction();
			console.log('File', path, 'has been updated');
		})
		.on('error', function(error: any) {console.error('Error happened', error);});
		browserInstance = await PuppeteerBrowserLive.build(url, { watcher });
		await browserInstance.start();
	}));

	context.subscriptions.push((vscode as any).commands.registerCommand(GEN_PERS_TEMPLATE, async () => {
		let templateRender: any = null;
		const selection = await (vscode as any).window.showQuickPick(menu, { matchOnDetail: true });
		let persNum = await (vscode as any).window.showInputBox({prompt: 'Please enter story number', placeHolder: 'story number'});
		if (!persNum) {throw new Error("cancelled");};
		switch (selection?.label) {
			case VANILLA_TEMPLATE:
				templateRender = await vanillaTemplateGen(persNum);
				break;
			case ES6_TEMPLATE:
				templateRender = await es6TemplateGen(persNum);
				break;
			case PERS_COOKIE_TEMPLATE:
				templateRender = await persCookieTemplateGen(persNum);
		}
		fs.writeFile(await readFilePath(), templateRender, (err: any) => {throw new Error(err);});
		(vscode as any).window.showInformationMessage(`Succesfully created generated template`);
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}