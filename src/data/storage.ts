import type { WebStorage } from 'redux-persist';
import { Memento } from 'vscode';
import { deflate, unzip } from 'node:zlib';
import { promisify } from 'node:util';

const asyncDeflate = promisify(deflate);
const asyncUnzip = promisify(unzip);

// redux-persists storage impl for vscode memento
class MementoStorage implements WebStorage {
	constructor(private readonly __memento: Memento) {}

	public async getItem(key: string): Promise<string | null> {
		const storedValue = this.__memento.get(key);

		if (typeof storedValue !== 'string') {
			return null;
		}

		const oldBuffer = Buffer.from(storedValue, 'base64url');
		const newBuffer = await asyncUnzip(oldBuffer);

		return newBuffer.toString('utf8');
	}

	public async setItem(key: string, value: string): Promise<void> {
		const oldBuffer = Buffer.from(value, 'utf8');
		const newBuffer = await asyncDeflate(oldBuffer, {});

		this.__memento.update(key, newBuffer.toString('base64url'));
	}

	public removeItem(key: string): Promise<void> {
		return new Promise((resolve) => {
			this.__memento.update(key, void 0);

			resolve();
		});
	}

	public getAllKeys(): Promise<ReadonlyArray<string>> {
		return new Promise((resolve) => {
			const allKeys = this.__memento.keys();

			resolve(allKeys);
		});
	}
}

export default MementoStorage;
