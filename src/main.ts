/* eslint-disable obsidianmd/ui/sentence-case */
import {addIcon, App, Editor, MarkdownView, Modal, Notice, Plugin, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, TodoPluginSettings, TodoSettingsTab} from "./settings";
import { TODO_VIEW_TYPE, TodoView } from "./TodoView";

export interface TodoItem {
	text: string;
	file: TFile;
	line: number;
}

export default class TodoPlugin extends Plugin {
	settings: TodoPluginSettings;
	refreshCallbacks: Set<() => void> = new Set(); //list of functions to refresh the view
	statusBarEl: HTMLElement;

	async onload() {
		//load settings and add settings tab
		await this.loadSettings();
		this.addSettingTab(new TodoSettingsTab(this.app, this));

		//create status bar
		this.statusBarEl = this.addStatusBarItem();
		this.statusBarEl.setText("Todos: 0");

		//create todo view button
		addIcon('gem-icon', '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.21913 4.3753C5.40891 4.13809 5.69622 4 6 4H12H18C18.3038 4 18.5911 4.13809 18.7809 4.3753L22.7809 9.37531C23.0879 9.75907 23.0705 10.309 22.7399 10.6727L12.7399 21.6727C12.5504 21.8811 12.2817 22 12 22C11.7183 22 11.4496 21.8811 11.2601 21.6727L1.26006 10.6727C0.929475 10.309 0.912125 9.75907 1.21913 9.37531L5.21913 4.3753ZM6.48063 6L4.08063 9H7.51938L9.91938 6H6.48063ZM12 6.60078L10.0806 9H13.9194L12 6.60078ZM14.5723 11H9.4277L12 18.0738L14.5723 11ZM9.32559 16.5715L7.29957 11H4.26055L9.32559 16.5715ZM14.6744 16.5715L16.7004 11H19.7395L14.6744 16.5715ZM19.9194 9H16.4806L14.0806 6H17.5194L19.9194 9Z" fill="currentColor"/></svg>');
		this.addRibbonIcon("gem-icon", "Todo plugin", () => {
			void this.openTodoTabLeft();
		});

		/* COMMANDS */
		this.addCommand({
			id: "open-todo-view",
			name: "Open Todo View",
			icon: "gem-icon",
			callback: () => {
				void this.openTodoTabLeft();
			}
		});

		/* EVENTS */
		//Live update todo count
        this.registerEvent(
            this.app.vault.on("modify", async () => {
                await this.updateTodoCount();
                this.triggerRefresh();
            })
        );

        this.registerEvent(
            this.app.vault.on("create", async () => {
                await this.updateTodoCount();
                this.triggerRefresh();
            })
        );

        this.registerEvent(
            this.app.vault.on("delete", async () => {
                await this.updateTodoCount();
                this.triggerRefresh();
            })
        );

		// REGISTER VIEW 
		this.registerView(
			TODO_VIEW_TYPE,
			(leaf) => new TodoView(leaf, this)
		);
	}

	onunload() {
		console.warn("Todo Plugin unloaded...");
	}

	// REFRESH SYSTEM FOR LIVE UPDATING LOGIC
    registerRefreshCallback(cb: () => void) {
        this.refreshCallbacks.add(cb);
    }

    unregisterRefreshCallback(cb: () => void) {
        this.refreshCallbacks.delete(cb);
    }

    triggerRefresh() {
        for (const cb of this.refreshCallbacks) {
            cb();
        }
    }

	//TODO SCANNING LOGIC
	async scanForTodo(): Promise<TodoItem[]> {
		//get settings marker value
		const markers = this.settings.todoMarker
            .split(',')
            .map(m => m.trim()) //remove trailing spaces for each
            .filter(m => m.length > 0);
		const files = this.app.vault.getMarkdownFiles();

		let todos: TodoItem[] = []; //blank TodoItem array

		for (const file of files) {
			const content = await this.app.vault.read(file); //files content
            const lines = content.split("\n");

            //scan each line
            lines.forEach((line, index) => {
                for (let marker of markers) {
                    if (line.includes(marker)) {
                        todos.push({
                            text: line.trim(),
                            file,
                            line: index + 1, // human-readable line numbers
                        });
                    }
                }
                
            });
	    }

        /* //DEBUG
        console.log("Markers:", markers);
        console.log("Files scanned:", files.length);
        console.log("Todos found:", todos);
		*/

		this.statusBarEl.setText('TODOs: '+todos.length);
        return todos;
    }

	async updateTodoCount() {
		const todos = await this.scanForTodo();
		this.statusBarEl.setText(`Todos: ${todos.length}`);
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