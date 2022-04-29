import * as vscode from 'vscode';
import commands from "./constants/commands";
import PuppeteerBrowser from './PuppeteerBrowser';
import Validator from "validator";

const { DOM_LAUNCH } = commands;

export async function activate(context: vscode.ExtensionContext) {

	let browserInstance: any = null;

	context.subscriptions.push(vscode.commands.registerCommand(DOM_LAUNCH, async() => {
		let url = await vscode.window.showInputBox({prompt: 'Url', placeHolder: 'Url'});
		if (!url) {throw new Error("cancelled");} else if (!Validator.isURL(url)) {throw new Error("Not a valid url")};
		browserInstance = await PuppeteerBrowser.build(url);
		await browserInstance.start();
	}));

	let onSaveCleaner = vscode.workspace.onDidSaveTextDocument(async (e) => {
		await browserInstance.reloadTab();
		await browserInstance.render();
	});
	
	let onCloseCleaner = vscode.workspace.onDidCloseTextDocument(({ fileName }) => {
		onSaveCleaner.dispose();
		onCloseCleaner.dispose();
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
