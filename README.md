# mini-fantasy-asset-index-electron

An Electron application with React, TypeScript, and Tailwind.

This app shows the index of assets created for Mini Fantasy, a 8x8 pixel art collection by Krishna Palacio.

## Dev
```
npm i

npx electron-vite dev
```

## Build
```
npm run build:win
npm run build:mac
```

## Codesign (Mac)
Follow [code signing instructions](https://www.electronjs.org/docs/latest/tutorial/code-signing)

Setup your own Developer and Installer Certificates in your keychain.
Run this locally to sign & notarize the first time, notarizing can take a bit.
```
APPLE_ID=foo APPLE_TEAM_ID=bar APPLE_APP_SPECIFIC_PASSWORD=baz npm run build:mac
```