module.exports = {
  groups: [
    {
      groupName: "Verification",
      groupId: '120363421079207775@g.us',
      formLink: 'https://forms.google.com/your-form-link', // Add your Google Form link here
      googleSheets: [
        {
          sheetId: '1lYlcjnIKqBqUq5lLH9wQPzayQ2Bucsx-8lXum2hiGZ4',
          subSheetName: 'Verified' // Replace with your actual sub-sheet name (e.g., 'Students', 'Members', etc.)
        }
        // Add more sub-sheets if needed:
        // {
        //   sheetId: 'YOUR_NEW_GOOGLE_SHEET_ID_HERE',
        //   subSheetName: 'AnotherSubSheet'
        // }
      ]
    }
    // Add more groups for auto-approval:
    // {
    //   groupName: "Regional Group Name",
    //   groupId: 'GROUP_JID_HERE@g.us',
    //   formLink: 'https://forms.google.com/your-form-link',
    //   googleSheets: [
    //     {
    //       sheetId: 'YOUR_SHEET_ID',
    //       subSheetName: 'SheetName'
    //     }
    //   ]
    // }
  ],
  adminNumber: '+918218049538',
  allowedAllAdmins: ['+918218049538','+918439220962', '+918287675295','+917975465884'], // Fallback list if auto-detection fails
  allowedAllGroups: [
    '120363332203849781@g.us',
    '919941663899-1633177842@g.us',
    '120363348123092213@g.us',
    '120363421150088277@g.us',
    '120363347282322111@g.us',
    '120363332102598014@g.us',
    '120363421079207775@g.us',
    '120363331887862553@g.us',
    '120363319130577663@g.us',
    '120363332444266551@g.us',
    '120363327066859037@g.us',
    '120363417682582361@g.us',
    '120363345961186677@g.us',
    '120363331731691719@g.us',
    '120363349152263421@g.us',
    '120363349370800191@g.us',
    '120363332551124006@g.us',
    '120363351329078354@g.us',
    '120363409892706234@g.us',
    '120363394532156100@g.us',
    '120363316898386527@g.us',
    '120363334027571387@g.us',
    '120363349805629689@g.us'
  ],
  excludedFromAllTag: ['+919876543210'],
  google: {
    credentialsPath: 'credentials.json', // Place your JSON file in the project root or update the path
    tokenPath: undefined // If you use a token file, set the path here
  },
  logFile: 'logs/app.log' // Default log file path
}; 
