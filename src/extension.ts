import * as vscode from 'vscode';
import PuppeteerBrowser from './PuppeteerBrowser';
import Validator from "validator";
import * as fs from "fs";
import * as cheerio from "cheerio";
import * as parsePath from "parse-filepath";


import commands from "./constants/commands";
import templates from "./constants/templates";
import { menu, ES6_TEMPLATE, VANILLA_TEMPLATE, PERS_COOKIE_TEMPLATE } from "./constants/menu";
import { readFilePath, readFile, readHTML, readFolderPath } from "./utils";

const { DOM_LAUNCH, GEN_PERS_TEMPLATE, GEN_CDB_FILES } = commands;
const { es6TemplateGen, vanillaTemplateGen, persCookieTemplateGen } = templates;

export async function activate(context: vscode.ExtensionContext) {

	let browserInstance: any = null;

	//Methods
	const reloadAction = async (e: any) => {
		if (vscode.window.activeTextEditor?.document.uri.fsPath === browserInstance.getFilePath()) {
			await browserInstance.reloadTab();
			await browserInstance.render();
		}
	};

	//Commands
	context.subscriptions.push(vscode.commands.registerCommand(GEN_CDB_FILES, async () => {
		const currentlyOpenTabfilePath = await readFilePath();
		const file: any = await readFile(currentlyOpenTabfilePath);
		const scriptData: any = eval(readHTML(file).scriptTxt);
		const pathInfo =  parsePath(currentlyOpenTabfilePath);
		const folderDir = `${pathInfo.dir}/${pathInfo.name}_files`;

		//Extract object props
		for (let fileProp of scriptData) {
			const prop:string[] = Object.keys(fileProp.var);
			const directProp = Object.keys(fileProp.direct);
			const $ = cheerio.load(file);
			// const $original = cheerio.load(file);
			$('script').remove();

			let modifiedHTML:string | null = null;

			for (const varProp of prop) {
				let value = fileProp.var[varProp];
				$(`[$var_${varProp}]`).html(value);
				$(`[$var_${varProp}]`).removeAttr(`$var_${varProp}`);
				modifiedHTML = $.html();
			}

			for (const directPropName of directProp) {
				let replace = "direct__" + directPropName;
				let re = new RegExp(replace, "g");
				modifiedHTML = modifiedHTML && modifiedHTML.replace(re, fileProp.direct[directPropName]);
			}

			//Compensate for cheerio bug 
			modifiedHTML = modifiedHTML && modifiedHTML?.replace(/<head>/g, "");
			modifiedHTML = modifiedHTML && modifiedHTML?.replace(/<\/head>/g, "");
			modifiedHTML = modifiedHTML && modifiedHTML?.replace(/<html>/g, "");
			modifiedHTML = modifiedHTML && modifiedHTML?.replace(/<\/html>/g, "");
			modifiedHTML = modifiedHTML && modifiedHTML?.replace(/<body>/g, "");
			modifiedHTML = modifiedHTML && modifiedHTML?.replace(/<\/body>/g, "");

			if (!modifiedHTML) { console.log("Value is null"); return;};
			if (!fs.existsSync(folderDir)) {fs.mkdirSync(folderDir);};
			fs.writeFileSync(`${folderDir}/${fileProp.name}.html`, modifiedHTML);
			vscode.window.showInformationMessage("Successfully generated files");
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand(DOM_LAUNCH, async () => {
		let url = await vscode.window.showInputBox({prompt: 'Url', placeHolder: 'Url'});
		if (!url) {throw new Error("cancelled");} else if (!Validator.isURL(url)) {throw new Error("Not a valid url");};
		const onSaveCleaner = vscode.workspace.onDidSaveTextDocument(reloadAction);
		browserInstance = await PuppeteerBrowser.build(url, { onSaveCleaner });
		await browserInstance.start();
	}));

	context.subscriptions.push(vscode.commands.registerCommand(GEN_PERS_TEMPLATE, async () => {
		let templateRender: any = null;
		const selection = await vscode.window.showQuickPick(menu, { matchOnDetail: true });
		let persNum = await vscode.window.showInputBox({prompt: 'Please enter story number', placeHolder: 'story number'});
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
		vscode.window.showInformationMessage(`Succesfully created generated template`);
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}