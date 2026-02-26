# How to Run StreetLens Admin Dashboard on Your Computer

Follow these steps exactly and you'll have it running in a few minutes.

---

## Step 1 — Install Node.js

1. Go to https://nodejs.org
2. Download the **LTS** version (the big green button)
3. Run the installer — just keep clicking Next
4. When done, open a terminal and check it worked:
   ```
   node --version
   ```
   You should see something like `v20.x.x`

---

## Step 2 — Install pnpm

This project uses **pnpm** instead of npm. Run this in your terminal:

```
npm install -g pnpm
```

Check it worked:
```
pnpm --version
```

---

## Step 3 — Clone the Repo

```
git clone https://github.com/Siddhesh1401/StreetLens_Website.git
```

Then go into the folder:
```
cd StreetLens_Website
```

---

## Step 4 — Install Dependencies

```
pnpm install
```

This will download all the packages the project needs. It might take a minute.

---

## Step 5 — Set Up Environment Variables

The app connects to Firebase. You need a `.env.local` file with the credentials.

1. Create a new file called `.env.local` in the root of the project folder
2. Paste this into it (ask Siddhesh for the actual values):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> ⚠️ This file is **not** in the repo for security reasons. Ask Siddhesh to share the values with you.

---

## Step 6 — Run the Website

```
pnpm dev
```

Now open your browser and go to:

**http://localhost:3000**

You should see the login page. Ask Siddhesh for an admin account to log in with.

---

## Stopping the Server

Press `Ctrl + C` in the terminal to stop it.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `pnpm: command not found` | Run `npm install -g pnpm` again |
| Red underlines in VS Code | Run `pnpm install` once, then reload VS Code |
| Blank page / Firebase error | Check your `.env.local` file has all values filled in |
| Port 3000 already in use | Run `pnpm dev -- --port 3001` to use a different port |

---

That's it! 🎉
