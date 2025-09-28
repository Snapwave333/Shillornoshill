# Shill Or No Shill Desktop App (Windows)

This packages the existing HTML game into a Windows desktop app using Electron and builds an installer (.exe).

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in dev:
   ```bash
   npm start
   ```

## Build Windows Installer

```bash
npm run build
```

The installer will be generated under `dist/`.

## Windows Integrations

- Start Menu and Desktop shortcuts (NSIS)
- System Tray icon with quick actions
- Jump List tasks (Open Game, Open Settings)
- Windows notifications (Electron Notification API)
- File association for `.shill` files (installer registers association)