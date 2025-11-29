# Job Application Tracker Extension

A Chrome/Firefox extension that helps you **track your job applications directly from the job page**.

Built with React, TypeScript, Vite, and the `chrome-extension-boilerplate-react-vite` starter.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Supported Sites](#supported-sites)
- [How It Works](#how-it-works)
- [Install & Run Locally](#install--run-locally)
- [Usage](#usage)
- [Development Notes](#development-notes)
- [Roadmap](#roadmap)

---

## Overview

This extension is designed for people actively applying for jobs who want a **simple, lightweight way to remember where they applied**.

Instead of managing a separate spreadsheet or Notion table, you can:

- Open a job page (LinkedIn / Greenhouse etc.)
- Click the extension icon
- See a small “wallet-style” popup with:
  - The current job info (company, title, URL)
  - A small form to record this application
  - A list of your past applications

All data is kept in the browser using `chrome.storage.local`.

---

## Core Features

- **Job-aware popup**
  - Shows the current page title and URL
  - Indicates whether this page has already been recorded

- **Auto-fill from job sites**
  - For supported sites, the extension tries to parse the page DOM and auto-fill:
    - Company name
    - Job title / position
    - Work style (On-site / Remote / Hybrid – where available)

- **Quick application form**
  - Fields:
    - Company
    - Position
    - Date (defaults to today)
    - Note (e.g. referral, salary range, extra context)
  - One entry per job URL
  - Re-opening the same job URL lets you update the existing record

- **Application list**
  - Compact list under the form
  - Sorted by date (most recent first)
  - Each row shows company, position, status and applied date
  - `Open` button: opens the original job URL in a new tab
  - `Delete` button: remove a record

---

## Supported Sites

Currently, the extension has custom parsers for:

- **LinkedIn Jobs**
  - Detects LinkedIn job detail pages
  - Extracts:
    - Company name (from unified top card)
    - Job title
    - Work style (On-site / Remote / Hybrid) when present in the “preferences” section

- **Greenhouse job boards** (e.g. `https://job-boards.greenhouse.io/...`)
  - Extracts:
    - Position
    - Company name
  - Special handling for titles like:
    - `Job Application for Senior Quant Developer, Liquidity Platform, Delta One at OKX`
    - `Job Application for Lending UI Developer - London at Galaxy`
  - Falls back to headline / meta tags when the pattern does not match.

Other sites will still work, but you will need to fill the company and position manually.

---

## How It Works

- **Content script** (see `pages/content/`):
  - Runs on all pages
  - For supported domains (LinkedIn, Greenhouse), parses job info from the DOM
  - Listens for a message of type `GET_LINKEDIN_JOB_INFO` and returns structured job info

- **Popup** (see `pages/popup/`):
  - React/TypeScript UI mounted in `popup/index.html`
  - On load, it:
    - Finds the active tab (URL + title)
    - Loads stored applications from `chrome.storage.local`
    - Detects if the current URL is from a supported job site and, if yes, sends a message to the content script to get structured job info
    - Pre-fills the form fields accordingly

- **Storage**
  - All application entries are stored as an array under a single key (currently `jobApplications`) in `chrome.storage.local`.

---

## Install & Run Locally

### Prerequisites

- Node.js version compatible with `.nvmrc` (recommend using `nvm`)
- `pnpm` installed globally:

```bash
npm install -g pnpm
```

### Install dependencies

```bash
pnpm install
```

### Build the extension

```bash
pnpm build
```

### Load in Chrome

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select the `dist` directory in this repo.
5. The extension icon should appear in the toolbar.

> For development with hot reload, you can also use `pnpm dev` and refer to
> `chrome-extension-boilerplate-react-vite.md` for more advanced options.

---

## Usage

1. Navigate to a job posting page.
   - Example: a LinkedIn job detail page or a Greenhouse job page.
2. Click the extension icon to open the popup.
3. Confirm / edit the auto-filled fields:
   - Company
   - Position
   - Date (defaults to today)
   - Note (automatically includes work style for LinkedIn when available)
4. Click **Add record for this page** (or **Update this page record** if already tracked).
5. Scroll down within the popup to view your **Applications list**.

You can always:

- Click **Open** on any entry to revisit the original job posting.
- Click **Delete** to remove an application from the list.

---

## Development Notes

- Tech stack:
  - React + TypeScript
  - TailwindCSS (via the shared `@extension/ui` package)
  - Vite + Turborepo
  - Chrome Extensions Manifest V3

- Main relevant directories:
  - `pages/popup/` – popup UI and logic
  - `pages/content/` – content scripts and job info extraction utilities
  - `chrome-extension/manifest.ts` – extension manifest definition

To customize behaviour (e.g. add new job boards):

- Look at `pages/content/src/utils/` where each site has its own:
  - `is<Site>JobPage.ts`
  - `extract<Site>JobInfo.ts`
- Update the router in `pages/content/src/matches/all/index.ts` to call your new utils.

---

## Roadmap

Planned or possible future improvements:

- **More job boards**
  - Support Lever, Ashby, Workday, and others with dedicated parsers.

- **Status workflow & reminders**
  - Add explicit status steps (applied, interviewing, offer, rejected).
  - Optional reminders to follow up after N days.

- **Search & filters**
  - Filter by company, position, status, or date range.

- **Sync & export**
  - Optionally use `chrome.storage.sync` to share data across devices.
  - Export to CSV so it can be used in spreadsheets/Notion.

---

For details about the underlying boilerplate, see
`chrome-extension-boilerplate-react-vite.md` in the project root.