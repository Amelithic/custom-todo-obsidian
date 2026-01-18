/* eslint-disable obsidianmd/ui/sentence-case */
import TodoPlugin from "main";
import { ItemView, TFile, WorkspaceLeaf} from "obsidian";

export const TODO_VIEW_TYPE = "todo-view";

export interface TodoItem {
    text: string;
    file: TFile;
    line: number;
}

export class TodoView extends ItemView {
    plugin: TodoPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: TodoPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return TODO_VIEW_TYPE;
    }

    getDisplayText() {
        return "Todo";
    }

    getIcon() {
        return "gem-icon"; // any Obsidian icon
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        let currentTodoMarker = this.plugin.settings.todoMarker;
        container?.empty();
        container?.createEl("h2", { text: "My Todo View" });
        container?.createEl("p", { text: currentTodoMarker});

        let todos = await this.scanForTodo();
        const todoDiv = container?.createDiv();
        if (todos) {
            for (let todo of todos) {
                todoDiv?.createEl("p", { text : todo.text });
            }
        }
    
    }

    async onClose() {
        // cleanup if needed
    }

    async scanForTodo() {
		//get settings marker value
		const markers = this.plugin.settings.todoMarker
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

        console.log("Markers:", markers);
        console.log("Files scanned:", files.length);
        console.log("Todos found:", todos);

        return todos;
    }
}