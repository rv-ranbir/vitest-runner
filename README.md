# Vitest CodeLens Runner

Run and debug Vitest tests directly from your test files with CodeLens support. Works seamlessly with monorepos and multi-root workspaces. Compatible with VS Code and Cursor IDE.

## Features

- 🎯 **CodeLens Support** - Click "▶ Run" or "🐛 Debug" icons next to `describe`, `it`, and `test` blocks
- 🚀 **Run Tests at Cursor** - Run the test at your cursor position
- 📁 **Run Test Files** - Run all tests in the current file
- 🏗️ **Monorepo Support** - Automatically finds package.json and runs tests in the correct workspace
- 🔧 **Multi-root Workspace** - Works seamlessly across multiple workspace folders
- ⚙️ **Configurable** - Customize base command and arguments per workspace

## Installation

### VS Code

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/vscode) or search for "Vitest CodeLens Runner" in the Extensions view.

### Open VSX (VSCodium, Eclipse Theia, etc.)

Install from [Open VSX Registry](https://open-vsx.org/extension/RanbirVerma/vitest-runner) or search for "Vitest CodeLens Runner" in your editor's Extensions view.

### Cursor IDE

Cursor can install extensions from the VS Code Marketplace or Open VSX. Simply search for "Vitest CodeLens Runner" in Cursor's Extensions view.

## Usage

### CodeLens (Run/Debug Icons)

The extension automatically shows **▶ Run** and **🐛 Debug** icons next to test blocks in your test files:

```typescript
describe("MyFeature", () => {
  // ▶ Run | 🐛 Debug
  it("should work", () => {
    // ▶ Run | 🐛 Debug
    // test code
  });
});
```

Click the icons to run or debug that specific test or suite.

### Commands

- **Vitest: Run Test at Cursor** - Run the test at your cursor position
- **Vitest: Run Test File** - Run all tests in the current file
- **Vitest: Refresh CodeLens** - Manually refresh CodeLens icons
- **Vitest: Diagnose CodeLens** - Show diagnostic information

### Keyboard Shortcuts

To add keyboard shortcuts:

1. Press `Cmd+K Cmd+S` (Mac) or `Ctrl+K Ctrl+S` (Windows/Linux)
2. Search for "Vitest: Run Test at Cursor" or "Vitest: Run Test File"
3. Assign your preferred shortcut

## Configuration

Configure the extension in your `.vscode/settings.json`:

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

The `{pkg}` placeholder gets replaced with the package root directory.

### Multi-root Workspace Support

The extension detects which workspace folder contains your test file and uses that folder's configuration. Each workspace folder can have its own settings.

## Troubleshooting

### CodeLens Icons Not Showing

1. **Ensure CodeLens is enabled in VS Code/Cursor:**

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

- **VS Code 1.85.0 or higher** OR **Cursor IDE** (compatible with VS Code extensions)
- Vitest installed in your project

## Contributing

Pull requests are welcome!

## License

MIT

## Support

Found a bug or have a feature request? [Open an issue](https://github.com/rv-ranbir/vitest-runner/issues) on GitHub.
