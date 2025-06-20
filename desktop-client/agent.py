import os
import sys
import json
import logging
import requests
from typing import Optional, Dict, Any
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('agent.log')
    ]
)
logger = logging.getLogger(__name__)

class DesktopAgent:
    def __init__(self, api_url: str = "http://localhost:8000"):
        """Initialize the desktop agent with API configuration."""
        self.api_url = api_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'DesktopAgent/1.0'
        })
        
        # Ensure data directory exists
        self.data_dir = Path.home() / '.email-marketplace'
        self.data_dir.mkdir(exist_ok=True)
    
    def get_config(self) -> Dict[str, Any]:
        """Load configuration from file."""
        config_path = self.data_dir / 'config.json'
        if config_path.exists():
            with open(config_path, 'r') as f:
                return json.load(f)
        return {}
    
    def save_config(self, config: Dict[str, Any]) -> None:
        """Save configuration to file."""
        config_path = self.data_dir / 'config.json'
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def check_updates(self) -> Optional[Dict[str, Any]]:
        """Check for updates from the server."""
        try:
            response = self.session.get(f"{self.api_url}/api/updates")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to check for updates: {e}")
            return None
    
    def send_heartbeat(self) -> bool:
        """Send a heartbeat to the server."""
        try:
            response = self.session.post(
                f"{self.api_url}/api/heartbeat",
                json={"status": "online"}
            )
            return response.status_code == 200
        except requests.RequestException as e:
            logger.error(f"Failed to send heartbeat: {e}")
            return False
    
    def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Process a task from the server."""
        try:
            task_type = task.get('type')
            logger.info(f"Processing task of type: {task_type}")
            
            # TODO: Implement task processing logic
            # This is a placeholder for actual task processing
            
            return {
                "task_id": task.get('id'),
                "status": "completed",
                "result": {"message": "Task processed successfully"}
            }
            
        except Exception as e:
            logger.error(f"Error processing task: {e}")
            return {
                "task_id": task.get('id'),
                "status": "error",
                "error": str(e)
            }

def main():
    """Main entry point for the desktop agent."""
    agent = DesktopAgent()
    logger.info("Desktop agent started")
    
    try:
        # Example: Check for updates on startup
        updates = agent.check_updates()
        if updates:
            logger.info(f"Found {len(updates.get('tasks', []))} pending tasks")
        
        # Main loop would go here
        # For now, just keep the agent running
        import time
        while True:
            agent.send_heartbeat()
            time.sleep(60)  # Send heartbeat every minute
            
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
    finally:
        logger.info("Desktop agent stopped")

if __name__ == "__main__":
    main()
