import { workspace, Uri } from "vscode";
import nodeFs from "fs";
import { errorsLibrary } from "./errors";
import { Path } from "./paths";

export type OVpFileSystem = {};
export default class VpFileSystem {
	constructor(
		private cfg: OVpFileSystem,
		private errors: ReturnType<typeof errorsLibrary>,
		private fs = workspace.fs,
		public nfs = nodeFs,
	) {}

	// thenables 🕮 <cyberbiont> 214f5bb7-b6dc-4ff6-b9f5-3d0142e9addd.md

	async rename(source: Path, target: Path) {
		// return this.nfs.promises.rename(source, target);
		return this.fs.rename(Uri.parse(source.href), Uri.parse(target.href), {
			overwrite: true,
		});
	}

	// async readDirectory(folder: Uri) {
	// 	return this.fs.readDirectory(folder);
	// }
	async readDirectory(dir: Path) {
		return this.nfs.promises.readdir(dir, { withFileTypes: true });
	}

	// async copy(src: Uri, dest: Uri) {
	// 	return this.fs.copy(src, dest, {
	// 		overwrite: false,
	// 	});
	// 	// 🕮 <cyberbiont> 33210c89-b69a-40a1-9b5e-7cea25bf1b15.md
	// }

	async copy(src: Path, dest: Path) {
		return this.nfs.promises.copyFile(src, dest);
	}

	// async delete(folder: Uri) {
	// 	return this.fs.delete(folder, {
	// 		recursive: true,
	// 		useTrash: true,
	// 	});
	// }

	async delete(location: Path) {
		// return this.nfs.promises.unlink(location);
		// у Ноды возникает EPERM при удалении и копировании (rename)...
		// возможно дело в том что все находится в юзерской папке, а node не от имени администратора работает?

		return this.fs.delete(Uri.parse(location.href), {
			recursive: true,
			useTrash: true,
		});
	}

	async createDirectory(dir: Path) {
		//! 🕮 <cyberbiont> 13061c0b-4283-410f-9d66-1ab5ef079e02.md
		return this.nfs.promises.mkdir(dir);
	}

	// SYMLINK methods (nodeJS)
	async symlinkDelete(location: Path) {
		return this.nfs.promises.unlink(location);
		// 🕮 <cyberbiont> 528c6ebe-64da-4a29-88c7-574b92ba5d1e.md
	}

	async symlinkCreate(shouldPointTo: string, location: Path) {
		const type = process.platform === `win32` ? `junction` : `dir`;
		return this.nfs.promises.symlink(shouldPointTo, location, type);
		// 🕮 <cyberbiont> 13748a26-b142-4e10-b218-e8954eecd6e1.md
		//! 🕮 <cyberbiont> fb0bb676-d894-42c9-ab28-be6b527427fa.md
	}

	async symlinkCopy(src: Path, dest: Path) {
		const linkValue = await this.symlinkRead(src);
		return this.symlinkCreate(linkValue, dest);
	}

	async symlinkSwitch(shouldPointTo: string, location: Path) {
		const currentlyPointsTo = await this.symlinkRead(location).catch((e) => {
			if (e.code === `ENOENT`) {
				throw new this.errors.MissingSymlink(
					`no symlink found in themes folder`,
				);
			}
			throw e;
		});
		// 🕮 <cyberbiont> 4e1c4e69-1d88-4cfd-b71d-444bda8585a1.md
		if (currentlyPointsTo !== shouldPointTo) {
			console.info(`pointing symlink to ${shouldPointTo}`);
			await this.symlinkDelete(location);
			await this.symlinkCreate(shouldPointTo, location);
		} else {
			throw new this.errors.SymlinkExists();
		}
	}

	async symlinkRead(location: Path) {
		let value = await this.nfs.promises.readlink(location);
		if (value.endsWith(`\\`)) value = value.slice(0, -1); // исправлляем глюк с обратным слэшем в конце, см. про fs.symlink
		return value;
	}

	// 🕮 <cyberbiont> 7b4e7c7c-f0e5-4244-809d-6ee4696b9bf4.md
}
