# Change Log

All notable changes to the "Vitest Runner" extension will be documented in this file.

## [0.2.0] - 2025-01-27

### Fixed
- Root describe blocks now correctly run all nested tests instead of skipping them
- Improved test pattern matching for describe blocks to include nested tests

### Changed
- Updated README: removed manual installation section, improved language
- Added Open VSX publishing support with environment variable configuration
- Improved publish scripts for both VS Code Marketplace and Open VSX

## [0.1.1] - 2025-01-27

### Added
- Cursor IDE compatibility and documentation
- Updated keywords to include "cursor" for better discoverability

## [0.1.0] - 2025-01-27

### Added
- CodeLens support with Run and Debug icons next to test blocks
- Run test at cursor position
- Run entire test file
- Multi-root workspace support
- Monorepo support with automatic package.json detection
- Workspace-specific configuration
- Terminal reuse to prevent multiple terminal windows
- Diagnostic command for troubleshooting CodeLens issues

### Features
- Click "▶ Run" or "🐛 Debug" icons to run/debug individual tests
- Automatic test file detection (`.test.*`, `.spec.*`, `__tests__` folders)
- Configurable base command and arguments
- Support for pnpm, npm, and yarn monorepos
