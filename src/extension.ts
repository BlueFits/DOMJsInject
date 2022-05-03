import * as vscode from 'vscode';
import PuppeteerBrowser from './PuppeteerBrowser';
import Validator from "validator";
import * as fs from "fs";

import commands from "./constants/commands";
import templates from "./constants/templates";
import { menu, ES6_TEMPLATE, VANILLA_TEMPLATE } from "./constants/menu";
import { readFilePath } from "./utils";

const { DOM_LAUNCH, GEN_PERS_TEMPLATE } = commands;
const { es6TemplateGen, vanillaTemplateGen } = templates;

export async function activate(context: vscode.ExtensionContext) {

	let browserInstance: any = null;

	const onSaveCleaner = vscode.workspace.onDidSaveTextDocument(async (e) => {
		if (vscode.window.activeTextEditor?.document.uri.fsPath === browserInstance.getFilePath()) {
			await browserInstance.reloadTab();
			await browserInstance.render();
		}
	});

	context.subscriptions.push(vscode.commands.registerCommand(DOM_LAUNCH, async () => {
		let url = await vscode.window.showInputBox({prompt: 'Url', placeHolder: 'Url'});
		if (!url) {throw new Error("cancelled");} else if (!Validator.isURL(url)) {throw new Error("Not a valid url");};
		browserInstance = await PuppeteerBrowser.build(url, { onSaveCleaner });
		await browserInstance.start();
	}));

	context.subscriptions.push(vscode.commands.registerCommand(GEN_PERS_TEMPLATE, async () => {
		let path = await readFilePath();
		let templateRender: any = null;

		const selection = await vscode.window.showQuickPick(menu, { matchOnDetail: true });

		// let fileName = await vscode.window.showInputBox({prompt: 'Please enter the file name e.g. a.html', placeHolder: 'File name'});
		// if (!fileName) {throw new Error("cancelled");};
		let persNum = await vscode.window.showInputBox({prompt: 'Please enter story number', placeHolder: 'story number'});
		if (!persNum) {throw new Error("cancelled");};

		switch (selection?.label) {
			case VANILLA_TEMPLATE:
				templateRender = await vanillaTemplateGen(persNum);
				break;
			case ES6_TEMPLATE:
				templateRender = await es6TemplateGen(persNum);
				break;
		}

		fs.writeFile(path, templateRender, (err: any) => {throw new Error(err);});
		vscode.window.showInformationMessage(`Succesfully created generated template`);
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}