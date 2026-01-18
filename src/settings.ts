import {App, PluginSettingTab, Setting} from "obsidian";
import TodoPlugin from "./main";

export interface TodoPluginSettings {
	mySetting: string;
	todoMarker: string;
}

export const DEFAULT_SETTINGS: TodoPluginSettings = {
	mySetting: 'default',
	todoMarker: 'TODO'
}

export class TodoSettingsTab extends PluginSettingTab {
	plugin: TodoPlugin;

	constructor(app: App, plugin: TodoPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Settings #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Set todo marker')
			.setDesc('This is what it will scan each file for.')
			.addText(text => text
				.setPlaceholder('TODO')
				.setValue(this.plugin.settings.todoMarker)
				.onChange(async (value) => {
					this.plugin.settings.todoMarker = value;
					await this.plugin.saveSettings();
				}));
	}
}
