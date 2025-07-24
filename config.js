module.exports = {
  groups: [
    {
      groupName: "Verification",
      groupId: '',// groupId
      googleSheets: [
        ''// googleSheets
      ]
    }
  ],
  adminNumber: '',//  adminNumber
  allowedAllAdmins: [''],// allowedAllAdmins
  allowedAllGroups: [
    '',// allowedAllGroups ids
    
  ],
  excludedFromAllTag: [''],//excludedFromAllnumber
  google: {
    credentialsPath: 'credentials.json', // Place your JSON file in the project root or update the path
    tokenPath: undefined // If you use a token file, set the path here
  },
  logFile: 'logs/app.log' // Default log file path
}; 
