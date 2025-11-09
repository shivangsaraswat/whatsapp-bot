const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('../config');
const { findNumberInSheets } = require('./googleSheets');
const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Logger setup
const logFilePath = config.logFile || 'logs/app.log';
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: logFilePath }),
    new winston.transports.Console({
      level: 'warn' // Only print warnings and errors to the terminal
    })
  ]
});

function getGroupByInviteOrName(text) {
  // Try to match group by invite link or name in config
  for (const group of config.groups) {
    if (text.includes(group.inviteLink) || text.toLowerCase().includes(group.groupName.toLowerCase())) {
      return group;
    }
  }
  return null;
}

function extractPhoneNumber(msg) {
  // Try to extract phone number from message or sender
  if (msg.body) {
    const match = msg.body.match(/\+?\d{10,15}/);
    if (match) return match[0];
  }
  if (msg.from) {
    // WhatsApp JID: 911234567890@c.us
    const jidMatch = msg.from.match(/(\d{10,15})@/);
    if (jidMatch) return `+${jidMatch[1]}`;
  }
  return null;
}

async function handleJoinRequest(msg) {
  const number = extractPhoneNumber(msg);
  if (!number) {
    logger.warn('Could not extract phone number from message:', msg.body);
    return;
  }
  const group = getGroupByInviteOrName(msg.body);
  if (!group) {
    logger.warn('No matching group found for message:', msg.body);
    return;
  }
  logger.info(`Checking number ${number} for group ${group.groupName}`);
  const isAllowed = await findNumberInSheets(number, group.googleSheets);
  if (isAllowed) {
    await msg.reply(`✅ You are verified! Here is your group invite link: ${group.inviteLink}`);
    logger.info(`Approved ${number} for group ${group.groupName}`);
  } else {
    await msg.reply(`❌ Sorry, your number is not authorized to join ${group.groupName}. Please fill this form: ${group.formLink}`);
    logger.info(`Rejected ${number} for group ${group.groupName}`);
  }
}

function startBot() {
  console.log('Initializing WhatsApp client...');
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--memory-pressure-off'
      ]
    }
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`Loading: ${percent}% - ${message}`);
  });

  client.on('authenticated', () => {
    console.log('Client is authenticated!');
    // Force ready state after 10 seconds if not triggered
    setTimeout(() => {
      console.log('⏰ Timeout reached - forcing ready check...');
      console.log('📱 Try sending "ping" now - bot should work!');
    }, 10000);
  });

  client.on('auth_failure', msg => {
    console.error('Authentication failure:', msg);
  });

  client.on('qr', (qr) => {
    // Display QR in terminal
    console.log('Scan this QR code to log in:');
    require('qrcode-terminal').generate(qr, { small: true });
  });

  client.on('ready', () => {
    logger.info('WhatsApp bot is ready.');
    console.log('✅✅✅ WhatsApp bot is ready! ✅✅✅');
    console.log('You can now send "ping" or "test" as a direct message to test!');
    // Extra feature: print all group JIDs on first connect
    const firstConnectFlag = path.join(__dirname, '../.wapp_first_connect');
    if (!fs.existsSync(firstConnectFlag)) {
      console.log('All group JIDs:');
      for (const group of config.groups) {
        console.log(`Group Name: ${group.groupName}, JID: ${group.groupId}`);
      }
      fs.writeFileSync(firstConnectFlag, 'connected', 'utf8');
    }
  });

  client.on('message', async (msg) => {
    console.log(`\n📨 ===== NEW MESSAGE =====`);
    console.log(`From: ${msg.from}`);
    console.log(`Body: "${msg.body || '(empty)'}"`);
    console.log(`Type: ${msg.type}`);
    console.log(`Is Group: ${msg.from.endsWith('@g.us')}`);
    console.log(`========================\n`);
    
    // Skip if message has no body
    if (!msg.body) {
      console.log('⚠️ Skipping message - no body');
      return;
    }
    
    // Test/Ping feature: Respond to direct messages (not in groups)
    if (!msg.from.endsWith('@g.us')) {
      const testCommands = ['ping', 'test', 'hello', 'hi', 'status'];
      const msgLower = msg.body.toLowerCase().trim();
      
      // LIST ALL GROUPS COMMAND
      if (msgLower === 'groups' || msgLower === 'list' || msgLower === 'listgroups') {
        console.log('📋 Fetching all groups...');
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        
        let response = `📋 *ALL YOUR WHATSAPP GROUPS* (${groups.length} total)\n\n`;
        
        for (let i = 0; i < groups.length; i++) {
          const group = groups[i];
          const groupName = group.name;
          const groupId = group.id._serialized;
          
          // Highlight verification-related groups
          if (groupName.toLowerCase().includes('verification') || 
              groupName.toLowerCase().includes('verif') ||
              groupName.toLowerCase().includes('council') ||
              groupName.includes('2025') ||
              groupName.includes('2026')) {
            response += `🔴 *${i + 1}. ${groupName}*\n`;
            response += `   📱 ID: \`${groupId}\`\n\n`;
          } else {
            response += `${i + 1}. ${groupName}\n`;
            response += `   ID: \`${groupId}\`\n\n`;
          }
          
          // Log to console with highlighting
          if (groupName.toLowerCase().includes('verification') || 
              groupName.toLowerCase().includes('council') ||
              groupName.includes('2025') ||
              groupName.includes('2026')) {
            console.log(`\n🔴🔴🔴 HIGHLIGHTED: ${groupName}`);
            console.log(`    ID: ${groupId}\n`);
          } else {
            console.log(`${i + 1}. ${groupName} - ID: ${groupId}`);
          }
        }
        
        await msg.reply(response);
        console.log('\n✅ Groups list sent successfully!');
        return;
      }
      
      if (testCommands.includes(msgLower)) {
        await msg.reply('✅ Bot is online and working!\n\n' +
          '📱 Connected Account: Active\n' +
          '📊 Google Sheets: Connected\n' +
          '🤖 Status: Ready\n\n' +
          'Send "help" for available commands.');
        console.log(`Test message received from ${msg.from}`);
        return;
      }
      
      if (msgLower === 'help') {
        await msg.reply('🤖 *WhatsApp Bot Commands*\n\n' +
          '*Test Commands (DM):*\n' +
          '• ping/test/hello - Check if bot is online\n' +
          '• groups/list - Show ALL your WhatsApp groups with IDs\n' +
          '• help - Show this message\n\n' +
          '*Verification Group:*\n' +
          '• verify/PHONENUMBER - Verify a phone number\n' +
          '  Example: verify/919876543210\n\n' +
          '*Admin Commands:*\n' +
          '• @all - Mention all group members (authorized admins only)');
        return;
      }
    }

    const verificationGroupJid = config.groups[0]?.groupId;
    
    console.log(`🔍 Checking verification group...`);
    console.log(`   Message from: ${msg.from}`);
    console.log(`   Verification group: ${verificationGroupJid}`);
    console.log(`   Is verification group: ${msg.from === verificationGroupJid}`);
    
    // Special commands in verification group for bot owner/admin
    if (msg.from === verificationGroupJid) {
      console.log('✅ Message is from VERIFICATION GROUP!');
      const msgLower = msg.body.toLowerCase().trim();
      
      // BOT STATUS CHECK - Works in verification group
      if (msgLower === 'botstatus' || msgLower === 'bot status' || msgLower === '.status') {
        await msg.reply('✅ *Bot is ONLINE and Working!*\n\n' +
          '📱 Connected: Active\n' +
          '📊 Google Sheets: Connected\n' +
          '🤖 Status: Ready\n' +
          '📋 Verification Group: Active\n\n' +
          'All features are operational!');
        console.log('✅ Bot status check from verification group');
        return;
      }
      
      // LIST GROUPS - Works in verification group
      if (msgLower === 'botgroups' || msgLower === 'bot groups' || msgLower === '.groups') {
        console.log('📋 Fetching all groups from verification group...');
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        
        let response = `📋 *ALL GROUPS* (${groups.length} total)\n\n`;
        
        for (let i = 0; i < groups.length; i++) {
          const group = groups[i];
          const groupName = group.name;
          const groupId = group.id._serialized;
          
          // Highlight verification-related groups
          if (groupName.toLowerCase().includes('verification') || 
              groupName.toLowerCase().includes('verif') ||
              groupName.toLowerCase().includes('council') ||
              groupName.includes('2025') ||
              groupName.includes('2026')) {
            response += `🔴 *${i + 1}. ${groupName}*\n`;
            response += `   📱 \`${groupId}\`\n\n`;
            
            console.log(`\n🔴🔴🔴 HIGHLIGHTED: ${groupName}`);
            console.log(`    ID: ${groupId}\n`);
          } else {
            response += `${i + 1}. ${groupName}\n`;
            response += `   \`${groupId}\`\n\n`;
            console.log(`${i + 1}. ${groupName} - ID: ${groupId}`);
          }
        }
        
        await msg.reply(response);
        console.log('\n✅ Groups list sent from verification group!');
        return;
      }
      
      // BOT HELP - Works in verification group
      if (msgLower === 'bothelp' || msgLower === 'bot help' || msgLower === '.help') {
        await msg.reply('🤖 *Bot Commands (Admin)*\n\n' +
          '*Verification Group Commands:*\n' +
          '• botstatus - Check if bot is online\n' +
          '• botgroups - List all groups with IDs\n' +
          '• bothelp - Show this help\n\n' +
          '*Verification:*\n' +
          '• verify/PHONENUMBER - Verify a number\n' +
          '  Example: verify/919876543210\n\n' +
          '*Note:* Regular messages will be deleted to keep group clean.');
        return;
      }
    }
    
    // If message is in the verification group and not a verification command, delete and warn
    if (msg.from === verificationGroupJid && !msg.body.toLowerCase().startsWith('verify/')) {
      try {
        await msg.delete(true); // true = everyone
      } catch (err) {
        logger.warn('Failed to delete message:', err);
      }
      // Tag the sender with a warning in English
      const contact = await msg.getContact();
      const mention = contact;
      await msg.getChat().then(chat => {
        chat.sendMessage(
          `@${contact.number} ⚠️ _This group is strictly for verification purposes. Please follow the instructions and avoid unrelated conversations._`,
          { mentions: [mention] }
        );
      });
      return;
    }
    // Only log and reply for verification-related messages or errors
    if (msg.body && msg.body.toLowerCase().startsWith('verify/')) {
      const numberToCheck = msg.body.split('/')[1]?.replace(/\D/g, '');
      if (!numberToCheck) {
        await msg.reply('Please provide a number to verify, e.g., verify/919876543210');
        return;
      }
      const groupConfig = config.groups.find(g => g.groupId === '120363421079207775@g.us');
      if (!groupConfig) {
        await msg.reply('Group configuration not found.');
        return;
      }
      const result = await findNumberInSheets(numberToCheck, groupConfig.googleSheets);
      if (result.error === 'sheet_load_failed') {
        await msg.reply('⚠️ Sorry, we are unable to verify your entry right now due to a technical issue with the sheet. Please try again later.');
      } else if (result.found) {
        await msg.reply(`✅ Number +${numberToCheck} is VALID.\nName: ${result.name}\nGender: ${result.gender}\nRegion: ${result.region}\nEmail: ${result.email}`);
      } else {
        await msg.reply(`❌ Number +${numberToCheck} is NOT VALID.`);
      }
      return;
    }
    
    // @all feature: Simple authorization check
    if (msg.body && (msg.body.trim() === '@all' || msg.body.trim().startsWith('@all ')) && msg.from.endsWith('@g.us')) {
      console.log('🏷️ @all command detected');
      
      const targetGroupJid = '120363421150088277@g.us';
      
      // Special handling for target group - require authorization
      if (msg.from === targetGroupJid) {
        console.log('🎯 @all used in target group - checking authorization');
        
        try {
          const senderContact = await msg.getContact();
          const senderPhoneNumber = `+${senderContact.number}`;
          
          console.log(`📱 Sender: ${senderPhoneNumber}`);
          console.log(`📋 Allowed: ${JSON.stringify(config.allowedAllAdmins)}`);
          
          // Check if sender is in allowedAllAdmins list
          if (!config.allowedAllAdmins || !config.allowedAllAdmins.includes(senderPhoneNumber)) {
            console.log(`❌ ${senderPhoneNumber} NOT authorized for @all`);
            await msg.reply('❌ *You are not authorized to use the @all command.*\n\n_Only specific admins can use this feature in this group._');
            return;
          }
          
          console.log(`✅ ${senderPhoneNumber} authorized for @all`);
          
          // Get all group members to tag
          const chat = await msg.getChat();
          const mentions = [];
          
          for (const participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            const number = `+${participant.id.user}`;
            
            if (config.excludedFromAllTag && config.excludedFromAllTag.includes(number)) {
              console.log(`⏭️ Skipping excluded: ${number}`);
              continue;
            }
            mentions.push(contact);
          }
          
          console.log(`📢 Tagging ${mentions.length} members`);
          
          // Send @all message with mentions
          let mentionText = '📢 *Group Announcement*\n\n';
          mentionText += mentions.map(contact => `@${contact.number}`).join(' ');
          mentionText += '\n\n👆 Everyone has been tagged!';
          
          await client.sendMessage(msg.from, mentionText, { mentions });
          console.log('✅ @all sent successfully');
          
        } catch (error) {
          console.error('❌ Error in @all:', error);
          await msg.reply('⚠️ An error occurred while processing @all.');
        }
        return;
      }
      
      // For other groups - ignore silently
      console.log(`🔇 @all used in group ${msg.from} - ignoring silently`);
      return;
    }
    
    // Sticker blocking removed for group 120363421150088277@g.us
    // All other messages: do not log or reply
  });

  client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
  });

  console.log('Starting client initialization...');
  client.initialize().catch(err => {
    console.error('Failed to initialize client:', err);
    process.exit(1);
  });
}

module.exports = {
  startBot: startBot
};