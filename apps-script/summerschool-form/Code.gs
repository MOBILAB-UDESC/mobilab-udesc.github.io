// Summer School application intake.
//
// Source of the Google Apps Script web app behind the form in
// static/summerschool/index.html (ENDPOINT). The live copy is the standalone
// project "MobiLab Summer School form" in the MobiLab Google account. It writes
// to the "MobiLab Summer School - Applications" spreadsheet and sends the
// confirmation email.
//
// This repo is public, so the spreadsheet ID only lives in the deployed copy.
// To update the live form: paste this file into the project, fill in
// SPREADSHEET_ID, then Deploy > Manage deployments > Edit > Version: New version
// (this keeps the web app URL unchanged).
// Deploy as: Web app, Execute as "Me", Access "Anyone".

const SPREADSHEET_ID = 'SPREADSHEET_ID'; // set in the deployed copy only
const SHEET_NAME = 'Sheet1';
const MIN_FILL_MS = 3000; // anything faster than this is a bot

const FIELDS = [
  // [column key, max length, required]
  ['name', 120, true],
  ['email', 200, true],
  ['university', 200, true],
  ['course', 200, false],
  ['semester', 60, false],
  ['links', 1000, false],
  ['why', 1500, true],
  ['projects', 2000, true],
  ['availability', 20, true],
  ['experience', 40, true],
  ['source', 200, false],
];

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Spam traps: honeypot field and implausibly fast submissions.
  // Answer "ok" so bots learn nothing.
  if (p.website) return out('ok');
  const started = Number(p.t);
  if (started && Date.now() - started < MIN_FILL_MS) return out('ok');

  if (p.consent !== 'yes') return out('invalid');

  const row = {};
  for (const [key, max, required] of FIELDS) {
    const value = clean(p[key], max);
    if (required && !value) return out('invalid');
    row[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return out('invalid');

  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    lock.waitLock(15000);
    locked = true;

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = [
      new Date(),
      ...FIELDS.map(([key]) => row[key]),
      'yes',
    ];

    // Same email applying again: update the existing row instead of duplicating.
    const existing = findRowByEmail(sheet, row.email);
    if (existing) {
      sheet.getRange(existing, 1, 1, values.length).setValues([values]);
    } else {
      sheet.appendRow(values);
    }
  } catch (err) {
    console.error(err);
    return out('error');
  } finally {
    if (locked) lock.releaseLock();
  }

  // The application is already saved; a mail failure must not fail the request.
  try {
    sendConfirmation(row.name, row.email);
  } catch (err) {
    console.error('confirmation email failed', err);
  }
  return out('ok');
}

function doGet() {
  return out('ok');
}

function findRowByEmail(sheet, email) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const emails = sheet.getRange(2, 3, last - 1, 1).getValues(); // column C
  const wanted = email.toLowerCase();
  for (let i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase() === wanted) return i + 2;
  }
  return 0;
}

// Trim, cap length, and neutralise spreadsheet formulas (=, +, -, @).
function clean(value, max) {
  let s = String(value == null ? '' : value).trim().slice(0, max);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

const SITE = 'https://mobilab.joinville.udesc.br';
const CONTACT = 'mobi.cct@udesc.br';

function sendConfirmation(name, email) {
  const first = firstName(name);
  MailApp.sendEmail({
    to: email,
    subject: 'We received your application - Robotics and Embodied AI Summer School',
    name: 'MobiLab UDESC',
    replyTo: CONTACT,
    body: confirmationText(first),
    htmlBody: confirmationHtml(first),
  });
}

// First word of the name, without the leading ' added by clean() for formulas.
function firstName(name) {
  return String(name).replace(/^'/, '').trim().split(/\s+/)[0] || 'there';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function confirmationText(first) {
  return (
    'Hi ' + first + ',\n\n' +
    'We received your application to the Robotics and Embodied AI Summer School.\n\n' +
    'WHEN   February 15-19, 2027, 9 AM to 5 PM\n' +
    'WHERE  UDESC CCT, Joinville, Brazil\n\n' +
    'KEY DATES\n' +
    'December 30, 2026     Last day to apply\n' +
    'January 20, 2027      Selection results by email\n' +
    'February 15-19, 2027  Summer school week, after Carnival\n\n' +
    'WHAT HAPPENS NEXT\n' +
    '01  We review every application, based on your answers and the links you shared.\n' +
    '02  We form the teams: 30 participants, 6 teams of 5, each with its own robot.\n' +
    '03  You get the result by email on January 20, 2027.\n\n' +
    'Registering does not guarantee a spot. If you need to change anything, submit ' +
    'the form again with the same email and your answers will be updated.\n\n' +
    'Program: ' + SITE + '/summerschool/#program\n' +
    'Questions? Reply to this email or write to ' + CONTACT + '.\n\n' +
    'MobiLab UDESC\n' +
    'Autonomous Systems and Mobile Robotics Laboratory\n' +
    'Department of Electrical Engineering, CCT, UDESC, Joinville, SC, Brazil'
  );
}

function confirmationHtml(first) {
  const SANS = "'IBM Plex Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
  const SERIF = "'Newsreader', Georgia, 'Times New Roman', serif";
  const MONO = "'IBM Plex Mono', Menlo, Consolas, 'Courier New', monospace";

  const step = (n, text, last) =>
    '<tr><td style="padding:16px 0;' + (last ? '' : 'border-bottom:1px solid #d9ddd6;') + '">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>' +
      '<td width="44" valign="top" style="font-family:' + MONO + ';font-size:13px;color:#1a4a24;padding-top:3px">' + n + '</td>' +
      '<td valign="top" style="font-family:' + SANS + ';font-size:16px;line-height:1.55;color:#3b423d">' + text + '</td>' +
      '</tr></table></td></tr>';

  const keyDate = (date, text, last) =>
    '<tr><td style="padding:14px 0;' + (last ? '' : 'border-bottom:1px solid #d9ddd6;') + '">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>' +
      '<td width="150" valign="top" style="font-family:' + MONO + ';font-size:13px;color:#1a4a24;padding-top:3px">' + date + '</td>' +
      '<td valign="top" style="font-family:' + SANS + ';font-size:16px;line-height:1.55;color:#3b423d">' + text + '</td>' +
      '</tr></table></td></tr>';

  const fact = (label, value) =>
    '<td class="stack" valign="top" style="padding:0 24px 20px 0">' +
      '<div style="font-family:' + MONO + ';font-size:11px;letter-spacing:0.1em;color:#a8b8ad">' + label + '</div>' +
      '<div style="font-family:' + SANS + ';font-size:16px;font-weight:500;color:#f2f4f1;padding-top:4px">' + value + '</div>' +
    '</td>';

  const link = (href, text) =>
    '<a href="' + href + '" style="color:#03b05a;text-decoration:none">' + text + '</a>';

  return (
'<!doctype html>' +
'<html lang="en"><head><meta charset="utf-8">' +
'<meta name="viewport" content="width=device-width, initial-scale=1">' +
'<meta name="color-scheme" content="light only">' +
'<title>We received your application</title>' +
'<style>' +
'@media only screen and (max-width:600px){' +
'.wrap{width:100%!important}' +
'.pad{padding-left:24px!important;padding-right:24px!important}' +
'.stack{display:block!important;width:100%!important;padding-right:0!important}' +
'.title{font-size:32px!important}' +
'}' +
'</style></head>' +
'<body style="margin:0;padding:0;background:#f5f6f3">' +
'<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f5f6f3">Your application is in. Results by email on January 20, 2027.</div>' +
'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f6f3"><tr><td align="center" style="padding:24px 12px">' +
'<table role="presentation" class="wrap" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;border-radius:6px;overflow:hidden">' +

// Hero
'<tr><td class="pad" style="background:#0a1c10;padding:32px 40px 8px">' +
  '<img src="' + SITE + '/summerschool/mobilab-logo.png" alt="MobiLab" height="44" style="display:block;height:44px;width:auto;border:0">' +
'</td></tr>' +
'<tr><td class="pad" style="background:#0a1c10;padding:36px 40px 12px">' +
  '<div style="font-family:' + MONO + ';font-size:13px;letter-spacing:0.1em;color:#03b05a">FEBRUARY 15-19, 2027</div>' +
  '<h1 class="title" style="margin:16px 0 0;font-family:' + SERIF + ';font-weight:400;font-size:40px;line-height:1.08;letter-spacing:-0.02em;color:#f2f4f1">Application received</h1>' +
  '<p style="margin:16px 0 0;font-family:' + SANS + ';font-size:17px;line-height:1.55;color:#d5dad6">Robotics and Embodied AI Summer School</p>' +
'</td></tr>' +
'<tr><td class="pad" style="background:#0a1c10;padding:20px 40px 20px">' +
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #1d3a26"><tr><td style="padding-top:20px">' +
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' +
    fact('WHEN', 'Feb 15-19, 2027') +
    fact('HOURS', '9 AM to 5 PM') +
    fact('WHERE', 'UDESC CCT, Joinville') +
  '</tr></table></td></tr></table>' +
'</td></tr>' +

// Body
'<tr><td class="pad" style="background:#ffffff;padding:40px 40px 8px">' +
  '<p style="margin:0 0 16px;font-family:' + SERIF + ';font-size:24px;line-height:1.3;color:#0a1c10">Hi ' + escapeHtml(first) + ',</p>' +
  '<p style="margin:0;font-family:' + SANS + ';font-size:16px;line-height:1.6;color:#3b423d">Thank you for applying. We received your application and the organizers will review it soon.</p>' +
'</td></tr>' +
'<tr><td class="pad" style="background:#ffffff;padding:28px 40px 8px">' +
  '<div style="font-family:' + MONO + ';font-size:13px;letter-spacing:0.1em;color:#555d57;padding-bottom:12px">KEY DATES</div>' +
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #0a1c10">' +
    keyDate('Dec 30, 2026', 'Last day to apply') +
    keyDate('Jan 20, 2027', 'Selection results by email') +
    keyDate('Feb 15-19, 2027', 'Summer school week, after Carnival', true) +
  '</table>' +
'</td></tr>' +
'<tr><td class="pad" style="background:#ffffff;padding:28px 40px 8px">' +
  '<div style="font-family:' + MONO + ';font-size:13px;letter-spacing:0.1em;color:#555d57;padding-bottom:12px">WHAT HAPPENS NEXT</div>' +
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #0a1c10">' +
    step('01', 'We review every application, based on your answers and the links you shared.') +
    step('02', 'We form the teams: 30 participants in 6 teams of 5, each team with its own robot.') +
    step('03', 'You get the result by email on <strong style="color:#0a1c10">January 20, 2027</strong>.', true) +
  '</table>' +
'</td></tr>' +
'<tr><td class="pad" style="background:#ffffff;padding:24px 40px 8px">' +
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>' +
  '<td style="background:#f5f6f3;border-left:3px solid #03b05a;padding:16px 20px;font-family:' + SANS + ';font-size:15px;line-height:1.6;color:#3b423d">' +
  'Registering does not guarantee a spot. Need to change something? Submit the form again with the same email and your answers will be updated.' +
  '</td></tr></table>' +
'</td></tr>' +
'<tr><td class="pad" style="background:#ffffff;padding:28px 40px 44px">' +
  '<a href="' + SITE + '/summerschool/#program" style="display:inline-block;background:#03b05a;color:#0a1c10;font-family:' + SANS + ';font-size:16px;font-weight:600;text-decoration:none;padding:14px 26px;border-radius:4px">See the program</a>' +
'</td></tr>' +

// Footer
'<tr><td class="pad" style="background:#0a1c10;padding:32px 40px 8px">' +
  '<p style="margin:0;font-family:' + SANS + ';font-size:15px;line-height:1.6;color:#d5dad6">Questions? Reply to this email or write to ' + link('mailto:' + CONTACT, CONTACT) + '.</p>' +
'</td></tr>' +
'<tr><td class="pad" style="background:#0a1c10;padding:20px 40px 36px">' +
  '<div style="font-family:' + SANS + ';font-size:13px;line-height:1.6;color:#a8b8ad">' +
  'MobiLab · Autonomous Systems and Mobile Robotics Laboratory<br>' +
  'Department of Electrical Engineering · CCT · UDESC · Joinville, SC, Brazil</div>' +
  '<div style="font-family:' + SANS + ';font-size:13px;line-height:2;padding-top:12px">' +
  link(SITE, 'Website') + ' &nbsp;·&nbsp; ' +
  link('https://github.com/MOBILAB-UDESC', 'GitHub') + ' &nbsp;·&nbsp; ' +
  link('https://huggingface.co/mobilab-udesc', 'Hugging Face') + ' &nbsp;·&nbsp; ' +
  link('https://www.linkedin.com/showcase/mobilab-udesc/', 'LinkedIn') + ' &nbsp;·&nbsp; ' +
  link('https://www.instagram.com/mobi.udesc/', 'Instagram') +
  '</div>' +
'</td></tr>' +

'</table></td></tr></table></body></html>'
  );
}

function out(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}
