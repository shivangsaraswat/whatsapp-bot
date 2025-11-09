// Quick test to verify service account
const { google } = require('googleapis');
const fs = require('fs');

async function testServiceAccount() {
  try {
    const credentials = JSON.parse(fs.readFileSync('./credentials.json'));
    console.log('Service Account Email:', credentials.client_email);
    console.log('Project ID:', credentials.project_id);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    const authClient = await auth.getClient();
    console.log('✅ Service account authentication successful');
    
    // Test Sheets API
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Sheets API client created successfully');
    
  } catch (error) {
    console.error('❌ Service account error:', error.message);
  }
}

testServiceAccount();