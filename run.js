// File: run.js
const { runtime } = require('./handler');
const path = require('path');

// Define constants for resource paths
const EXAMPLE_PDF_PATH = path.resolve(__dirname, 'resources', 'example.pdf');

async function testSkill() {
    const mockContext = {
        introspect: console.log,
        logger: console.error,
        config: {
            name: "Open URI Agent",
            version: "1.3.0"
        }
    };

    const testQueries = [
        {
            description: "Open AnythingLLM GitHub page",
            params: { uri: "https://github.com/Mintplex-Labs/anything-llm" }
        },
        {
            description: "Open local file with specific application",
            params: { uri: `file://${EXAMPLE_PDF_PATH}`, options: { application: "Safari" } }
        },
        {
            description: "Open website in background",
            params: { uri: "https://www.example.com", options: { background: true } }
        },
        {
            description: "Invalid protocol test",
            params: { uri: "invalid://example.com" }
        },
        {
            description: "Domain whitelist test",
            params: { uri: "https://www.example.com", options: { allowedDomains: ["github.com"] } }
        }
    ];

    for (const test of testQueries) {
        console.log(`\nTesting: ${test.description}`);
        console.log(`Parameters: ${JSON.stringify(test.params)}`);
        try {
            const result = await runtime.handler.call(mockContext, test.params);
            console.log("Result:");
            console.log(result);
        } catch (error) {
            console.error(`Error testing query:`, error);
        }
        console.log('\n---\n');
    }
}

testSkill();
