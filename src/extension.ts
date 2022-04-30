import * as vscode from 'vscode';
import commands from "./constants/commands";
import PuppeteerBrowser from './PuppeteerBrowser';
import Validator from "validator";

const { DOM_LAUNCH } = commands;

export async function activate(context: vscode.ExtensionContext) {

	let browserInstance: any = null;

	const onSaveCleaner = vscode.workspace.onDidSaveTextDocument(async (e) => {
		if (vscode.window.activeTextEditor?.document.uri.fsPath === browserInstance.getFilePath()) {
			await browserInstance.reloadTab();
			await browserInstance.render();
		}
	});

	context.subscriptions.push(vscode.commands.registerCommand(DOM_LAUNCH, async() => {
		let url = await vscode.window.showInputBox({prompt: 'Url', placeHolder: 'Url'});
		if (!url) {throw new Error("cancelled");} else if (!Validator.isURL(url)) {throw new Error("Not a valid url");};
		browserInstance = await PuppeteerBrowser.build(url, { onSaveCleaner });
		await browserInstance.start();
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
