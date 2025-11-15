# Auto-Approve Join Requests - Setup Guide

## ✅ What This Feature Does

When a student requests to join a WhatsApp group:
1. Bot **automatically detects** the join request
2. Bot **verifies** their phone number against Google Sheets
3. Bot **auto-approves** if valid OR **auto-rejects** if invalid
4. Bot **sends DM notification** to the student
5. Bot **logs everything** to logs/app.log

**No manual admin intervention needed!**

---

## 🔧 Setup Requirements

### 1. Bot Must Be Group Admin
- Add your bot number to the WhatsApp group
- Make the bot an **admin** (required for approving/rejecting)
- Without admin rights, bot cannot add/remove users

### 2. Configure Groups in config.js

```javascript
groups: [
  {
    groupName: "Regional Group North",
    groupId: '1234567890@g.us', // Get this using 'botgroups' command
    formLink: 'https://forms.google.com/your-registration-form',
    googleSheets: [
      {
        sheetId: 'YOUR_GOOGLE_SHEET_ID',
        subSheetName: 'Verified' // Sheet tab name
      }
    ]
  },
  {
    groupName: "Regional Group South",
    groupId: '0987654321@g.us',
    formLink: 'https://forms.google.com/your-registration-form',
    googleSheets: [
      {
        sheetId: 'YOUR_GOOGLE_SHEET_ID',
        subSheetName: 'Verified'
      }
    ]
  }
]
```

### 3. Google Sheets Format
Your Google Sheet must have these columns:
- **Column A:** (Any data)
- **Column B:** Name
- **Column C:** Email
- **Column D:** Phone Number (e.g., 919876543210)
- **Column E:** Gender
- **Column F:** (Any data)
- **Column G:** Region

---

## 📋 How to Get Group IDs

1. Send `botgroups` command in your verification group
2. Or send `groups` command via DM to bot
3. Copy the group ID (format: `1234567890@g.us`)
4. Add to config.js

---

## 🚀 Testing the Feature

### Test 1: Valid User
1. Add a test phone number to your Google Sheet
2. Request to join the group from that number
3. Bot should auto-approve and send welcome DM

### Test 2: Invalid User
1. Request to join from a number NOT in Google Sheet
2. Bot should auto-reject and send rejection DM with form link

### Test 3: Check Logs
```bash
tail -f logs/app.log
```
You should see:
- `✅ AUTO-APPROVED: +919876543210 (Name) for GroupName`
- `❌ AUTO-REJECTED: +919876543210 for GroupName - Not in sheets`

---

## 📱 User Experience

### When Approved:
```
✅ Welcome John Doe!

You have been approved and added to Regional Group North.

📍 Region: North India
📧 Email: john@example.com

You can now participate in the group.
```

### When Rejected:
```
❌ Join Request Rejected

Your request to join Regional Group North was not approved.

Reason: Your phone number (+919876543210) is not registered in our system.

📝 Please fill out the registration form first:
https://forms.google.com/your-form-link

After registration, you can request to join again.
```

---

## ⚠️ Important Notes

1. **Bot must be admin** in the group
2. **Group must be configured** in config.js
3. **Phone numbers** are matched as digits only (formatting ignored)
4. **DM notifications** may fail if user has strict privacy settings
5. **Logs** are saved in `./logs/app.log`

---

## 🔍 Troubleshooting

### Bot not detecting join requests
- Check if bot is admin in the group
- Verify group ID in config.js is correct
- Check logs: `tail -f logs/app.log`

### Bot not approving/rejecting
- Verify Google Sheets has correct phone number format
- Check if Google Sheets API is working (test with `verify/` command)
- Ensure bot has admin rights

### DM notifications not sending
- User may have privacy settings blocking unknown numbers
- Check logs for DM errors
- This is normal - WhatsApp privacy limitation

---

## 🎯 Next Steps

After setup:
1. Test with your own number first
2. Add all regional groups to config.js
3. Make bot admin in all groups
4. Monitor logs for first few days
5. Adjust as needed

---

## 💡 Pro Tips

- Use `botstatus` to check if bot is online
- Use `botgroups` to list all groups with IDs
- Keep Google Sheets updated in real-time
- Monitor logs regularly: `tail -f logs/app.log`
- Bot works 24/7 - no manual intervention needed!
