import {
	ExtensionContext,
	WebviewView,
	WebviewViewProvider,
	commands,
} from 'vscode';
import { WorkspaceState } from '../../persistedState/workspaceState';
import { MessageBus, MessageKind } from '../messageBus';
import { View, WebviewMessage } from './webviewEvents';
import { WebviewResolver } from './WebviewResolver';

type ViewProps = Extract<View, { viewId: 'errors' }>['viewProps'];

export class ErrorWebviewProvider implements WebviewViewProvider {
	private readonly __webviewResolver: WebviewResolver;
	private __webviewView: WebviewView | null = null;

	public constructor(
		context: ExtensionContext,
		messageBus: MessageBus,
		private readonly __workspaceState: WorkspaceState,
	) {
		this.__webviewResolver = new WebviewResolver(context.extensionUri);

		messageBus.subscribe(
			MessageKind.codemodSetExecuted,
			async ({ case: kase, executionErrors }) => {
				__workspaceState.setExecutionErrors(kase.hash, executionErrors);

				this.setView();

				if (executionErrors.length !== 0) {
					this.showView();

					await commands.executeCommand('intuitaErrorViewId.focus');
				}
			},
		);

		messageBus.subscribe(MessageKind.clearState, () => {
			__workspaceState.setSelectedCaseHash(null);

			this.setView();
		});
	}

	public resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
		this.__webviewView = webviewView;

		const viewProps = this.__buildViewProps();

		this.__webviewResolver.resolveWebview(
			webviewView.webview,
			'errors',
			JSON.stringify({
				viewProps,
			}),
		);

		this.__webviewView.onDidChangeVisibility(() => {
			const viewProps = this.__buildViewProps();

			this.__webviewResolver.resolveWebview(
				webviewView.webview,
				'errors',
				JSON.stringify({
					viewProps,
				}),
			);
		});
	}

	public showView() {
		this.__webviewView?.show();
	}

	public setView() {
		const viewProps = this.__buildViewProps();

		this.__postMessage({
			kind: 'webview.global.setView',
			value: {
				viewId: 'errors',
				viewProps,
			},
		});
	}

	private __buildViewProps(): ViewProps {
		const caseHash = this.__workspaceState.getSelectedCaseHash();

		const executionErrors =
			caseHash !== null
				? this.__workspaceState.getExecutionErrors(caseHash)
				: [];

		return {
			caseHash,
			executionErrors,
		};
	}

	private __postMessage(message: WebviewMessage) {
		this.__webviewView?.webview.postMessage(message);
	}
}
