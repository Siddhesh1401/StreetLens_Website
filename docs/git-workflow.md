# Git Workflow — Team of 4 (Complete Beginner Guide)

How Siddhesh + 3 teammates will collaborate on this project without stepping on each other's code.

---

## What is Git? (Read this first)

**Git** is a tool that tracks every change made to code. Think of it like Google Docs version history — but for code files.

**GitHub** is a website that stores your code online so the whole team can access it. Git is the tool, GitHub is the website.

**Why do we need it?**
Without Git, if 4 people are editing files, you'd be sending zip files on WhatsApp and overwriting each other's work. Git handles all of this automatically.

---

## Key Words You'll See (Glossary)

| Word | What it means in simple terms |
|---|---|
| **Repository (repo)** | The project folder — your entire codebase |
| **Commit** | A saved snapshot of your changes — like hitting Save with a description |
| **Push** | Upload your commits from your laptop to GitHub |
| **Pull** | Download the latest changes from GitHub to your laptop |
| **Branch** | A separate copy of the code where you work on one thing without affecting the main code |
| **main** | The official, stable version of the project — the "real" code |
| **Merge** | Combining your branch back into main once your work is done |
| **Pull Request (PR)** | A request on GitHub saying "I finished my work, please review and merge it into main" |
| **Clone** | Download the whole repo to your laptop for the first time |
| **Conflict** | When two people changed the same line — Git asks you to manually decide which version to keep |

---

## What are Flags? (`-m`, `-b`, `-d`, `-u`)

When you type a command like `git commit -m "message"`, the `-m` part is called a **flag**. It's just an option you pass to the command.

| Flag | Used in | Meaning |
|---|---|---|
| `-m` | `git commit -m "text"` | Write the commit message directly in the command (without it, git opens a weird text editor) |
| `-b` | `git checkout -b branch-name` | Create a new branch AND switch to it at the same time |
| `-d` | `git branch -d branch-name` | Delete a branch after it's merged (safe delete) |
| `-D` | `git branch -D branch-name` | Force delete a branch even if not merged (be careful) |
| `-u` | `git push -u origin branch-name` | Link your local branch to GitHub (only needed on the very first push of a new branch) |

---

## What is a Branch?

Imagine `main` is the main road. A branch is a side road where you do construction without blocking traffic. When construction is done, you connect it back to the main road.

```
main  ──────────────────────────────────────────►  (always working, never broken)
           │                          ▲
           │  you branch off here     │  your work merges back here
           ▼                          │
     feature/delete-button ───────────┘
     (you work here safely)
```

Every person creates their own branch for every feature they build. When done, it goes back into main.

**Why not just work on main directly?**
If you push broken code to main, everyone's project breaks. Branches keep main safe.

---

## Our Team Rules

1. **Nobody touches `main` directly** — always work on a branch
2. **One feature = one branch** — don't mix two features in one branch
3. **Always `git pull` before starting** — get the latest code first
4. **Open a Pull Request when done** — Siddhesh reviews and merges it
5. **Write clear commit messages** — your teammates need to understand what you did

---

## Our Team

| Person | Role |
|---|---|
| Siddhesh | Project lead — reviews and merges Pull Requests |
| Teammate 1 | Works on assigned features |
| Teammate 2 | Works on assigned features |
| Teammate 3 | Works on assigned features |

---

## One-Time Setup — Every Teammate Does This Once

### Step 1 — Install Git

Git is what lets you run `git` commands in the terminal.

1. Go to https://git-scm.com
2. Download for Windows → run the installer
3. Keep clicking Next (defaults are fine)
4. Open a new terminal and check it worked:
```bash
git --version
```
You should see something like `git version 2.x.x`

---

### Step 2 — Install Node.js

Node.js is needed to run the Next.js project.

1. Go to https://nodejs.org
2. Download the **LTS** version (big green button)
3. Run the installer → keep clicking Next
4. Check it worked:
```bash
node --version
```
Should show `v20.x.x` or higher.

---

### Step 3 — Install pnpm

This project uses pnpm instead of npm. Run this after Node is installed:

```bash
npm install -g pnpm
```

Check it worked:
```bash
pnpm --version
```

---

### Step 4 — Tell Git who you are (one time only)

Git needs to know your name and email so commits show who made them:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

Use the same email as your GitHub account.

---

### Step 5 — Clone the Repo

"Cloning" means downloading the whole project to your laptop. You only do this once.

```bash
git clone https://github.com/Siddhesh1401/StreetLens_Website.git
```

This creates a folder called `StreetLens_Website`. Go into it:

```bash
cd StreetLens_Website
```

---

### Step 6 — Install Project Dependencies

```bash
pnpm install
```

This downloads all the packages the project needs (React, Firebase, etc.). It might take a minute. You only need to do this once (or again if someone adds a new package).

---

### Step 7 — Get the `.env.local` file

The project connects to Firebase using secret credentials. These are stored in a file called `.env.local` which is NOT in the repo (for security).

Ask Siddhesh to send you this file. Place it directly inside the `StreetLens_Website` folder.

---

### Step 8 — Run the Project

```bash
pnpm dev
```

Open your browser → http://localhost:3000

You should see the StreetLens login page. Ask Siddhesh for admin login credentials.

---
---

## Every Time You Work — Daily Workflow

Follow these steps every single time you sit down to work on the project.

---

### STEP 1 — Switch to main and get the latest code

Before doing anything, download whatever your teammates pushed since you last worked:

```bash
git checkout main
git pull
```

- `git checkout main` → switches you to the main branch
- `git pull` → downloads the latest code from GitHub to your laptop

> If you skip this and your code is old, you'll get conflicts later. Always do this first.

---

### STEP 2 — Create a new branch for your feature

Think of a clear name for what you're about to build, then:

```bash
git checkout -b feature/your-feature-name
```

- `git checkout -b` → creates a new branch AND switches to it (`-b` means "new branch")
- You are now working in your own isolated copy of the code

**Branch name examples:**
```bash
git checkout -b feature/delete-button
git checkout -b feature/csv-export
git checkout -b fix/sidebar-mobile-bug
git checkout -b update/citizens-page-search
```

**Naming rules:**
- `feature/` → you're adding something new
- `fix/` → you're fixing a bug
- `update/` → improving something that already exists
- Keep names short and descriptive, use hyphens not spaces

---

### STEP 3 — Write your code in VS Code

Just open VS Code and code normally. Your changes only exist on your branch — main is untouched.

If you're not sure what to build, check `docs/whats-next.md` for a list of pending features with implementation hints.

---

### STEP 4 — Save your progress with commits

A **commit** is like a save point with a description. Do this regularly — not just at the end:

```bash
git add .
git commit -m "Short description of what you did"
```

- `git add .` → stages ALL your changed files (the dot means "everything")
- `git commit -m "..."` → saves a snapshot with your message (`-m` means "message")

**Good commit messages** (be specific):
```
Add delete button to issue detail page
Fix sidebar not closing on mobile after click
Add search filter to citizens page
```

**Bad commit messages** (useless):
```
changes
fix
done
working now
```

> You can commit multiple times while working — it's encouraged. Think of each commit as a checkpoint.

---

### STEP 5 — Push your branch to GitHub

When you're done (or want to back up your work):

```bash
git push origin feature/your-feature-name
```

- `git push` → uploads your commits to GitHub
- `origin` → means "GitHub" (the remote)
- `feature/your-feature-name` → the branch you're pushing

**First time pushing a new branch**, use `-u` to link it:
```bash
git push -u origin feature/your-feature-name
```
After that first time, you can just use `git push`.

---

### STEP 6 — Open a Pull Request on GitHub

A **Pull Request (PR)** is how you say "I'm done, please review and merge my work into main."

1. Go to https://github.com/Siddhesh1401/StreetLens_Website
2. You'll see a yellow banner at the top: **"feature/your-branch had recent pushes → Compare & pull request"** — click it
3. Fill in:
   - **Title:** what you built (e.g. `Add delete button to issue detail page`)
   - **Description:** what you changed and why (2-3 lines is fine)
4. Click **Create pull request**
5. Message Siddhesh on WhatsApp: "PR opened for [feature name]"

---

### STEP 7 — Siddhesh reviews and merges

Siddhesh will open the PR, read the code, and either:
- ✅ Merge it → your code is now in main
- 💬 Leave a comment asking for a change → you fix it, commit, push again (the PR updates automatically)

---

### STEP 8 — Clean up after merge

Once your PR is merged:

```bash
git checkout main
git pull
git branch -d feature/your-feature-name
```

- `git checkout main` → switch back to main
- `git pull` → get your merged code into your local main
- `git branch -d feature/your-feature-name` → delete the old branch (`-d` means delete, safe — won't delete if not merged)

---

## What is a Conflict and How to Fix It

A **conflict** happens when two people edited the **exact same line** of the same file, and Git doesn't know which version to keep. It stops and asks you to decide.

### When does it happen?

Example: You and a teammate both edited `Sidebar.tsx` on the same line while on different branches. When one of you merges, Git flags it.

### What it looks like in VS Code

Open the conflicted file — you'll see this:

```
<<<<<<< your-branch
  const title = 'your version';
=======
  const title = 'their version';
>>>>>>> main
```

Everything between `<<<<<<<` and `=======` is YOUR code.
Everything between `=======` and `>>>>>>>` is the OTHER person's code.

### How to fix it in VS Code

VS Code makes this easy — it shows clickable buttons above the conflict:

- **Accept Current Change** → keep YOUR version, throw away theirs
- **Accept Incoming Change** → keep THEIR version, throw away yours
- **Accept Both Changes** → keep both (good when both changes should exist)
- **Compare Changes** → see a side-by-side diff

Click whichever makes sense, save the file, then:

```bash
git add .
git commit -m "Resolve merge conflict in Sidebar.tsx"
git push
```

### How to avoid conflicts (most important tip)

- Always `git pull` at the start of every session
- Tell teammates on WhatsApp which file you're working on
- Don't stay on a branch for days — finish and merge quickly
- Each person works on different pages/components (see task split below)

---

## Full Example — Walk Through a Real Task

**Task:** "Add a Delete button to the issue detail page"

```bash
# 1. Get latest code
git checkout main
git pull

# 2. Create your branch
git checkout -b feature/delete-issue-button

# 3. Open VS Code and write the code
#    (edit src/app/issues/[id]/page.tsx)

# 4. Save your progress
git add .
git commit -m "Add delete button with confirmation dialog"

# 5. More code...
git add .
git commit -m "Hook delete button to deleteIssue() in firestore.ts"

# 6. Push to GitHub
git push -u origin feature/delete-issue-button

# 7. Open PR on GitHub → message Siddhesh

# 8. After Siddhesh merges → clean up
git checkout main
git pull
git branch -d feature/delete-issue-button
```

---

## Suggested Task Split (to avoid conflicts)

Each person owns different files so you're not stepping on each other:

| Teammate | Feature to Build | Main files to edit |
|---|---|---|
| **Siddhesh** | Review PRs + admin roles (`/admins` page) | `src/app/admins/` |
| **Teammate 1** | Delete issue button | `src/app/issues/[id]/page.tsx` |
| **Teammate 2** | Export to CSV on issues page | `src/app/issues/page.tsx` |
| **Teammate 3** | `/profile` page (change name/password) | `src/app/profile/` |

> Full implementation details for each feature are in `docs/whats-next.md`

---

## Quick Reference — Print This Out

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  START OF EVERY WORK SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
git checkout main
git pull
git checkout -b feature/what-im-building

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHILE CODING (do this often)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
git add .
git commit -m "what I just did"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHEN DONE WITH FEATURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
git push -u origin feature/what-im-building
→ Open Pull Request on GitHub
→ Message Siddhesh on WhatsApp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AFTER SIDDHESH MERGES YOUR PR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
git checkout main
git pull
git branch -d feature/what-im-building
```

---

## All Git Commands Explained

| Command | What it does |
|---|---|
| `git status` | Shows which files you've changed and what's staged |
| `git add .` | Stages ALL changed files ready to commit |
| `git commit -m "msg"` | Saves a snapshot of staged files with a message |
| `git push` | Uploads your commits to GitHub |
| `git pull` | Downloads latest changes from GitHub to your laptop |
| `git checkout main` | Switch to the main branch |
| `git checkout -b name` | Create a new branch called `name` and switch to it |
| `git branch` | List all local branches (current one has a `*`) |
| `git branch -d name` | Delete branch `name` (safe, won't delete if unmerged) |
| `git log --oneline` | Show recent commit history in one line each |
| `git stash` | Temporarily save uncommitted changes without committing |
| `git stash pop` | Bring back your stashed changes |
| `git diff` | Show exactly what lines changed in your files |

