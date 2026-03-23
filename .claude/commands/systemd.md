Generate a PM2 process configuration for a script that needs to run 24/7 with auto-restart.

**NOTE: For OpenClaw middleware/gateway, we use PM2 - NOT systemd!**

Ask me:
1. What is the script/command? (e.g., `python3 /path/to/script.py` or `node app.js`)
2. What should the PM2 process be called? (e.g., my-server)
3. What is the working directory? (optional)

Then generate:
1. The PM2 start command
2. Commands to save and enable auto-start:

```bash
# Start the process
pm2 start "COMMAND" --name PROCESS_NAME --cwd WORKING_DIR

# Save process list (so it survives pm2 restart)
pm2 save

# Enable auto-start on system boot (run once)
pm2 startup
```

## Quick Reference

| Action | Command |
|--------|---------|
| Start | `pm2 start "command" --name name` |
| Stop | `pm2 stop name` |
| Restart | `pm2 restart name` |
| Delete | `pm2 delete name` |
| Status | `pm2 status` |
| Logs | `pm2 logs name` |
| Save | `pm2 save` |
| Auto-start | `pm2 startup` |

## Why PM2 over systemd?

- Works consistently (systemd has issues with `--user` on VPS)
- Simpler commands
- Built-in log management
- Easy process list management
- Auto-restart on crash
- Auto-start on reboot

## Current OpenClaw Processes

```bash
pm2 start "openclaw gateway run" --name openclaw-gateway
pm2 start "python3 /root/.openclaw/workspace/telegram_middleware.py" --name telegram-middleware --cwd /root/.openclaw/workspace
```
