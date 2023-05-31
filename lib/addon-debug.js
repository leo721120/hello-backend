/**
used to debug addon.node by vscode with following launch.json settings:
{
    "type": "cppvsdbg",
    "request": "launch",
    "name": "C++ Addon",
    "program": "node",
    "cwd": "${workspaceRoot}",
    "args": [
        "${workspaceRoot}/lib/addon-debug.js"
    ]
}

@typedef {import('./addon')} Addon
*/
Promise.resolve().then(async function () {
    /** @type {Addon} */
    const addon = require(`${__dirname}/addon.node`);
    addon.default.hello('world');
}).catch(console.error);