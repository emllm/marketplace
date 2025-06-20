# client/agent.py - Minimal Email Processing Agent
import imaplib
import email
import json
import os
import zipfile
import tempfile
import time
import logging
import docker
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EmailAgent:
    def __init__(self):
        self.imap_host = os.getenv("IMAP_HOST")
        self.imap_user = os.getenv("IMAP_USER")
        self.imap_pass = os.getenv("IMAP_PASS")
        self.docker_client = docker.from_env()
        self.downloads_dir = Path("/app/downloads")
        self.downloads_dir.mkdir(exist_ok=True)

    def connect_email(self):
        """Connect to IMAP server"""
        try:
            mail = imaplib.IMAP4_SSL(self.imap_host, 993)
            mail.login(self.imap_user, self.imap_pass)
            return mail
        except Exception as e:
            logger.error(f"Email connection failed: {e}")
            return None

    def check_emails(self):
        """Check for new AI application emails"""
        mail = self.connect_email()
        if not mail:
            return

        try:
            mail.select("INBOX")
            status, messages = mail.search(None, 'UNSEEN FROM "ai-system"')

            if status == "OK" and messages[0]:
                for email_id in messages[0].split():
                    self.process_email(mail, email_id)

            mail.close()
            mail.logout()
        except Exception as e:
            logger.error(f"Email check failed: {e}")

    def process_email(self, mail, email_id):
        """Process AI application email"""
        try:
            status, msg_data = mail.fetch(email_id, "(RFC822)")
            email_message = email.message_from_bytes(msg_data[0][1])

            # Extract ZIP attachments
            for part in email_message.walk():
                if part.get_content_disposition() == "attachment":
                    filename = part.get_filename()
                    if filename and filename.endswith('.zip'):
                        # Save attachment
                        file_path = self.downloads_dir / filename
                        with open(file_path, 'wb') as f:
                            f.write(part.get_payload(decode=True))

                        # Deploy application
                        self.deploy_app(file_path)

        except Exception as e:
            logger.error(f"Email processing failed: {e}")

    def deploy_app(self, zip_path):
        """Deploy application from ZIP file"""
        try:
            logger.info(f"Deploying app: {zip_path.name}")

            # Extract ZIP
            extract_dir = self.downloads_dir / f"app_{int(time.time())}"
            extract_dir.mkdir(exist_ok=True)

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)

            # Build and run Docker container
            dockerfile = extract_dir / "Dockerfile"
            if dockerfile.exists():
                # Build image
                image_name = f"ai-app-{int(time.time())}"
                self.docker_client.images.build(
                    path=str(extract_dir),
                    tag=image_name
                )

                # Run container
                container = self.docker_client.containers.run(
                    image_name,
                    detach=True,
                    ports={'8080/tcp': None},  # Random port
                    name=f"ai-app-{int(time.time())}"
                )

                logger.info(f"App deployed: {container.name}")
            else:
                logger.error("No Dockerfile found")

        except Exception as e:
            logger.error(f"Deployment failed: {e}")

    def run(self):
        """Main agent loop"""
        logger.info("Starting Email Agent")

        while True:
            try:
                self.check_emails()
                time.sleep(30)  # Check every 30 seconds
            except KeyboardInterrupt:
                logger.info("Agent stopped")
                break
            except Exception as e:
                logger.error(f"Agent error: {e}")
                time.sleep(60)


if __name__ == "__main__":
    agent = EmailAgent()
    agent.run()