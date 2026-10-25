const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createRequire } = require('node:module');

// Resolve the transport used by Axios, without contacting Telegram.
const requireFromAxios = createRequire(require.resolve('axios'));
const redirects = process.env.FOLLOW_REDIRECTS_TEST_MODULE
  ? require(process.env.FOLLOW_REDIRECTS_TEST_MODULE)
  : requireFromAxios('follow-redirects');

async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

function request(url, options = {}, body) {
  return new Promise((resolve, reject) => {
    const req = redirects.http.request(url, options, response => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (error) { reject(error); }
      });
      response.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(3000, () => req.destroy(new Error('Loopback request timed out')));
    req.end(body);
  });
}

test('redirect transport removes credentials and preserves legitimate requests', async t => {
  const echo = async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ method: req.method, headers: req.headers, body }));
  };
  const collector = http.createServer(echo);
  const target = await listen(collector);
  const redirector = http.createServer((req, res) => {
    if (req.url === '/echo') { void echo(req, res); return; }
    req.resume();
    const sameOrigin = req.url === '/same';
    res.writeHead(req.url === '/307' ? 307 : 302, {
      Location: sameOrigin ? '/echo' : `${target}/echo`,
    });
    res.end();
  });
  const origin = await listen(redirector);
  t.after(async () => {
    await Promise.all([collector, redirector].map(server => new Promise(resolve => server.close(resolve))));
  });
  const headers = {
    Authorization: 'Bearer test-token',
    'Proxy-Authorization': 'Basic test-proxy',
    Cookie: 'session=test-cookie',
    'X-Api^Key': 'test-caret',
    'X-Token|Secret': 'test-pipe',
    'X-Control-Key': 'test-control',
    'X-Public': 'keep-public',
    'X-Token': 'keep-token',
    Secret: 'keep-secret',
  };
  const sensitiveHeaders = ['X-Api^Key', 'X-Token|Secret', 'X-Control-Key'];
  const requestHeaders = { Host: new URL(origin).host, ...headers };

  for (const form of ['object', 'array']) {
    await t.test(`${form} headers strip built-in and declared credentials across origins`, async () => {
      const result = await request(`${origin}/cross`, {
        headers: form === 'array' ? Object.entries(requestHeaders).flat() : { ...requestHeaders },
        sensitiveHeaders,
      });
      for (const name of ['authorization', 'proxy-authorization', 'cookie', 'x-api^key', 'x-token|secret', 'x-control-key']) {
        assert.equal(result.headers[name], undefined, `${name} leaked to the redirect target`);
      }
      assert.equal(result.headers['x-public'], 'keep-public');
      assert.equal(result.headers['x-token'], 'keep-token');
      assert.equal(result.headers.secret, 'keep-secret');
    });
    await t.test(`${form} headers retain credentials on the same origin`, async () => {
      const result = await request(`${origin}/same`, {
        headers: form === 'array' ? Object.entries(requestHeaders).flat() : { ...requestHeaders },
        sensitiveHeaders,
      });
      for (const [name, value] of Object.entries(headers)) assert.equal(result.headers[name.toLowerCase()], value);
    });
  }
  for (const status of [302, 307]) {
    await t.test(`${status} preserves the documented POST redirect behavior`, async () => {
      const body = JSON.stringify({ chat_id: 'test-chat', text: 'local-only', parse_mode: 'MarkdownV2' });
      const result = await request(`${origin}/${status}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      }, body);
      assert.equal(result.method, status === 302 ? 'GET' : 'POST');
      assert.equal(result.body, status === 302 ? '' : body);
      assert.equal(result.headers['content-type'], status === 302 ? undefined : 'application/json');
      assert.equal(result.headers['content-length'], status === 302 ? undefined : String(Buffer.byteLength(body)));
    });
  }
});
