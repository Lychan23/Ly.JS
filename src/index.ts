import express from 'express';
import path from 'path';
import { exec } from 'child_process';
import os from 'os-utils';
import { Client, GatewayIntentBits, Collection, TextChannel } from 'discord.js';
import { Server } from 'socket.io';
import http from 'http';
import { Command, SlashCommand } from './types';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';
config();

const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, MessageContent, GuildMessages, GuildMembers] });

// Initialize collections for commands and cooldowns
client.slashCommands = new Collection<string, SlashCommand>();
client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, number>();

// Load command handlers
const handlersDir = join(__dirname, './handlers');
readdirSync(handlersDir).forEach(handler => {
    if (!handler.endsWith('.js')) return;
    require(`${handlersDir}/${handler}`)(client);
});

client.login(process.env.TOKEN);

const app = express();
const port = process.env.PORT || 3000; // Use PORT from .env or default to 3001

let botProcess: any = null;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Start bot endpoint
app.post('/start', (req, res) => {
    if (!botProcess) {
        botProcess = exec('npm start', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
        });

        botProcess.stdout.on('data', (data: string) => {
            console.log(data.toString());
            io.emit('log', data.toString());
        });

        botProcess.stderr.on('data', (data: string) => {
            console.error(data.toString());
            io.emit('log', data.toString());
        });

        res.send('Bot started');
    } else {
        res.send('Bot is already running');
    }
});

// Stop bot endpoint
app.post('/stop', (req, res) => {
    if (botProcess) {
        botProcess.kill();
        botProcess = null;
        res.send('Bot stopped');
    } else {
        res.send('Bot is not running');
    }
});

// Send message to Discord endpoint
app.post('/send', (req, res) => {
    const { text } = req.body;
    const channel = client.channels.cache.get(process.env.CHANNEL_ID as string);
    if (channel && (channel as TextChannel).send) {
        (channel as TextChannel).send(text)
            .then(() => res.send('Message sent to Discord'))
            .catch(error => res.status(500).send(`Failed to send message: ${error.message}`));
    } else {
        res.status(400).send('Channel not found or is not a text channel');
    }
});

// Serve HTML page with start/stop buttons and log display
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server);

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:3000`);
});

// Emit system stats periodically
setInterval(() => {
    os.cpuUsage((v) => {
        const stats = {
            cpu: (v * 100).toFixed(2),
            memory: (os.freememPercentage() * 100).toFixed(2),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            networkInbound: 'N/A', // Placeholder for actual network data
            networkOutbound: 'N/A' // Placeholder for actual network data
        };
        io.emit('stats', stats);
    });
}, 1000);

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
