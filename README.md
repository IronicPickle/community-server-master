# Lykos Community Website
A simple community portal with a MusicSync UI designed for Sinusbot.

## Documentation
**Commands**
```
npm run dev - Runs the react and node dev servers concurrently
npm run prod - Runs the production build. Must have used ' npm run build ' first.
npm run clean - Cleans the node build directory ' ./build '.
npm run build - Compiles the node server and builds the react client.
```
**Environment Variables (.env)**
```
PORT:string - The port the node server will run on. (8080)
MUSIC_SYNC_PASS:string - The password used between the Sinsubot Web Server and the MusicSync backend. (This password must match the password configured on Sinusbot's end.)
MUSIC_SYNC_BOT_ADDRESS:string - The address of the Sinusbot Web Server.
MUSIC_SYNC_BOT_USERNAME:string - The username of the Sinusbot account used for operation.
MUSIC_SYNC_BOT_PASSWORD:string - The password of the Sinusbot account used for operation.
MUSIC_SYNC_BOT_BOTID:string - The Sinusbot Bot ID.

ADMIN_PASS:string - The password used for admin access on the website.
```
