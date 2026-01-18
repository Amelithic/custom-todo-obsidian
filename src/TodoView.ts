/* eslint-disable obsidianmd/ui/sentence-case */
import TodoPlugin from "main";
import { ItemView, WorkspaceLeaf} from "obsidian";

export const TODO_VIEW_TYPE = "todo-view";

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
    
    }

    async onClose() {
        // cleanup if needed
    }
}