'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
let fzfTerminal: vscode.Terminal | undefined = undefined;
let fzfTerminalPwd: vscode.Terminal | undefined = undefined;
export const TERMINAL_NAME = "fzf terminal";
export const TERMINAL_NAME_PWD = "fzf pwd terminal";

function showFzfTerminal(name: string, fzfTerminal: vscode.Terminal | undefined): vscode.Terminal {
	if (!fzfTerminal) {
		// Look for an existing terminal
		fzfTerminal = vscode.window.terminals.find((term) => { return term.name === name; });
	}
	if (!fzfTerminal) {
		// Create an fzf terminal
		let cwd = vscode.workspace.getConfiguration('fzf-quick-open').get('initialWorkingDirectory') as string;

		if (!cwd && vscode.window.activeTextEditor) {
			cwd = path.dirname(vscode.window.activeTextEditor.document.fileName);
		}
		cwd = cwd || '';
		fzfTerminal = vscode.window.createTerminal({
			cwd: cwd,
			name: name
		});
	}
	fzfTerminal.show();
	return fzfTerminal;
}

function moveToPwd(term: vscode.Terminal) {
	if (vscode.window.activeTextEditor) {
		let cwd = path.dirname(vscode.window.activeTextEditor.document.fileName);
		term.sendText(`cd ${cwd}`);
	}
}

export function activate(context: vscode.ExtensionContext) {
	let codeCmd = vscode.workspace.getConfiguration('fzf-quick-open').get('codeCmd') as string ?? "code";
	let codeOpenFileCmd = `fzf --print0 | xargs -0 -r ${codeCmd}`;
	let codeOpenFolderCmd = `fzf --print0 | xargs -0 -r ${codeCmd} -a`;
	context.subscriptions.push(vscode.commands.registerCommand('fzf-quick-open.runFzfFile', () => {
		let term = showFzfTerminal(TERMINAL_NAME, fzfTerminal);
		term.sendText(codeOpenFileCmd, true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fzf-quick-open.runFzfFilePwd', () => {
		let term = showFzfTerminal(TERMINAL_NAME_PWD, fzfTerminalPwd);
		moveToPwd(term);
		term.sendText(codeOpenFileCmd, true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fzf-quick-open.runFzfAddWorkspaceFolder', () => {
		let term = showFzfTerminal(TERMINAL_NAME, fzfTerminal);
		let findCmd = vscode.workspace.getConfiguration('fzf-quick-open').get('findDirectoriesCmd') as string;
		term.sendText(`${findCmd} | ${codeOpenFolderCmd}`, true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fzf-quick-open.runFzfAddWorkspaceFolderPwd', () => {
		let term = showFzfTerminal(TERMINAL_NAME_PWD, fzfTerminalPwd);
		let findCmd = vscode.workspace.getConfiguration('fzf-quick-open').get('findDirectoriesCmd') as string;
		moveToPwd(term);
		term.sendText(`${findCmd} | ${codeOpenFolderCmd}`, true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fzf-quick-open.runFzfSearch', async () => {
		let pattern = await getSearchText();
		if (pattern === undefined) {
			return;
		}
		let term = showFzfTerminal(TERMINAL_NAME, fzfTerminal);
		term.sendText(makeSearchCmd(pattern, codeCmd), true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fzf-quick-open.runFzfSearchPwd', async () => {
		let pattern = await getSearchText();
		if (pattern === undefined) {
			return;
		}
		let term = showFzfTerminal(TERMINAL_NAME_PWD, fzfTerminalPwd);
		moveToPwd(term);
		term.sendText(makeSearchCmd(pattern, codeCmd), true);
	}));

	vscode.window.onDidCloseTerminal((terminal) => {
		switch (terminal.name) {
			case TERMINAL_NAME:
				fzfTerminal = undefined;
				break;

			case TERMINAL_NAME_PWD:
				fzfTerminalPwd = undefined
				break;
		}
	});
}

async function getSearchText(): Promise<string | undefined> {
	let pattern = await vscode.window.showInputBox({
		prompt: "Search pattern"
	});
	return pattern;
}

function makeSearchCmd(pattern: string, codeCmd: string): string {
	return `rg ${pattern} --vimgrep --color ansi | fzf --ansi --print0 | cut -z -d : -f 1-3 | xargs -0 -r ${codeCmd} -g`;
}