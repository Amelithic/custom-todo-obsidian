/* eslint-disable obsidianmd/ui/sentence-case */
import TodoPlugin, { TodoItem } from "main";
import { ItemView, MarkdownView, WorkspaceLeaf} from "obsidian";

export const TODO_VIEW_TYPE = "todo-view";

export class TodoView extends ItemView {
    plugin: TodoPlugin;
    private refreshCallback: () => void;

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
        //register refresh
        this.refresh = this.refresh.bind(this);
        this.refreshCallback = () => { void this.refresh(); }; //store callback for later
        this.plugin.registerRefreshCallback(this.refreshCallback);

        //initial refresh / load UI
        void this.refresh();
    }

    async onClose() {
        this.plugin.unregisterRefreshCallback(this.refreshCallback);
    }

    async refresh() {
        const container = this.containerEl.children[1];
        if (!container) return;

        const markers = this.plugin.settings.todoMarker
                    .split(',')
                    .map(m => m.trim()) //remove trailing spaces for each
                    .filter(m => m.length > 0);
        container?.empty();
        container?.createEl("h2", { text: "Current TODOs:" });

        //current markers text
        let markerText = "Currently searching for TODOs with these markers: ";
        for (let i=0; i < markers.length; i++) {
            markerText += markers[i];

            if (markers.length > i+1) markerText += ", ";

        }
        container?.createEl("p", { text: markerText});
        container?.createEl("hr");

        let todos = await this.plugin.scanForTodo();
        const todoDiv = container?.createDiv({cls: "todoDiv"});
        if (todos) {
            for (let todo of todos) {
                let todoElDiv = todoDiv?.createDiv();
                todoElDiv?.createEl("h4", { cls: "todoItemTitle", text : todo.text });
                todoElDiv?.createEl("p", { cls: "todoItemLocation", text : todo.file.name+" -> Line: "+todo.line });

                todoElDiv.onclick = () => {
                    void this.openTodoInEditor(todo);
                }
            }
        }
    }

    async openTodoInEditor(todo: TodoItem) {
        const { file, line } = todo;

        // Open the file in the main workspace
        const leaf = this.app.workspace.getLeaf(true);
        await leaf.openFile(file);

        // Now move cursor to the line
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
            const editor = view.editor;
            editor.setCursor({ line: line - 1, ch: 0 });
            editor.scrollIntoView({ from: { line: line - 1, ch: 0 }, to: { line: line - 1, ch: 0 } }, true);
        }
    }
}