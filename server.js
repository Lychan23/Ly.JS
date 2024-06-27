const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const os = require('os-utils');
const socketIO = require('socket.io');
const { Client, GatewayIntentBits, TextChannel } = require('discord.js');
const speedTest = require('speedtest-net');
const dotenv = require('dotenv');
const fs = require('fs').promises; // Using fs.promises for async file operations

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.login(process.env.TOKEN);

let botProcess = null;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const activeUsers = new Set();

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const io = socketIO(server);

app.get('/projects', async (req, res) => {
    const projectsPath = path.join(__dirname, 'projects'); // Adjust path as per your setup
    try {
        const files = await fs.readdir(projectsPath);
        const projects = await Promise.all(files.map(async file => {
            const filePath = path.join(projectsPath, file);
            const stat = await fs.stat(filePath);
            return stat.isDirectory() ? file : null;
        }));
        res.json(projects.filter(project => project !== null));
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).send('Error fetching projects');
    }
});

app.post('/save-theme', async (req, res) => {
    try {
        await fs.writeFile(path.join(__dirname, 'settings.json'), JSON.stringify(req.body, null, 2), 'utf8');
        io.emit('activity', 'Theme changed');
        res.send('Theme settings saved');
    } catch (error) {
        console.error('Error saving theme settings:', error);
        res.status(500).send('Error saving theme settings');
    }
});

app.get('/load-theme', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'settings.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error loading theme settings:', error);
        res.status(500).send('Error loading theme settings');
    }
});

app.post('/start', (req, res) => {
    if (!botProcess) {
        botProcess = exec('npm start', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        });

        botProcess.stdout.on('data', (data) => {
            // Emit detailed bot logs to the main activity feed
            io.emit('log', data.toString());
        });

        botProcess.stderr.on('data', (data) => {
            // Emit detailed bot logs to the main activity feed
            io.emit('log', data.toString());
        });

        // Emit high-level activity message
        io.emit('activity', 'Bot started');
        res.send('Bot started');
    } else {
        res.send('Bot is already running');
    }
});

app.post('/stop', (req, res) => {
    if (botProcess) {
        try {
            botProcess.kill('SIGINT'); // Use SIGINT to try to kill the process more gracefully
            botProcess = null;
            io.emit('activity', 'Bot stopped');
            res.send('Bot stopped');
        } catch (error) {
            console.error('Failed to stop bot process:', error);
            res.status(500).send('Failed to stop bot process');
        }
    } else {
        res.send('Bot is not running');
    }
});

app.post('/send', (req, res) => {
    const { text } = req.body;
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);
    if (channel && channel instanceof TextChannel) {
        channel.send(text)
            .then(() => {
                io.emit('activity', 'Text sent to Discord');
                res.send('Message sent to Discord');
            })
            .catch(error => res.status(500).send(`Failed to send message: ${error.message}`));
    } else {
        res.status(400).send('Channel not found or is not a text channel');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const getNetworkStats = async () => {
    try {
        const result = await speedTest({ acceptLicense: true });
        const downloadSpeed = result.download.bandwidth / 125000; // Convert from bps to Mbps
        const uploadSpeed = result.upload.bandwidth / 125000; // Convert from bps to Mbps
        return { downloadSpeed, uploadSpeed };
    } catch (error) {
        console.error('Error fetching network stats:', error);
        return { downloadSpeed: null, uploadSpeed: null };
    }
};

setInterval(async () => {
    os.cpuUsage(async (v) => {
        const networkStats = await getNetworkStats();
        const uptime = process.uptime();
        const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

        const stats = {
            cpu: (v * 100).toFixed(2),
            memory: (os.freememPercentage() * 100).toFixed(2),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            networkInbound: networkStats.downloadSpeed !== null ? `${networkStats.downloadSpeed.toFixed(2)} Mbps` : 'N/A',
            networkOutbound: networkStats.uploadSpeed !== null ? `${networkStats.uploadSpeed.toFixed(2)} Mbps` : 'N/A',
            uptime: uptimeFormatted,
            currentTasks: 'N/A' // Replace with actual task fetching logic
        };
        io.emit('stats', stats);
    });
}, 30000); // Adjusted interval to 5 minutes to avoid excessive speed tests

io.on('connection', (socket) => {
    console.log('New client connected');
    activeUsers.add(socket.id);
    io.emit('userList', Array.from(activeUsers));

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        activeUsers.delete(socket.id);
        io.emit('userList', Array.from(activeUsers));
    });
});
