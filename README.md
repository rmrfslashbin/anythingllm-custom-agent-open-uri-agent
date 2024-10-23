# Open URI Agent Custom Skill for AnythingLLM

This custom agent skill allows users to open various types of URIs, including web pages and files, using specified applications across different operating systems.

## Features

- Cross-platform support (macOS, Windows, Linux)
- Opens URIs in specified applications or default handlers
- Enhanced URL validation and security checks
- Configurable browser/application selection
- Asynchronous execution
- Improved error handling

## Prerequisites

- Node.js 18+
- Yarn package manager
- AnythingLLM running in a supported environment

## Installation

1. Create a new folder named `open-uri-agent` in your AnythingLLM storage directory under `plugins/agent-skills/`.

2. Copy the following files into this folder:
   - `plugin.json`
   - `handler.js`
   - `run.js` (for local testing)

3. Install required packages: `yarn init -y`.

## Usage

You can use this skill by asking questions like:

- "Open the AnythingLLM GitHub page"
- "Open the PDF file at /path/to/document.pdf in Chrome"
- "Open https://www.example.com in the background"

The skill will process these queries, extract the URI and options, and open it using the specified application or default handler on the user's operating system.

### Options

- `application`: Specify the application to use for opening the URI
- `newInstance`: Open a new instance of the application (macOS only)
- `background`: Do not bring the application to the foreground (macOS only)
- `wait`: Wait for the application to exit before returning (macOS only)
- `allowedDomains`: List of allowed domains for security purposes

## Security Considerations

- The skill implements a whitelist of allowed protocols (http, https, file, ftp)
- You can specify allowed domains for additional security
- Ensure that proper input validation is in place and that the skill is used in a secure environment

## Troubleshooting

- If the URI doesn't open, check if you have the necessary permissions and the correct path/URL
- For application-specific opens, ensure the application name is correct and the application is installed
- Check system logs for any error messages related to the command execution

## Accessibility

While this skill doesn't directly implement accessibility features, it can be used in conjunction with assistive technologies. For example, you could use it to open web pages in a browser configured with screen reading software.

## Local Testing

To test the skill locally:

1. Run the following command in the skill's directory: `node run.js`.
This will run a series of test queries and display the results.

## License

This custom agent skill is released under the MIT License.
