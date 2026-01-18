/* eslint-disable obsidianmd/ui/sentence-case */
import TodoPlugin from "main";
import { ItemView, WorkspaceLeaf} from "obsidian";

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

        let currentTodoMarker = this.plugin.settings.todoMarker;
        container?.empty();
        container?.createEl("h2", { text: "My Todo View" });
        container?.createEl("p", { text: currentTodoMarker});

        let todos = await this.plugin.scanForTodo();
        const todoDiv = container?.createDiv();
        if (todos) {
            for (let todo of todos) {
                todoDiv?.createEl("p", { text : todo.text });
            }
        }
    }
}