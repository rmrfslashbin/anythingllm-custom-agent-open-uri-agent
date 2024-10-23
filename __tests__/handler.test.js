// File: __tests__/handler.test.js

const { runtime } = require('../handler');
const { exec } = require('child_process');
const os = require('os');

// Mock child_process.exec
jest.mock('child_process', () => ({
  exec: jest.fn((command, callback) => {
    callback(null, 'mocked stdout', '');
  })
}));

// Mock os.platform
jest.mock('os', () => ({
  platform: jest.fn()
}));

describe('Open URI Agent', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      introspect: jest.fn(),
      logger: jest.fn(),
      config: {
        name: 'Open URI Agent',
        version: '1.3.0'
      }
    };
    jest.clearAllMocks();
    // Set a default platform for all tests
    os.platform.mockReturnValue('darwin'); // Default to macOS
  });

  test('should open a valid http URL', async () => {
    const result = await runtime.handler.call(mockContext, { uri: 'http://example.com' });
    expect(result).toBe('Successfully initiated opening of http://example.com.');
    expect(exec).toHaveBeenCalled();
  });

  test('should open a valid https URL', async () => {
    const result = await runtime.handler.call(mockContext, { uri: 'https://example.com' });
    expect(result).toBe('Successfully initiated opening of https://example.com.');
    expect(exec).toHaveBeenCalled();
  });

  test('should open a valid file URI', async () => {
    const result = await runtime.handler.call(mockContext, { uri: 'file:///path/to/file.txt' });
    expect(result).toBe('Successfully initiated opening of file:///path/to/file.txt.');
    expect(exec).toHaveBeenCalled();
  });

  test('should reject an invalid protocol', async () => {
    const result = await runtime.handler.call(mockContext, { uri: 'invalid://example.com' });
    expect(result).toBe('Error: Invalid or disallowed protocol: invalid:');
    expect(exec).not.toHaveBeenCalled();
  });

  test('should reject when no URI is provided', async () => {
    const result = await runtime.handler.call(mockContext, {});
    expect(result).toBe('Error: No URI provided.');
    expect(exec).not.toHaveBeenCalled();
  });

  test('should respect allowed domains', async () => {
    const result = await runtime.handler.call(mockContext, {
      uri: 'https://example.com',
      options: { allowedDomains: ['allowed.com'] }
    });
    expect(result).toBe('Error: Domain not allowed: example.com');
    expect(exec).not.toHaveBeenCalled();
  });

  test('should handle application option on macOS', async () => {
    await runtime.handler.call(mockContext, {
      uri: 'https://example.com',
      options: { application: 'Safari' }
    });
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('-a "Safari"'),
      expect.any(Function)
    );
  });

  test('should handle newInstance option on macOS', async () => {
    await runtime.handler.call(mockContext, {
      uri: 'https://example.com',
      options: { newInstance: true }
    });
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('-n'),
      expect.any(Function)
    );
  });

  test('should handle background option on macOS', async () => {
    await runtime.handler.call(mockContext, {
      uri: 'https://example.com',
      options: { background: true }
    });
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('-g'),
      expect.any(Function)
    );
  });

  test('should handle wait option on macOS', async () => {
    await runtime.handler.call(mockContext, {
      uri: 'https://example.com',
      options: { wait: true }
    });
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('-W'),
      expect.any(Function)
    );
  });

  test('should use start command on Windows', async () => {
    os.platform.mockReturnValue('win32');
    await runtime.handler.call(mockContext, { uri: 'https://example.com' });
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('start'),
      expect.any(Function)
    );
  });

  test('should use xdg-open on Linux', async () => {
    os.platform.mockReturnValue('linux');
    await runtime.handler.call(mockContext, { uri: 'https://example.com' });
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('xdg-open'),
      expect.any(Function)
    );
  });

  test('should handle exec errors', async () => {
    exec.mockImplementationOnce((command, callback) => {
      callback(new Error('Command failed'), '', 'Some error occurred');
    });
    const result = await runtime.handler.call(mockContext, { uri: 'https://example.com' });
    expect(result).toBe('Successfully initiated opening of https://example.com.');
    expect(mockContext.logger).toHaveBeenCalledWith(expect.stringContaining('Error executing command'));
  });

  test('should handle unsupported operating systems', async () => {
    os.platform.mockReturnValue('unsupported');
    const result = await runtime.handler.call(mockContext, { uri: 'https://example.com' });
    expect(result).toBe('Error: Unsupported operating system: unsupported');
    expect(exec).not.toHaveBeenCalled();
  });
});
