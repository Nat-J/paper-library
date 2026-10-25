(() => {
  if (document.getElementById('reader-ai-panel')) return;
  const local = location.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(location.hostname);
  const style = document.createElement('style');
  style.textContent = `
    .rai-trigger,.rai-selection{z-index:110;border:1px solid #426b55;background:#285641;color:#fffefb;border-radius:24px;padding:10px 17px;font:14px/1.5 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;box-shadow:0 4px 20px #0002;cursor:pointer}
    .rai-trigger{position:fixed;right:24px;bottom:104px}.rai-selection{position:fixed;max-width:180px}.rai-selection[hidden]{display:none}
    #reader-ai-panel{position:fixed;inset:16px 16px 16px auto;margin:0;width:min(470px,calc(100vw - 32px));height:calc(100dvh - 32px);max-height:none;max-width:none;z-index:120;border:1px solid var(--line,#d8e1d7);border-radius:15px;background:var(--paper,#fffefb);color:var(--ink,#233b30);padding:0;box-shadow:0 14px 60px #0003;font:15px/1.75 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif}
    #reader-ai-panel[open]{display:flex;flex-direction:column}#reader-ai-panel *{box-sizing:border-box}#reader-ai-panel header{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--line,#d8e1d7);padding:16px 20px}#reader-ai-panel h2{margin:0;font-size:18px;line-height:1.4}#reader-ai-panel .rai-close{border:0;background:none;color:inherit;font:28px/1 sans-serif;padding:8px;cursor:pointer}
    .rai-scroll{padding:18px 20px;overflow:auto;flex:1;min-height:0}.rai-quote{margin:0 0 14px;padding:12px 14px;border-left:3px solid var(--green,#285641);background:var(--pale,#eef4ec);max-height:160px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px}.rai-section{font-size:12px;color:var(--muted,#617267);margin-bottom:8px}
    #reader-ai-panel textarea{display:block;width:100%;min-height:96px;resize:vertical;max-height:220px;padding:12px;border:1px solid var(--line,#d8e1d7);border-radius:7px;background:var(--bg,#f3f6f2);color:inherit;font:inherit;line-height:1.6;margin:8px 0 12px}.rai-presets{display:flex;gap:7px;flex-wrap:wrap}.rai-presets button{font:inherit;font-size:12px;line-height:1.5;color:var(--green,#285641);border:1px solid var(--line,#d8e1d7);border-radius:5px;background:none;padding:6px 9px;cursor:pointer}
    .rai-options{display:flex;align-items:center;gap:7px;margin:12px 0;font-size:13px}.rai-options input{accent-color:#285641}.rai-send{width:100%;font:inherit;background:#285641;color:#fffefb;border:0;padding:10px 16px;border-radius:6px;cursor:pointer}.rai-send:disabled{opacity:.5;cursor:default}.rai-status,.rai-disclosure{font-size:12px;color:var(--muted,#617267);line-height:1.7;margin:10px 0}.rai-status[data-error=true]{color:var(--red,#a04d4a)}.rai-answer{border-top:1px solid var(--line,#d8e1d7);padding-top:16px;margin-top:18px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.9}.rai-answer:empty{display:none}.rai-label{display:block;margin:16px 0 0;font-weight:600}
    #reader-ai-panel button:focus-visible,#reader-ai-panel textarea:focus-visible,.rai-trigger:focus-visible,.rai-selection:focus-visible{outline:3px solid #a77c42;outline-offset:3px}body.rai-busy .rai-selection{display:none}
    @media(max-width:600px){.rai-trigger{right:16px;bottom:99px;padding:9px 14px}#reader-ai-panel{inset:10px 10px 10px auto;width:calc(100vw - 20px);height:calc(100dvh - 20px)}.rai-scroll{padding:15px 16px}}
    @media print{.rai-trigger,.rai-selection,#reader-ai-panel{display:none!important}}
  `;
  document.head.append(style);
  const shell = document.createElement('div');
  shell.dataset.readerAi = 'true';
  shell.innerHTML = `
    <button type="button" class="rai-trigger" aria-controls="reader-ai-panel">问 AI</button>
    <button type="button" class="rai-selection" hidden>就这段问 AI</button>
    <dialog id="reader-ai-panel" aria-labelledby="reader-ai-heading">
      <header><h2 id="reader-ai-heading">向 DeepSeek 提问</h2><button type="button" class="rai-close" aria-label="关闭 AI 提问">×</button></header>
      <div class="rai-scroll">
        <div class="rai-section"></div><blockquote class="rai-quote">选中正文后，可将选文带入这里。</blockquote>
        <div class="rai-presets"><button type="button">解释这段</button><button type="button">举个具体例子</button><button type="button">逐步解释公式</button></div>
        <label class="rai-label" for="reader-ai-question">想了解什么？</label>
        <textarea id="reader-ai-question" maxlength="4000" placeholder="例如：这里的 τ 与机器人执行时间有什么区别？"></textarea>
        <label class="rai-options"><input type="checkbox" checked>附带当前章节文字</label>
        <p class="rai-disclosure">点击发送后，选文、问题及勾选的章节上下文会发给 DeepSeek。不会上传 PDF 或图片。</p>
        <button class="rai-send" type="button">发送问题</button>
        <p class="rai-status" role="status" aria-live="polite"></p>
        <div class="rai-answer" role="region" aria-label="DeepSeek 回答" tabindex="0"></div>
      </div>
    </dialog>`;
  document.body.append(shell);
  const panel = shell.querySelector('dialog');
  const menu = shell.querySelector('.rai-selection');
  const trigger = shell.querySelector('.rai-trigger');
  const question = shell.querySelector('textarea');
  const quote = shell.querySelector('.rai-quote');
  const sectionLabel = shell.querySelector('.rai-section');
  const send = shell.querySelector('.rai-send');
  const status = shell.querySelector('.rai-status');
  const answer = shell.querySelector('.rai-answer');
  const includeContext = shell.querySelector('input');
  let selected = null, active = null, busy = false, restoreFocus = null;

  function setStatus(message, error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }

  function captureSelection() {
    if (busy) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      menu.hidden = true;
      return;
    }
    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
    if (!node || shell.contains(node) || node.closest('input,textarea,button,nav')) {
      menu.hidden = true;
      return;
    }
    const text = selection.toString().trim();
    if (!text) return;
    const section = node.closest('section') || node.closest('main');
    const full = section ? section.innerText : '';
    const index = full.indexOf(text);
    const start = index < 0 ? 0 : Math.max(0, index - 4500);
    selected = {selection: text.slice(0, 6000), context: full.slice(start, start + 12000),
      section: (section?.querySelector('h2,h1')?.textContent || '').trim().slice(0, 200)};
    const rects = range.getClientRects();
    const rect = rects[rects.length - 1] || range.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(innerWidth - 160, rect.right - 110))}px`;
    menu.style.top = `${Math.max(8, Math.min(innerHeight - 52, rect.bottom + 8))}px`;
    menu.hidden = false;
  }

  async function checkConnection() {
    if (!local) {
      send.disabled = true;
      setStatus('问答需从本机服务打开：在 paper-library 文件夹中双击 start-reader.command。API key 填在 config.json，正文仍可直接离线阅读。');
      return;
    }
    try {
      const response = await fetch('/api/status', {cache:'no-store'});
      const data = await response.json();
      if (data.app !== 'paper-library-reader') throw new Error();
      send.disabled = !data.configured || busy;
      setStatus(data.configured ? `已连接 · ${data.model}` : data.error || '请在本机 config.json 的 api_key 中填写 DeepSeek API key，填好后重新打开此面板。', !data.configured);
    } catch {
      send.disabled = true;
      setStatus('本机阅读服务未连接，请重新运行 start-reader.command。', true);
    }
  }

  function openPanel(useSelection) {
    if (busy) { if (!panel.open) panel.show(); return; }
    if (useSelection && selected) {
      active = {...selected};
      quote.textContent = active.selection;
      sectionLabel.textContent = active.section || document.title;
      answer.textContent = '';
    }
    restoreFocus = document.activeElement;
    menu.hidden = true;
    if (!panel.open) panel.show();
    question.focus();
    checkConnection();
  }

  menu.addEventListener('pointerdown', event => event.preventDefault());
  trigger.addEventListener('pointerdown', event => event.preventDefault());
  menu.addEventListener('click', () => openPanel(true));
  trigger.addEventListener('click', () => {
    captureSelection();
    openPanel(!window.getSelection()?.isCollapsed);
  });
  shell.querySelector('.rai-close').addEventListener('click', () => panel.close());
  panel.addEventListener('close', () => restoreFocus?.focus?.());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.open) {
      panel.close();
      event.stopPropagation();
    }
  });
  document.addEventListener('selectionchange', () => requestAnimationFrame(captureSelection));
  document.addEventListener('pointerup', () => requestAnimationFrame(captureSelection));
  addEventListener('scroll', () => { menu.hidden = true; }, {passive:true});
  addEventListener('resize', () => { menu.hidden = true; });
  shell.querySelectorAll('.rai-presets button').forEach(button => button.addEventListener('click', () => {
    question.value = button.textContent === '逐步解释公式'
      ? '请逐步解释这段公式：每个变量从哪来、算了什么，再用一组具体数字演示。'
      : button.textContent === '举个具体例子' ? '请用一个具体例子说明这段内容，保持文中的符号和单位一致。'
      : '请用初学者能懂的话解释这段内容，先说它在整个方法中做什么。';
    question.focus();
  }));

  send.addEventListener('click', async () => {
    if (busy || send.disabled) return;
    if (!question.value.trim()) { setStatus('请先输入问题，或选择上面的快捷问题。', true); question.focus(); return; }
    busy = true;
    question.disabled = true;
    includeContext.disabled = true;
    shell.querySelectorAll('.rai-presets button').forEach(button => { button.disabled = true; });
    document.body.classList.add('rai-busy');
    send.disabled = true;
    send.textContent = 'DeepSeek 正在回答…';
    answer.textContent = '';
    setStatus('正在发送本次问题，请稍候…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 75000);
    try {
      const response = await fetch('/api/ask', {method:'POST',
        headers:{'Content-Type':'application/json'}, signal:controller.signal,
        body:JSON.stringify({question:question.value.trim(),
          selection:active?.selection || '', context:includeContext.checked ? active?.context || '' : '',
          title:document.title.slice(0,300), section:active?.section || ''})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '请求失败，请重试。');
      if (typeof data.answer !== 'string') throw new Error('没有收到可显示的回答。');
      answer.textContent = data.answer;
      setStatus(`${data.model} · 基于本次发送的文字回答`);
    } catch (error) {
      setStatus(error.name === 'AbortError' ? '等待超时，请稍后重试。' : error.message || '网络连接失败，请重试。', true);
    } finally {
      clearTimeout(timeout);
      busy = false;
      question.disabled = false;
      includeContext.disabled = false;
      shell.querySelectorAll('.rai-presets button').forEach(button => { button.disabled = false; });
      document.body.classList.remove('rai-busy');
      send.disabled = false;
      send.textContent = '发送问题';
    }
  });
})();
