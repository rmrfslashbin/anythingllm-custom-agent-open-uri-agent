// File: handler.js
const { exec } = require('child_process');
const { platform } = require('os');
const url = require('url');

/** @type {string[]} List of allowed URI protocols */
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'file:', 'ftp:'];

/**
 * @typedef {Object} OpenOptions
 * @property {string} [application] - The application to use for opening the URI
 * @property {boolean} [newInstance] - Whether to open a new instance of the application (macOS only)
 * @property {boolean} [background] - Whether to open the application in the background (macOS only)
 * @property {boolean} [wait] - Whether to wait for the application to close before returning (macOS only)
 * @property {string[]} [allowedDomains] - List of allowed domains for security purposes
 */

/**
 * @typedef {Object} RuntimeContext
 * @property {function} introspect - Function to log user-facing messages
 * @property {function} logger - Function to log debug information
 * @property {Object} config - Configuration object for the skill
 * @property {string} config.name - Name of the skill
 * @property {string} config.version - Version of the skill
 */

module.exports.runtime = {
    /**
     * Handles the request to open a URI with specified options
     * @param {Object} params - The parameters for the handler
     * @param {string} params.uri - The URI to open
     * @param {OpenOptions} [params.options={}] - Additional options for opening the URI
     * @this {RuntimeContext}
     * @returns {Promise<string>} A message indicating the result of the operation
     */
    handler: async function ({ uri, options = {} }) {
        const callerId = `${this.config.name}-v${this.config.version}`;

        try {
            this.introspect(`Processing request to open URI: ${uri}`);

            if (!uri) {
                return "Error: No URI provided.";
            }

            // Enhanced URL validation
            const parsedUrl = new URL(uri);
            if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
                return `Error: Invalid or disallowed protocol: ${parsedUrl.protocol}`;
            }

            // Security check: Whitelist domains
            if (options.allowedDomains && !options.allowedDomains.includes(parsedUrl.hostname)) {
                return `Error: Domain not allowed: ${parsedUrl.hostname}`;
            }

            let command;
            switch (platform()) {
                case 'darwin':
                    command = buildMacCommand(uri, options);
                    break;
                case 'win32':
                    command = buildWindowsCommand(uri, options);
                    break;
                case 'linux':
                    command = buildLinuxCommand(uri, options);
                    break;
                default:
                    return `Error: Unsupported operating system: ${platform()}`;
            }

            // Asynchronous execution
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    this.logger(`Error executing command: ${error.message}`);
                    if (error.code === 'ENOENT') {
                        return `Error: The specified application or file was not found.`;
                    }
                    return `Error opening URI: ${error.message}`;
                }
                if (stderr) {
                    this.logger(`Command stderr: ${stderr}`);
                    return `Warning: ${stderr}`;
                }
            });

            return `Successfully initiated opening of ${uri}.`;

        } catch (error) {
            this.logger(`Error in open-uri-agent: ${error.message}`);
            if (error instanceof TypeError) {
                return `Error: Invalid URI format. Please provide a valid URI.`;
            }
            return `I encountered an error while trying to open the URI: ${error.message}. Please try again.`;
        }
    }
};

/**
 * Builds the command to open a URI on macOS
 * @param {string} uri - The URI to open
 * @param {OpenOptions} options - Options for opening the URI
 * @returns {string} The command to execute
 */
function buildMacCommand(uri, options) {
    let command = 'open';

    if (options.application) {
        command += ` -a "${options.application}"`;
    }

    if (options.newInstance) {
        command += ' -n';
    }

    if (options.background) {
        command += ' -g';
    }

    if (options.wait) {
        command += ' -W';
    }

    command += ` "${uri}"`;

    return command;
}

/**
 * Builds the command to open a URI on Windows
 * @param {string} uri - The URI to open
 * @param {OpenOptions} options - Options for opening the URI
 * @returns {string} The command to execute
 */
function buildWindowsCommand(uri, options) {
    if (options.application) {
        return `start "" "${options.application}" "${uri}"`;
    }
    return `start "" "${uri}"`;
}

/**
 * Builds the command to open a URI on Linux
 * @param {string} uri - The URI to open
 * @param {OpenOptions} options - Options for opening the URI
 * @returns {string} The command to execute
 */
function buildLinuxCommand(uri, options) {
    if (options.application) {
        return `${options.application} "${uri}"`;
    }
    return `xdg-open "${uri}"`;
}
