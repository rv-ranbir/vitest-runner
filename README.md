# Vitest Runner

Run Vitest tests with CodeLens support - Run and Debug tests directly from your test files, just like Jest Runner. Perfect for monorepos and multi-root workspaces.

## Features

- 🎯 **CodeLens Support** - Click "▶ Run" or "🐛 Debug" icons next to `describe`, `it`, and `test` blocks
- 🚀 **Run Tests at Cursor** - Run the test at your cursor position
- 📁 **Run Test Files** - Run all tests in the current file
- 🏗️ **Monorepo Support** - Automatically finds package.json and runs tests in the correct workspace
- 🔧 **Multi-root Workspace** - Works seamlessly across multiple workspace folders
- ⚙️ **Configurable** - Customize base command and arguments per workspace

## Installation

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/vscode) or search for "Vitest Runner" in the Extensions view.

Or install from the repository:
```bash
git clone https://github.com/rv-ranbir/vitest-runner.git
cd vitest-runner
npm install
npm run package
code --install-extension vitest-runner-0.1.0.vsix
```

## Usage

### CodeLens (Run/Debug Icons)

The extension automatically shows **▶ Run** and **🐛 Debug** icons next to test blocks in your test files:

```typescript
describe('MyFeature', () => {  // ▶ Run | 🐛 Debug
  it('should work', () => {     // ▶ Run | 🐛 Debug
    // test code
  });
});
```

Simply click the icons to run or debug that specific test or suite!

### Commands

- **Vitest: Run Test at Cursor** - Run the test at your cursor position
- **Vitest: Run Test File** - Run all tests in the current file
- **Vitest: Refresh CodeLens** - Manually refresh CodeLens icons
- **Vitest: Diagnose CodeLens** - Show diagnostic information

### Keyboard Shortcuts

You can add keyboard shortcuts in VS Code:
1. Press `Cmd+K Cmd+S` (Mac) or `Ctrl+K Ctrl+S` (Windows/Linux)
2. Search for "Vitest: Run Test at Cursor" or "Vitest: Run Test File"
3. Assign your preferred shortcut

## Configuration

The extension supports workspace-specific configuration. Add these settings to your `.vscode/settings.json`:

```json
{
  "vitestRunner.baseCommand": "npx vitest",
  "vitestRunner.defaultArgs": ["--run"],
  "vitestRunner.enableCodeLens": true
}
```

### Configuration Options

- **`vitestRunner.baseCommand`** (default: `"npx vitest"`) - Base command to run Vitest
- **`vitestRunner.defaultArgs`** (default: `["--run"]`) - Default arguments passed to Vitest
- **`vitestRunner.enableCodeLens`** (default: `true`) - Enable/disable CodeLens icons

### Monorepo Configuration

For pnpm monorepos, use:

```json
{
  "vitestRunner.baseCommand": "pnpm -C {pkg} exec vitest"
}
```

The `{pkg}` placeholder is automatically replaced with the package root directory.

### Multi-root Workspace Support

The extension automatically detects which workspace folder contains your test file and uses that folder's configuration. Each workspace folder can have its own settings.

## Troubleshooting

### CodeLens Icons Not Showing

1. **Ensure CodeLens is enabled in VS Code:**
   - Open Settings (`Cmd+,` or `Ctrl+,`)
   - Search for "CodeLens"
   - Make sure `Editor: Code Lens` is enabled

2. **Check extension settings:**
   ```json
   {
     "vitestRunner.enableCodeLens": true
   }
   ```

3. **Verify your file is detected as a test file:**
   - Files must match: `*.test.{js,ts,jsx,tsx}`, `*.spec.{js,ts,jsx,tsx}`, or be in `__tests__` folder

4. **Refresh CodeLens:**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Run "Vitest: Refresh CodeLens"

5. **Run diagnostics:**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Run "Vitest: Diagnose CodeLens"
   - Check the "Vitest Runner" output channel for details

## Requirements

- VS Code 1.85.0 or higher
- Vitest installed in your project

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/rv-ranbir/vitest-runner/issues) on GitHub.
