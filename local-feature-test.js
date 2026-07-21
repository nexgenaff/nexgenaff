const base = 'http://127.0.0.1:3000';
let cookie = '';
function setCookie(header) {
  if (!header) return;
  const parts = header.split(/,\s*(?=[^;]+=)/g);
  for (const part of parts) {
    const [kv] = part.split(';');
    const [name, value] = kv.split('=');
    if (!name || value === undefined) continue;
    const existing = cookie.split('; ').filter(Boolean).filter((item) => !item.startsWith(`${name}=`));
    existing.push(`${name}=${value}`);
    cookie = existing.join('; ');
  }
}

async function call(method, path, body) {
  const headers = { Accept: 'application/json' };
  if (cookie) headers.Cookie = cookie;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  setCookie(res.headers.get('set-cookie'));
  const result = {
    path,
    method,
    status: res.status,
    ok: res.ok,
    body: typeof parsed === 'string' ? parsed.slice(0, 300) : parsed,
  };
  console.log(JSON.stringify(result));
  return result;
}

(async () => {
  const results = [];
  results.push(await call('POST', '/api/auth/login', { username: 'admin', password: 'admin123' }));
  results.push(await call('GET', '/api/auth/me'));
  results.push(await call('GET', '/api/domains'));
  results.push(await call('GET', '/api/offers'));
  results.push(await call('GET', '/api/links'));
  results.push(await call('GET', '/api/analytics/dashboard'));
  results.push(await call('GET', '/api/analytics/recent'));
  results.push(await call('POST', '/api/settings', { action: 'toggle-2fa', enabled: true }));
  results.push(await call('POST', '/api/settings', { action: 'change-password', currentPassword: 'admin123', newPassword: 'admin123', confirmPassword: 'admin123' }));
  results.push(await call('POST', '/api/auth/logout'));
  results.push(await call('GET', '/api/auth/me'));
  console.log('DONE');
})();
