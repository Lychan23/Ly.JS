// src/commands/download.ts
import { Command } from "../types";

const _importDynamic = new Function('modulePath', 'return import(modulePath)');

export const openBrowser = async function (url: string) {
    const { default: open } = await _importDynamic('open');
    return open(url);
}

const command: Command = {
    name: "download",
    execute: async (message, args) => {
        const url = "https://github.com/Lychan23/Ly.JS/archive/refs/tags/prod.zip";

        message.channel.send(`Opening download link in the browser: ${url}`);

        try {
            await openBrowser(url);
            message.channel.send(`The file is being downloaded in your browser.`);
        } catch (error) {
            message.channel.send(`Failed to open the download link: ${error.message}`);
        }
    },
    permissions: ["Administrator"],
    aliases: ["fetchfile"]
};

export default command;
