#!/usr/bin/env node
/**
 * patch-whatsapp-web.js — apply WA Web 2.3000.x compatibility fixes.
 * Idempotent: safe to run on every npm install.
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.join(__dirname, '..', 'node_modules', 'whatsapp-web.js');
const UTILS     = path.join(ROOT, 'src', 'util', 'Injected', 'Utils.js');
const PUPPETEER = path.join(ROOT, 'src', 'util', 'Puppeteer.js');
const MARKER    = 'window.WWebJS.getMsgKeyId';

function patchFile(filePath, patches) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[patch-whatsapp-web] skip — not found: ${filePath}`);
    return false;
  }
  let src = fs.readFileSync(filePath, 'utf8');
  if (src.includes(MARKER)) return false;
  let changed = false;
  for (const [from, to] of patches) {
    if (src.includes(from)) { src = src.replace(from, to); changed = true; }
  }
  if (changed) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`[patch-whatsapp-web] patched ${path.basename(filePath)}`);
  }
  return changed;
}

function patchPuppeteer(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[patch-whatsapp-web] skip — not found: ${filePath}`);
    return false;
  }
  const src = fs.readFileSync(filePath, 'utf8');
  if (/already exists/.test(src) && src.includes('try {')) return false;
  const from = '    await page.exposeFunction(name, fn);';
  const to   = `    try {\n        await page.exposeFunction(name, fn);\n    } catch (err) {\n        if (!/already exists/.test(err.message)) throw err;\n    }`;
  if (!src.includes(from)) return false;
  fs.writeFileSync(filePath, src.replace(from, to), 'utf8');
  console.log(`[patch-whatsapp-web] patched ${path.basename(filePath)}`);
  return true;
}

function main() {
  const utilsPatches = [
    ['.Msg.get(newMsgKey._serialized);', '.Msg.get(window.WWebJS.getMsgKeyId(newMsgKey));'],
    ["return window.require('WAWebCollections').Msg.get(msg.id._serialized);",
     "return window.require('WAWebCollections').Msg.get(window.WWebJS.getMsgKeyId(msg.id));"],
    ['remote: msg.id.remote._serialized,', 'remote: msg.id.remote._serialized || msg.id.remote.$1,'],
    [`        delete msg.pendingAckUpdate;\n\n        return msg;`,
     `        if (typeof msg.id === 'object' && msg.id._serialized == null) {\n            const sid = window.WWebJS.getMsgKeyId(msg.id);\n            if (sid) msg.id = Object.assign({}, msg.id, { _serialized: sid });\n        }\n\n        delete msg.pendingAckUpdate;\n\n        return msg;`],
    [`    window.WWebJS.getChats = async () => {\n        const chats = window.require('WAWebCollections').Chat.getModelsArray();\n        const chatPromises = chats.map((chat) =>\n            window.WWebJS.getChatModel(chat),\n        );\n        return await Promise.all(chatPromises);\n    };`,
     `    window.WWebJS.getMsgKeyId = (key) => key?._serialized ?? key?.$1 ?? undefined;\n\n    window.WWebJS.getChats = async () => {\n        const chats = window.require('WAWebCollections').Chat.getModelsArray();\n        const results = [];\n        for (const chat of chats) {\n            try { const m = await window.WWebJS.getChatModel(chat); if (m) results.push(m); } catch {}\n        }\n        return results;\n    };`],
  ];

  const u = patchFile(UTILS, utilsPatches);
  const p = patchPuppeteer(PUPPETEER);
  if (!u && !p) console.log('[patch-whatsapp-web] already patched (or version mismatch).');
}

main();
