# Create New Google Service Account

## Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project "task-booking-app" (or create new one)
3. Navigate to IAM & Admin → Service Accounts
4. Click "Create Service Account"
5. Name: `whatsapp-bot`
6. Email will be: `whatsapp-bot@task-booking-app.iam.gserviceaccount.com`
7. Grant role: "Editor" or "Sheets API User"
8. Click "Create Key" → JSON
9. Download and replace `credentials.json`

## Enable APIs:
- Google Sheets API
- Google Drive API

## Share Sheet:
Share your Google Sheet with the new service account email.