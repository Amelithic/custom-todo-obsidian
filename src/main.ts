/* eslint-disable obsidianmd/ui/sentence-case */
import {addIcon, App, Editor, MarkdownView, Modal, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, TodoPluginSettings, TodoSettingsTab} from "./settings";
import { TODO_VIEW_TYPE, TodoView } from "./TodoView";

// Remember to rename these classes and interfaces!

export default class TodoPlugin extends Plugin {
	settings: TodoPluginSettings;

	async onload() {
		await this.loadSettings();

		//TODO: initial scan for todos on load

		//testing icons?
		addIcon('gem-icon', '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.21913 4.3753C5.40891 4.13809 5.69622 4 6 4H12H18C18.3038 4 18.5911 4.13809 18.7809 4.3753L22.7809 9.37531C23.0879 9.75907 23.0705 10.309 22.7399 10.6727L12.7399 21.6727C12.5504 21.8811 12.2817 22 12 22C11.7183 22 11.4496 21.8811 11.2601 21.6727L1.26006 10.6727C0.929475 10.309 0.912125 9.75907 1.21913 9.37531L5.21913 4.3753ZM6.48063 6L4.08063 9H7.51938L9.91938 6H6.48063ZM12 6.60078L10.0806 9H13.9194L12 6.60078ZM14.5723 11H9.4277L12 18.0738L14.5723 11ZM9.32559 16.5715L7.29957 11H4.26055L9.32559 16.5715ZM14.6744 16.5715L16.7004 11H19.7395L14.6744 16.5715ZM19.9194 9H16.4806L14.0806 6H17.5194L19.9194 9Z" fill="currentColor"/></svg>');

		const ribbon = document.querySelector(".workspace-ribbon.mod-left");
		const btn = this.addRibbonIcon("gem-icon", "Todo plugin", () => {
			new Notice(this.settings.todoMarker);
			void this.openTodoTabLeft();
		});
		ribbon?.appendChild(btn); // Move to bottom of ribbon, 'ribbon?' -> optional chaining



		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Number of TODOs:');
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-modal-simple',
			name: 'Open modal (simple)',
			callback: () => {
				new TestModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'replace-selected',
			name: 'Replace selected content',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection('Sample editor command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-modal-complex',
			name: 'Open modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new TestModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			}
		});
		this.addCommand({
			id: "open-todo-view",
			name: "Open Todo View",
			icon: "gem-icon",
			callback: () => {
				void this.openTodoTabLeft();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TodoSettingsTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			new Notice("Click");
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		//this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		this.registerView(
			TODO_VIEW_TYPE,
			(leaf) => new TodoView(leaf, this)
		);


	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<TodoPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async openTodoTabLeft() {
		const leaf = this.app.workspace.getLeftLeaf(false);
		await leaf?.setViewState({
			type: TODO_VIEW_TYPE,
			active: true,
		});
	}

}

class TestModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
