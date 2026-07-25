'use strict';

const DEFAULT_MODEL = 'Qwen/Qwen2-7B-Instruct';
const DEFAULT_BASE_URL = 'https://api.siliconflow.com/v1';

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 128 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function isAuthorized(req) {
  const expected = process.env.IVASYA_PROXY_TOKEN;
  if (!expected) return false;

  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const explicit = req.headers['x-ivasya-proxy-token'] || '';
  return bearer === expected || explicit === expected;
}

async function postToSiliconFlow(messages) {
  const apiKey = process.env.SILICONFLOW_API_KEY || process.env.OPENAI_COMPAT_API_KEY;
  if (!apiKey) throw new Error('SILICONFLOW_API_KEY is not configured');

  const baseUrl = String(
    process.env.SILICONFLOW_BASE_URL ||
    process.env.OPENAI_COMPAT_BASE_URL ||
    DEFAULT_BASE_URL
  ).replace(/\/$/, '');
  const model = process.env.SILICONFLOW_MODEL || process.env.OPENAI_COMPAT_MODEL || DEFAULT_MODEL;

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.85,
      max_tokens: 500
    })
  });

  const text = await upstream.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!upstream.ok) {
    const message = data?.error?.message || data?.message || `${upstream.status} ${upstream.statusText}`;
    throw new Error(message);
  }

  return {
    provider: 'siliconflow',
    model: data?.model || model,
    answer: data?.choices?.[0]?.message?.content || '',
    usage: data?.usage || null
  };
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, {
      ok: true,
      service: 'grillzcustoms-ivasya-proxy',
      siliconflow: Boolean(process.env.SILICONFLOW_API_KEY || process.env.OPENAI_COMPAT_API_KEY),
      protected: Boolean(process.env.IVASYA_PROXY_TOKEN)
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('allow', 'GET, POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return json(res, 401, { ok: false, error: 'Unauthorized' });
  }

  try {
    const body = await readBody(req);
    const messages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
    if (!messages.length) return json(res, 400, { ok: false, error: 'messages array is required' });

    const result = await postToSiliconFlow(messages);
    return json(res, 200, { ok: true, ...result });
  } catch (error) {
    console.error('ivasya-proxy', error?.message || error);
    return json(res, 500, { ok: false, error: 'Proxy request failed' });
  }
};
