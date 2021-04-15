import { FileSystemError, window } from 'vscode';

import VpOutputChannel from './outputChannel';

// 🕮 <cyberbiont> f175e603-9464-4bba-b55f-9a632dce8b1e.md
//! 🕮 <cyberbiont> 34741669-bb92-42b3-a9d4-3d9ef3e9f04d.md
export class ErrorHandlers {
	async error(err: Error) {
		console.log(err);
		// throw new Error();
	}

	async cancel(err: Error) {
		console.log(err);
		window.showErrorMessage(err.message);
		throw err;
	}

	async resume(err: Error) {
		// log and continue
		console.log(err);
		window.showWarningMessage(err.message);
	}
}

export default class Errors {
	constructor(public channel: VpOutputChannel) {}

	public VpError = class VpError extends Error {
		readonly name = this.constructor.name;
		constructor(public rootThis: Errors, message: string = ``) {
			super(message);
			this.rootThis.channel.appendLine(message);
		}
	}.bind(null, this);

	public InteractionError = class InteractionError extends this.VpError {
		constructor(
			message = ``,
			public description = `User hasn't provided input.`,
		) {
			super(`${description} ${message}`);
			this.rootThis.channel.appendLine(`${description} ${message}`);
		}
	};

	public SwapperSymlinkError = class SwapperSymlinkError extends this.VpError {
		constructor(
			message = ``,
			public description = `It seems that thare's a problem with "extensions" symlink`,
		) {
			super(`${description} ${message}`);
			this.rootThis.channel.appendLine(`${description} ${message}`);
		}
	};

	public BrokenSymlink = class BrokenSymlinkError extends this
		.SwapperSymlinkError {
		constructor(
			message = ``,
			public description = `It seems that "extensions" symlink is broken`,
		) {
			super(`${description} ${message}`);
			this.rootThis.channel.appendLine(`${description} ${message}`);
		}
	};

	public MissingSymlink = class MissingSymlinkError extends this
		.SwapperSymlinkError {
		constructor(
			message = ``,
			public description = `It seems that "extensions" symlink is missing (or the folder is wrongly named).`,
		) {
			super(`${description} ${message}`);
			this.rootThis.channel.appendLine(`${description} ${message}`);
		}
	};

	public IsDirectory = class IsDirectoryError extends this.SwapperSymlinkError {
		constructor(
			message = ``,
			public description = `It seems that there is a normal directory in place of "extensions" symlink.`,
		) {
			super(`${description} ${message}`);
			this.rootThis.channel.appendLine(`${description} ${message}`);
		}
	};

	public SymlinkExists = class SymlinkExistsError extends this
		.SwapperSymlinkError {
		constructor(
			message = ``,
			public description = `It seems that "extensions" symlink already exists and points to this folder.`,
		) {
			super(`${description} ${message}`);
			this.rootThis.channel.appendLine(`${description} ${message}`);
		}
	};

	public MissingProfilesFolder = class MissingProfilesFolderError extends this
		.VpError {
		constructor(
			message = ``,
			public description = `Profile folder was not found.`,
		) {
			super(`${description} ${message}`);
			this.rootThis.channel.appendLine(`${description} ${message}`);
		}
	};

	public NoProfiles = class NoProfilesError extends this.VpError {
		constructor(message = ``, public description = `No profiles found.`) {
			super(`${description} ${message}`);
			this.rootThis.channel.appendLine(`${description} ${message}`);
		}
	};

	// !🕮 <cyberbiont> bbef93f9-e41c-4dea-aaf8-f3010cdbc0c6.md
	instanceOfNodeError<T extends new (...args: any) => Error>(
		value: Error,
		errorType: T,
	): value is InstanceType<T> & NodeJS.ErrnoException {
		return value instanceof errorType;
	}
}

// 🕮 <cyberbiont> 90b91af8-0eb6-45bc-b665-fbff110cb2bc.md
