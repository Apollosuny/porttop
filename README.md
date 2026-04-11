# Porttop ⚓️

A state-of-the-art terminal toolkit for inspecting active listening ports, debugging network conflicts, and managing local processes with style. Built with [Ink](https://github.com/vadimdemedes/ink) and [Bun](https://bun.sh).

![License](https://img.shields.io/npm/l/porttop)
![Version](https://img.shields.io/npm/v/porttop)

---

## Features

- 🚀 **Lightning Fast**: Built on top of native system tools with multi-backend support (`lsof`, `ss`, `netstat`).
- 📊 **Interactive Dashboard**: A beautiful, real-time TUI dashboard with sorting, filtering, and grouping.
- 🐳 **Docker Aware**: Automatically identifies Docker containers and images using specific ports.
- 🕵️‍♂️ **Service Intelligence**: Detects 50+ common services (React, Next.js, Postgres, Redis, etc.).
- 🛡 **Security First**: Highlights public vs. local bindings and provides fix suggestions for conflicts.
- 📋 **Automation Ready**: Export data as JSON, CSV, or Markdown. Use watch mode for real-time CLI monitoring.
- 🎨 **Beautiful UI**: Modern terminal aesthetics with vibrant Cyberpunk colors and smooth transitions.

---

## Installation

Install globally via **npm**:

```bash
npm install -g porttop
```

Or run it instantly without installation using **npx**:

```bash
npx porttop
```

---

## Usage

Porttop comes with two command aliases: `porttop` (the full name) and `ports` (for quick typing).

### Commands

#### Home Screen
Show the welcome screen and quick actions.
```bash
porttop
```

#### Interactive Dashboard
Open the live-updating TUI dashboard to browse and inspect ports.
```bash
porttop dashboard
```

#### List View
Output listening ports with advanced filtering and export options.
```bash
porttop list                      # Normal table view
porttop list --watch              # Watch mode (refresh every 2s)
porttop list --json               # Export as JSON
porttop list --csv                # Export as CSV
porttop list --markdown           # Export as Markdown table
porttop list --ignore-port 5432   # Filter out specific ports
```

#### Inspect Port
Get detailed information about a specific port, including Docker info and resource usage.
```bash
porttop inspect 3000
porttop inspect 3000 --copy pid   # Copy PID to clipboard
```

#### Check Port
Check if a port is available or occupied. Returns exit code 1 if occupied.
```bash
porttop check 3000
```

#### Scan Range
Scan a range of ports to find what's running.
```bash
porttop scan 3000-3010
porttop scan --from 3000 --to 4000 --show-free
```

#### Find Free Port
Find the next available port or check a specific one and get a suggestion.
```bash
porttop free 3000
```

#### Kill Process
Kill processes occupying a port or by PID directly.
```bash
porttop kill 3000
porttop kill --pid 12345 --force
```

---

## Dashboard Keyboard Shortcuts

When in the **Interactive Dashboard**, use these keys:

- `↑ / ↓ / k / j`: Navigate through port list
- `Enter`: Inspect selected port details
- `/`: Start filtering (Search)
- `s / S`: Cycle sort field / Reverse sort direction
- `g`: Toggle grouped view (by PID)
- `x`: Kill selected process (with confirmation)
- `c / C`: Copy port / PID to clipboard
- `y`: Copy full row info to clipboard
- `r`: Refresh list manually
- `?`: Toggle help modal
- `q / Esc`: Exit mode or Quit

---

## Configuration

You can create a `.porttoprc` file in your home directory or project root to save default settings:

```json
{
  "ignoreProcesses": ["Docker", "rapportd"],
  "ignorePorts": [22, 443],
  "theme": "cyberpunk",
  "refreshInterval": 2
}
```

---

## Development

If you want to contribute or run the project from source:

### Prerequisites
- [Bun](https://bun.sh) installed on your system.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Apollosuny/porttop.git
   cd porttop
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run in development mode:
   ```bash
   bun dev
   ```
4. Build for production:
   ```bash
   bun run build
   ```

---

## License

[MIT](LICENSE) © [trungtran](https://github.com/Apollosuny)
