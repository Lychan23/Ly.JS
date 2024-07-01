
const { exec } = require("child_process");
const themeColors = {
    text: "#ff8e4d",
    variable: "#ff624d",
    error: "#f5426c"
};

const executeCommand = (command, successMessage, errorMessage) => {
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(chalk.hex(themeColors.error)(`${errorMessage}\n${stderr}`));
            process.exit(1);
        } else {
            console.log(chalk.hex(themeColors.text)(successMessage));
            if (stdout) console.log(stdout);
        }
    });
};

const buildProject = () => {
    console.log(chalk.hex(themeColors.text)("Starting build..."));
    executeCommand(
        "tsc",
        "Build successful! You can start the bot by running " + chalk.hex(themeColors.variable)("npm start"),
        "Build failed with the following error:"
    );
};

const installModules = () => {
    console.log("\x1b[31mNode modules are not installed. \x1b[33mInstalling...\x1b[37m");
    exec("npm i", (err, stdout, stderr) => {
        if (err) {
            console.error("\x1b[31mFailed to install node modules. \x1b[37m");
            console.error(stderr);
            process.exit(1);
        } else {
            console.log(stdout);
            console.log("\x1b[32mNode modules successfully installed. \x1b[33mRestarting in 3 seconds... \x1b[37m");
            setTimeout(() => {
                executeCommand(
                    "node build.js",
                    "Restart successful.",
                    "Failed to restart."
                );
            }, 3000);
        }
    });
};

try {
    var chalk = require("chalk");
    buildProject();
} catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
        installModules();
    } else {
        console.error(e);
        process.exit(1);
    }
}

