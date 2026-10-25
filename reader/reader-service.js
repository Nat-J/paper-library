(async () => {
  if (location.protocol !== 'http:' || !['127.0.0.1','localhost'].includes(location.hostname)) return;
  try {
    const response = await fetch('/api/status', {cache:'no-store'});
    if ((await response.json()).app !== 'paper-library-reader') return;
  } catch { return; }
  const host = document.getElementById('reader-ai-panel') || document.querySelector('footer');
  if (!host) return;
  const style = document.createElement('style');
  style.textContent = `.reader-service{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 0;font:12px/1.7 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;color:var(--muted,#617267)}#reader-ai-panel .reader-service{padding:12px 20px;border-top:1px solid var(--line,#d8e1d7);flex-shrink:0}.reader-service button{border:1px solid var(--line,#d8e1d7);border-radius:5px;background:none;color:inherit;padding:6px 10px;font:inherit;cursor:pointer}.reader-service button:focus-visible{outline:3px solid #a77c42;outline-offset:3px}.reader-service button:disabled{opacity:.6;cursor:default}@media print{.reader-service{display:none!important}}`;
  document.head.append(style);
  const bar = document.createElement('div');
  bar.className = 'reader-service';
  bar.innerHTML = '<span role="status">阅读服务已在后台运行</span><button type="button">退出阅读服务</button>';
  host.append(bar);
  const message = bar.querySelector('span');
  const button = bar.querySelector('button');
  button.addEventListener('click', async () => {
    button.disabled = true;
    message.textContent = '正在退出…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('/api/shutdown', {method:'POST',
        headers:{'Content-Type':'application/json'}, body:'{}', signal:controller.signal});
      const data = await response.json();
      if (!response.ok || !data.stopped) throw new Error(data.error || '未能退出，请稍后重试。');
      message.textContent = '服务已退出。双击 Paper Library.app 可重新开启。';
      button.textContent = '已退出';
      dispatchEvent(new Event('reader-service-stopped'));
    } catch (error) {
      message.textContent = error.name === 'AbortError' ? '等待超时，请重试。' : error.message;
      button.disabled = false;
    } finally { clearTimeout(timeout); }
  });
})();
