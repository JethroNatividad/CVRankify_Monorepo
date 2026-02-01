#!/usr/bin/env python3
"""
Development server with hot reload capability.
Watches for file changes and automatically restarts the worker.
"""

import sys
import time
import subprocess
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class RestartHandler(FileSystemEventHandler):
    """Handles file system events and triggers worker restart"""
    
    def __init__(self, restart_callback):
        self.restart_callback = restart_callback
        self.last_modified = time.time()
        # Debounce time in seconds to avoid multiple restarts
        self.debounce_time = 1.0
        
    def on_modified(self, event):
        """Called when a file is modified"""
        if event.is_directory:
            return
            
        # Only restart for Python files
        if not event.src_path.endswith('.py'):
            return
            
        # Ignore __pycache__ and env directories
        if '__pycache__' in event.src_path or '/env/' in event.src_path:
            return
            
        current_time = time.time()
        if current_time - self.last_modified > self.debounce_time:
            self.last_modified = current_time
            print(f"\n📝 File changed: {event.src_path}")
            self.restart_callback()

class WorkerRunner:
    """Manages the worker process lifecycle"""
    
    def __init__(self):
        self.process = None
        self.base_path = Path(__file__).parent
        
    def start(self):
        """Start the worker process"""
        if self.process:
            self.stop()
            
        print("\n🚀 Starting worker...")
        python_executable = sys.executable
        
        self.process = subprocess.Popen(
            [python_executable, "-u", "main.py"],
            cwd=self.base_path,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        
    def stop(self):
        """Stop the worker process"""
        if self.process:
            print("\n⏸️  Stopping worker...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print("⚠️  Worker didn't stop gracefully, forcing...")
                self.process.kill()
                self.process.wait()
            self.process = None
            
    def restart(self):
        """Restart the worker process"""
        print("\n🔄 Restarting worker...")
        self.stop()
        time.sleep(0.5)  # Small delay to ensure clean shutdown
        self.start()

def main():
    """Main entry point for the development server"""
    print("=" * 60)
    print("🔥 Hot Reload Development Server")
    print("=" * 60)
    print("\nWatching for changes in:")
    print("  - *.py files")
    print("  - src/ directory")
    print("\nPress Ctrl+C to stop\n")
    
    runner = WorkerRunner()
    runner.start()
    
    # Setup file watcher
    event_handler = RestartHandler(runner.restart)
    observer = Observer()
    
    # Watch the current directory and src directory
    base_path = Path(__file__).parent
    observer.schedule(event_handler, str(base_path), recursive=True)
    observer.schedule(event_handler, str(base_path / "src"), recursive=True)
    
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down development server...")
        observer.stop()
        runner.stop()
        
    observer.join()
    print("✅ Development server stopped\n")

if __name__ == "__main__":
    main()
