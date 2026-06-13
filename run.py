"""Launch CertPilot web app in one command.

Usage:
    python run.py

Installs Python/npm dependencies when needed, builds the frontend if missing,
starts the FastAPI server, and opens the browser.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VENV_DIR = ROOT / ".venv"
WEB_DIR = ROOT / "app" / "web"
DIST_DIR = WEB_DIR / "dist"
HOST = "127.0.0.1"
PORT = 8000
URL = f"http://{HOST}:{PORT}"

# agent-framework[all] conflicts with azure-search-documents>=12.1.0b1; this set works.
PYTHON_PACKAGES = [
    "agent-framework-core",
    "agent-framework-openai",
    "azure-ai-projects",
    "azure-identity",
    "azure-search-documents>=12.1.0b1",
    "openai",
    "python-dotenv",
    "httpx",
    "rich",
    "fastapi",
    "uvicorn",
    "mcp>=1.24.0",
]


def log(msg: str) -> None:
    print(f"[certpilot] {msg}", flush=True)


def venv_python() -> Path:
    if sys.platform == "win32":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def run(cmd: list[str], *, cwd: Path | None = None, env: dict[str, str] | None = None) -> None:
    log(f"{' '.join(cmd)}")
    subprocess.run(cmd, cwd=cwd or ROOT, env=env, check=True)


def ensure_env_file() -> None:
    env_file = ROOT / ".env"
    if env_file.exists():
        return
    for candidate in (ROOT / "env", ROOT / ".env.example"):
        if candidate.exists():
            shutil.copy(candidate, env_file)
            log(f"Created .env from {candidate.name}")
            return
    log("Warning: no .env found. Copy .env.example to .env and add Azure credentials.")


def ensure_venv() -> Path:
    py = venv_python()
    if py.exists():
        return py
    log("Creating virtual environment (.venv)...")
    run([sys.executable, "-m", "venv", str(VENV_DIR)])
    if not py.exists():
        raise RuntimeError("Failed to create virtual environment.")
    return py


def ensure_python_deps(py: Path) -> None:
    log("Installing Python dependencies...")
    run([str(py), "-m", "pip", "install", "--upgrade", "pip"], env=os.environ.copy())
    run([str(py), "-m", "pip", "install", *PYTHON_PACKAGES], env=os.environ.copy())


def ensure_node_tool(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise RuntimeError(f"{name} not found. Install Node.js 20+ and add it to PATH.")
    return path


def ensure_frontend() -> None:
    npm = ensure_node_tool("npm")
    node_modules = WEB_DIR / "node_modules"
    if not node_modules.exists():
        log("Installing frontend dependencies (npm install)...")
        run([npm, "install"], cwd=WEB_DIR)
    if not (DIST_DIR / "index.html").exists():
        log("Building frontend (npm run build)...")
        run([npm, "run", "build"], cwd=WEB_DIR)


def wait_for_server(timeout: float = 60.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"{URL}/api/learners", timeout=2) as resp:
                if resp.status == 200:
                    return True
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            time.sleep(0.4)
    return False


def main() -> int:
    os.chdir(ROOT)
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")

    ensure_env_file()
    py = ensure_venv()
    ensure_python_deps(py)
    ensure_frontend()

    log(f"Starting server at {URL}")
    server_env = os.environ.copy()
    server_env["PYTHONIOENCODING"] = "utf-8"

    proc = subprocess.Popen(
        [str(py), "-m", "uvicorn", "app.server:app", "--host", HOST, "--port", str(PORT)],
        cwd=ROOT,
        env=server_env,
    )

    try:
        if wait_for_server():
            log("Opening browser...")
            webbrowser.open(URL)
        else:
            log("Server did not respond in time. Open the URL manually.")

        log("Press Ctrl+C to stop the server.")
        return proc.wait()
    except KeyboardInterrupt:
        log("Stopping server...")
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
