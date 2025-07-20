
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
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', (qr) => {
    // Display QR in terminal
    console.log('Scan this QR code to log in:');
    require('qrcode-terminal').generate(qr, { small: true });
  });

  client.on('ready', () => {
    logger.info('WhatsApp bot is ready.');
    console.log('WhatsApp bot is ready.');
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
    const verificationGroupJid = config.groups[0]?.groupId;
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
    // @all feature: mention all group members if sender is authorized admin
    if (msg.body && msg.body.trim() === '@all' && msg.from.endsWith('@g.us')) {
      // Only allow @all in specific groups
      if (!config.allowedAllGroups.includes(msg.from)) {
        return;
      }
      const chat = await msg.getChat();
      const senderId = msg.author || msg.from;
      // First check if sender is admin
      const isAdmin = chat.participants?.find(p => p.id._serialized === senderId && (p.isAdmin || p.isSuperAdmin));
      if (!isAdmin) {
        await msg.reply('Only group admins can use @all.');
        return;
      }
      // Extract sender's phone number for additional security check
      const senderNumber = extractPhoneNumber({ from: senderId });
      if (!senderNumber) {
        await msg.reply('Could not verify your number. Contact administrator.');
        return;
      }
      // Check if sender's number is in the allowed list
      const isAllowedAdmin = config.allowedAllAdmins.includes(senderNumber);
      if (!isAllowedAdmin) {
        await msg.reply('You are not authorized to use @all feature. Contact administrator.');
        return;
      }
      // Get all group members except the bot itself and excluded numbers
      const mentions = [];
      for (const participant of chat.participants) {
        // Get the contact
        const contact = await client.getContactById(participant.id._serialized);
        // Extract the number in WhatsApp format
        const number = `+${participant.id.user}`;
        // Skip if the number is in the excludedFromAllTag list
        if (config.excludedFromAllTag && config.excludedFromAllTag.includes(number)) {
          continue;
        }
        mentions.push(contact);
      }
      await chat.sendMessage('Attention Everyone!', { mentions });
      return;
    }
    // Block stickers in the specified group
    const stickerBlockGroupJid = '120363421150088277@g.us';
    if (msg.from === stickerBlockGroupJid && msg.type === 'sticker') {
      // Delete the sticker message
      try {
        await msg.delete(true);
      } catch (err) {
        logger.warn('Failed to delete sticker message:', err);
      }
      // Tag the sender with a warning
      const contact = await msg.getContact();
      const mention = contact;
      await msg.getChat().then(chat => {
        chat.sendMessage(
          `@${contact.number} ⚠️ _Stickers are not allowed in this group. Please follow the instructions._`,
          { mentions: [mention] }
        );
      });
      return;
    }
    // All other messages: do not log or reply
  });
  client.initialize();
}

module.exports = {
  startBot: startBot
};