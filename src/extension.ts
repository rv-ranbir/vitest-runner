
import * as vscode from "vscode";
import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";

let codeLensProvider: VitestCodeLensProvider;
let outputChannel: vscode.OutputChannel;
let terminal: vscode.Terminal | undefined;
let currentWorkingDir: string | undefined;

export function activate(ctx: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("Vitest Runner");
  outputChannel.appendLine("Vitest Runner extension activated");
  
  codeLensProvider = new VitestCodeLensProvider(outputChannel);
  
  ctx.subscriptions.push(
    outputChannel,
    vscode.commands.registerCommand("vitestRunner.runAtCursor", runAtCursor),
    vscode.commands.registerCommand("vitestRunner.runFile", runFile),
    vscode.commands.registerCommand("vitestRunner.runTest", runTest),
    vscode.commands.registerCommand("vitestRunner.debugTest", debugTest),
    vscode.commands.registerCommand("vitestRunner.refreshCodeLens", () => {
      codeLensProvider.refresh();
      vscode.window.showInformationMessage("CodeLens refreshed");
    }),
    vscode.commands.registerCommand("vitestRunner.diagnose", () => {
      diagnose();
    }),
    vscode.languages.registerCodeLensProvider(
      [
        { scheme: "file", language: "typescript" },
        { scheme: "file", language: "javascript" },
        { scheme: "file", language: "typescriptreact" },
        { scheme: "file", language: "javascriptreact" }
      ],
      codeLensProvider
    ),
    {
      dispose: () => {
        if (terminal) {
          terminal.dispose();
        }
      }
    }
  );
  
  outputChannel.appendLine("CodeLens provider registered");
}

function isTestFile(file: string) {
  return /(test|spec)\.(t|j)sx?$/.test(file) || file.includes("__tests__");
}

function escapeRegex(str: string): string {
  // Escape special regex characters
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findPackageRoot(file: string) {
  // First, check if the file is within any workspace folder
  const workspaceFolders = vscode.workspace.workspaceFolders;
  let workspaceRoot: string | undefined;
  
  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const folderPath = folder.uri.fsPath;
      if (file.startsWith(folderPath)) {
        workspaceRoot = folderPath;
        break;
      }
    }
  }
  
  // Find package.json, but don't go beyond workspace root
  let dir = path.dirname(file);
  const rootBoundary = workspaceRoot || path.dirname(file);
  
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    // Stop if we've reached the workspace root boundary
    if (workspaceRoot && !dir.startsWith(workspaceRoot)) break;
    dir = path.dirname(dir);
  }
  return path.dirname(file);
}

interface TestInfo {
  name: string;
  pos: number;
  line: number;
  type: "describe" | "it" | "test";
}

function collectTests(source: ts.SourceFile): TestInfo[] {
  const stack: string[] = [];
  const results: TestInfo[] = [];

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const text = node.expression.getText(source);
      const match = text.match(/^(describe|it|test)/);
      if (match) {
        const arg = node.arguments[0];
        if (arg && ts.isStringLiteral(arg)) {
          const testType = match[1] as "describe" | "it" | "test";
          stack.push(arg.text);
          const pos = node.getStart();
          const line = source.getLineAndCharacterOfPosition(pos).line;
          // Escape special regex characters in test names and join with .*
          const escapedStack = stack.map(escapeRegex);
          results.push({ 
            name: escapedStack.join(".*"), 
            pos,
            line,
            type: testType
          });
          ts.forEachChild(node, visit);
          stack.pop();
          return;
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return results;
}

function runAtCursor() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const file = editor.document.fileName;
  if (!isTestFile(file)) return;

  const source = ts.createSourceFile(file, editor.document.getText(), ts.ScriptTarget.Latest, true);
  const cursor = editor.document.offsetAt(editor.selection.active);
  const tests = collectTests(source).filter(t => t.pos <= cursor);
  const test = tests[tests.length - 1];
  test ? runVitest(file, test.name, false, test.type) : runFile();
}

function runFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  runVitest(editor.document.fileName);
}

function runVitest(file: string, pattern?: string, debug: boolean = false, testType?: "describe" | "it" | "test") {
  // Get workspace folder for the file to use folder-specific config
  const workspaceFolders = vscode.workspace.workspaceFolders;
  let workspaceFolder: vscode.WorkspaceFolder | undefined;
  
  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      if (file.startsWith(folder.uri.fsPath)) {
        workspaceFolder = folder;
        break;
      }
    }
  }
  
  // Get configuration for the specific workspace folder
  const cfg = workspaceFolder 
    ? vscode.workspace.getConfiguration("vitestRunner", workspaceFolder.uri)
    : vscode.workspace.getConfiguration("vitestRunner");
    
  const baseCmd = cfg.get<string>("baseCommand")!;
  const args = cfg.get<string[]>("defaultArgs")!.join(" ");
  const pkg = findPackageRoot(file);
  const cmd = baseCmd.replace("{pkg}", pkg);
  const rel = path.relative(pkg, file);
  // For describe blocks, use pattern that matches nested tests (no $ anchor)
  // For it/test blocks, use exact match
  const testArg = pattern 
    ? (testType === "describe" ? ` -t "^${pattern}"` : ` -t "^${pattern}$"`)
    : "";
  const debugArg = debug ? " --inspect-brk" : "";
  
  // Reuse existing terminal or create a new one
  if (!terminal || terminal.exitStatus !== undefined) {
    // Check if a terminal with the same name already exists
    const existingTerminal = vscode.window.terminals.find(t => t.name === "Vitest Runner");
    if (existingTerminal && existingTerminal.exitStatus === undefined) {
      terminal = existingTerminal;
    } else {
      terminal = vscode.window.createTerminal("Vitest Runner");
      currentWorkingDir = undefined; // Reset when creating new terminal
    }
  }
  
  terminal.show();
  
  // Only send cd command if we're in a different directory
  if (currentWorkingDir !== pkg) {
    terminal.sendText(`cd "${pkg}"`);
    currentWorkingDir = pkg;
  }
  
  // Run the test command
  terminal.sendText(`${cmd} ${args}${debugArg}${testArg} "${rel}"`);
}

function runTest(file: string, pattern: string, testType?: "describe" | "it" | "test") {
  if (!file || !pattern) {
    vscode.window.showErrorMessage("Invalid test parameters");
    return;
  }
  runVitest(file, pattern, false, testType);
}

function debugTest(file: string, pattern: string, testType?: "describe" | "it" | "test") {
  if (!file || !pattern) {
    vscode.window.showErrorMessage("Invalid test parameters");
    return;
  }
  runVitest(file, pattern, true, testType);
}

function diagnose() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }
  
  const filePath = editor.document.uri.fsPath;
  const isTest = isTestFile(filePath);
  const cfg = vscode.workspace.getConfiguration("vitestRunner", editor.document.uri);
  const codeLensEnabled = cfg.get<boolean>("enableCodeLens", true);
  
  const editorCfg = vscode.workspace.getConfiguration("editor", editor.document.uri);
  const codeLensEnabledGlobally = editorCfg.get<boolean>("codeLens", true);
  
  let message = `Diagnostics for: ${path.basename(filePath)}\n`;
  message += `- Is test file: ${isTest}\n`;
  message += `- CodeLens enabled (extension): ${codeLensEnabled}\n`;
  message += `- CodeLens enabled (editor): ${codeLensEnabledGlobally}\n`;
  message += `- Language: ${editor.document.languageId}\n`;
  
  if (isTest) {
    try {
      const source = ts.createSourceFile(
        filePath,
        editor.document.getText(),
        ts.ScriptTarget.Latest,
        true
      );
      const tests = collectTests(source);
      message += `- Tests found: ${tests.length}\n`;
      if (tests.length > 0) {
        message += `- Test names: ${tests.map(t => t.name).join(", ")}\n`;
      }
    } catch (error) {
      message += `- Error parsing: ${error}\n`;
    }
  }
  
  outputChannel.appendLine(message);
  outputChannel.show();
  vscode.window.showInformationMessage("Diagnostics written to output channel");
}

class VitestCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    // Refresh CodeLens when documents change
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (isTestFile(e.document.uri.fsPath)) {
        this._onDidChangeCodeLenses.fire();
      }
    });
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (isTestFile(doc.uri.fsPath)) {
        this._onDidChangeCodeLenses.fire();
      }
    });
    // Refresh when configuration changes
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("vitestRunner.enableCodeLens")) {
        this._onDidChangeCodeLenses.fire();
      }
    });
  }

  refresh() {
    this._onDidChangeCodeLenses.fire();
  }

  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const filePath = document.uri.fsPath;
    
    if (!isTestFile(filePath)) {
      this.outputChannel.appendLine(`Skipping ${path.basename(filePath)}: not a test file`);
      return [];
    }

    // Check if CodeLens is enabled
    const cfg = vscode.workspace.getConfiguration("vitestRunner", document.uri);
    if (!cfg.get<boolean>("enableCodeLens", true)) {
      this.outputChannel.appendLine(`CodeLens disabled for ${path.basename(filePath)}`);
      return [];
    }

    try {
      const source = ts.createSourceFile(
        filePath,
        document.getText(),
        ts.ScriptTarget.Latest,
        true
      );
      const tests = collectTests(source);
      this.outputChannel.appendLine(`Found ${tests.length} tests in ${path.basename(filePath)}`);
      
      const lenses: vscode.CodeLens[] = [];

      for (const test of tests) {
        if (test.line >= document.lineCount) {
          continue;
        }

        const line = document.lineAt(test.line);
        const range = new vscode.Range(
          test.line,
          0,
          test.line,
          line.range.end.character
        );

        // Run lens
        const runLens = new vscode.CodeLens(range, {
          title: "▶ Run",
          command: "vitestRunner.runTest",
          arguments: [filePath, test.name, test.type],
        });

        // Debug lens
        const debugLens = new vscode.CodeLens(range, {
          title: "🐛 Debug",
          command: "vitestRunner.debugTest",
          arguments: [filePath, test.name, test.type],
        });

        lenses.push(runLens, debugLens);
      }

      this.outputChannel.appendLine(`Created ${lenses.length} CodeLens items for ${path.basename(filePath)}`);
      return lenses;
    } catch (error) {
      this.outputChannel.appendLine(`Error in CodeLens for ${path.basename(filePath)}: ${error}`);
      console.error("Vitest CodeLens error:", error);
      return [];
    }
  }
}
