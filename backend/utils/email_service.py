import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def send_confirmation_email(company_email: str, company_name: str, customer_name: str):
    """
    Sends an automated email to the company when a customer is confirmed.
    Currently runs in MOCK mode and prints to the console.
    """
    subject = "Project Confirmation Update"
    body = (
        f"Hello {company_name},\n\n"
        f"Thank you for giving an important lead ({customer_name}) and we've cracked it. "
        f"We are going forward with the project and remaining details will be updated as follows.\n\n"
        f"Best regards,\n"
        f"The CRM Team"
    )

    # --- MOCK EMAIL SENDING ---
    logger.info("=" * 40)
    logger.info(f"MOCK EMAIL DISPATCHED TO: {company_email}")
    logger.info(f"SUBJECT: {subject}")
    logger.info("-" * 40)
    logger.info(body)
    logger.info("=" * 40)
    
    # To implement real email sending in the future, you would use smtplib here:
    # import smtplib
    # from email.mime.text import MIMEText
    # msg = MIMEText(body)
    # msg['Subject'] = subject
    # msg['From'] = "your-email@example.com"
    # msg['To'] = company_email
    # with smtplib.SMTP_SSL('smtp.example.com', 465) as server:
    #     server.login("user", "password")
    #     server.send_message(msg)
