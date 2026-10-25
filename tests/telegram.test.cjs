const { test } = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const dotenv = require('dotenv');

test('Telegram service preserves payloads, escaping and transport errors without sending', async t => {
  t.mock.method(dotenv, 'config', () => ({}));
  const calls = [];
  const post = t.mock.method(axios, 'post', async (...args) => { calls.push(args); });
  const oldToken = process.env.TELEGRAM_BOT_TOKEN;
  const oldChat = process.env.TELEGRAM_CHAT_ID;
  process.env.TELEGRAM_BOT_TOKEN = 'local-test-token';
  process.env.TELEGRAM_CHAT_ID = 'local-test-chat';
  t.after(() => {
    for (const [key, value] of [['TELEGRAM_BOT_TOKEN', oldToken], ['TELEGRAM_CHAT_ID', oldChat]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  const { sendTelegramMessage, sendTelegramMessageRaw } = require('../dist/services/telegram');
  const message = '*hello* [world]!';
  await sendTelegramMessage(message);
  await sendTelegramMessageRaw(message);
  assert.deepEqual(calls, [message, '\\*hello\\* \\[world\\]\\!'].map(text => [
    'https://api.telegram.org/botlocal-test-token/sendMessage',
    { chat_id: 'local-test-chat', text, parse_mode: 'MarkdownV2' },
  ]));
  const failure = new Error('local transport failure');
  post.mock.mockImplementation(async () => { throw failure; });
  for (const send of [sendTelegramMessage, sendTelegramMessageRaw]) {
    await assert.rejects(send(message), error => error === failure);
  }
});
