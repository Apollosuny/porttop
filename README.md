# Porttop ⚓️

A state-of-the-art terminal toolkit for inspecting active listening ports, debugging network conflicts, and managing local processes with style. Built with [Ink](https://github.com/vadimdemedes/ink) and [Bun](https://bun.sh).

![License](https://img.shields.io/npm/l/porttop)
![Version](https://img.shields.io/npm/v/porttop)

---

## Features

- 🚀 **Lightning Fast**: Built on top of native system tools for immediate results.
- 📊 **Interactive Dashboard**: A beautiful, real-time TUI dashboard to monitor all active ports.
- 🔍 **Deep Inspection**: See exactly which process is using which port, including PIDs and commands.
- 🛠 **Multiple Views**: Choose between a rich interactive dashboard or a clean, plain-text list for scripting.
- 🎨 **Beautiful UI**: Modern terminal aesthetics with vibrant colors and smooth transitions.

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
Output a simplified list of listening ports (great for quick checks).
```bash
porttop list
```

#### Inspect Port
Get detailed information about a specific port number.
```bash
porttop inspect 3000
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
