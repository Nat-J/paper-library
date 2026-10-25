(() => {
  if (document.getElementById('reader-ai-panel')) return;
  const local = location.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(location.hostname);
  const documentKey = decodeURIComponent(location.pathname).replace(/^\/+/, '');
  const page = document.querySelector('.page') || document.querySelector('main') || document.body;
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
    .rai-tabs{display:flex;gap:8px;padding:12px 20px 0}.rai-tabs button{border:1px solid var(--line,#d8e1d7);border-radius:6px;padding:6px 12px;background:none;color:inherit;font:inherit;cursor:pointer}.rai-tabs [aria-pressed=true]{background:#285641;color:#fff}.rai-history[hidden],.rai-compose[hidden]{display:none}
    .rai-history h3{font-size:15px;margin:0}.rai-note{border:1px solid var(--line,#d8e1d7);border-radius:8px;margin:12px 0;padding:12px;overflow-wrap:anywhere}.rai-note summary{cursor:pointer;font-weight:600;white-space:pre-wrap}.rai-note .rai-quote{margin-top:10px}.rai-note-meta{font-size:11px;color:var(--muted,#617267);margin:8px 0}.rai-note-answer{white-space:pre-wrap;font-size:14px;line-height:1.85}
    .rai-pins{position:absolute;top:0;left:0;width:100%;height:0;pointer-events:none;z-index:55}.rai-pin{position:absolute;display:flex;gap:4px;align-items:center;height:25px;max-width:210px;border:1px solid #c69a52;border-radius:5px;background:#fff3d5;color:#694919;padding:2px 6px;font:12px/1.5 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;cursor:pointer;pointer-events:auto;box-shadow:0 2px 6px #0001;text-align:left}.rai-pin span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rai-pin b{margin-left:auto;font-size:11px}.rai-pin.approximate{border-style:dashed}.rai-pin.compact{padding:2px 5px}.rai-pin.compact span,.rai-pin.compact b{display:none}.rai-pin.compact:hover span,.rai-pin.compact:focus span{display:block;position:absolute;right:0;top:28px;max-width:min(260px,80vw);padding:6px 9px;border:1px solid #c69a52;border-radius:5px;background:#fff3d5;color:#694919;box-shadow:0 2px 6px #0002}.rai-pin:focus-visible{outline:3px solid #a77c42;outline-offset:2px}::highlight(reader-questions){background:#efd99a55}
    @media print{.rai-trigger,.rai-selection,#reader-ai-panel,.rai-pins{display:none!important}}
  `;
  document.head.append(style);
  const shell = document.createElement('div');
  shell.dataset.readerAi = 'true';
  shell.innerHTML = `
    <div class="rai-pins" aria-label="已保存的提问标记"></div>
    <button type="button" class="rai-trigger" aria-controls="reader-ai-panel">问 AI</button>
    <button type="button" class="rai-selection" hidden>就这段问 AI</button>
    <dialog id="reader-ai-panel" aria-labelledby="reader-ai-heading">
      <header><h2 id="reader-ai-heading">阅读问答</h2><button type="button" class="rai-close" aria-label="关闭 AI 提问">×</button></header>
      <div class="rai-tabs"><button type="button" data-view="ask" aria-pressed="true">提问</button><button type="button" data-view="history" aria-pressed="false">本页记录</button></div>
      <div class="rai-scroll">
        <div class="rai-compose">
        <div class="rai-section"></div><blockquote class="rai-quote">选中正文后，可将选文带入这里。</blockquote>
        <div class="rai-presets"><button type="button">解释这段</button><button type="button">举个具体例子</button><button type="button">逐步解释公式</button></div>
        <label class="rai-label" for="reader-ai-question">想了解什么？</label>
        <textarea id="reader-ai-question" maxlength="4000" placeholder="例如：这里的 τ 与机器人执行时间有什么区别？"></textarea>
        <label class="rai-options"><input type="checkbox" checked>附带当前章节文字</label>
        <p class="rai-disclosure">点击发送后，问题、选文和勾选的章节文字会发给你配置的 AI 接口。问答会保存在本机，并在选文旁留下标记。</p>
        <button class="rai-send" type="button">发送问题</button>
        <p class="rai-status" role="status" aria-live="polite"></p>
        <div class="rai-answer" role="region" aria-label="AI 回答" tabindex="0"></div>
        </div>
        <div class="rai-history" hidden><h3>本页提问记录</h3><p class="rai-history-status rai-disclosure" role="status"></p><div class="rai-history-list"></div></div>
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
  const pins = shell.querySelector('.rai-pins');
  let selected = null, active = null, busy = false, restoreFocus = null;
  let notes = [], historyIds = null, pinScheduled = false;

  function setStatus(message, error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }

  function textIndex(scope) {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement.closest('script,style,[data-reader-ai]')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    let text = '', node;
    while ((node = walker.nextNode())) {
      nodes.push({node, start:text.length});
      text += node.textContent;
    }
    return {text, nodes};
  }

  function findPosition(text, exact, anchor) {
    if (!exact) return -1;
    let best = -1, bestScore = -Infinity, at = text.indexOf(exact);
    while (at >= 0) {
      const score = (anchor.prefix && text.slice(0, at).endsWith(anchor.prefix) ? 2 : 0)
        + (anchor.suffix && text.slice(at + exact.length).startsWith(anchor.suffix) ? 2 : 0)
        - Math.abs(at - (anchor.start || 0)) / (text.length + 1);
      if (score > bestScore) { best = at; bestScore = score; }
      at = text.indexOf(exact, at + 1);
    }
    return best;
  }

  function scopeFor(anchor) {
    const element = anchor.scope_id && document.getElementById(anchor.scope_id);
    return element && page.contains(element) && !shell.contains(element) ? element : page;
  }

  function resolveNote(note, indexes) {
    const scope = scopeFor(note.anchor);
    if (!indexes.has(scope)) indexes.set(scope, textIndex(scope));
    const index = indexes.get(scope);
    const start = findPosition(index.text, note.selection, note.anchor);
    if (start < 0) return {scope, range:null};
    const end = start + note.selection.length;
    const first = index.nodes.find(item => item.start + item.node.length > start);
    const last = index.nodes.find(item => item.start + item.node.length >= end);
    if (!first || !last) return {scope, range:null};
    const range = document.createRange();
    range.setStart(first.node, start - first.start);
    range.setEnd(last.node, end - last.start);
    return {scope, range};
  }

  function showView(view) {
    shell.querySelector('.rai-compose').hidden = view !== 'ask';
    shell.querySelector('.rai-history').hidden = view !== 'history';
    shell.querySelectorAll('[data-view]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.view === view));
    });
  }

  function renderHistory() {
    shell.querySelector('[data-view=history]').textContent = `本页记录${notes.length ? ` · ${notes.length}` : ''}`;
    shell.querySelector('.rai-history h3').textContent = historyIds ? '此处的提问' : '本页提问记录';
    const list = shell.querySelector('.rai-history-list');
    list.replaceChildren();
    const visible = historyIds ? notes.filter(note => historyIds.includes(note.id)) : notes;
    if (!visible.length) { list.textContent = '还没有提问记录。选中一段文字后即可提问。'; return; }
    visible.forEach((note, i) => {
      const card = document.createElement('details');
      card.className = 'rai-note';
      card.open = Boolean(historyIds && i === 0);
      const summary = document.createElement('summary');
      summary.textContent = note.question;
      const meta = document.createElement('p');
      meta.className = 'rai-note-meta';
      meta.textContent = `${new Date(note.created_at).toLocaleString()} · ${note.provider} / ${note.model}`;
      const excerpt = document.createElement('blockquote');
      excerpt.className = 'rai-quote';
      excerpt.textContent = note.selection || '未选中文字';
      const reply = document.createElement('div');
      reply.className = 'rai-note-answer';
      reply.textContent = note.answer || note.error || '此问题已保存，尚未收到回答。若服务曾中断，可重新提问。';
      card.append(summary, meta, excerpt, reply);
      list.append(card);
    });
  }

  function renderPins() {
    pins.replaceChildren();
    const indexes = new Map(), groups = new Map(), ranges = [];
    for (const note of notes) {
      if (!note.selection) continue;
      const {scope, range} = resolveNote(note, indexes);
      const node = range?.startContainer;
      const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
      const block = element?.closest('p,li,figcaption,h1,h2,h3,h4,td,th,blockquote,.equation')
        || element || scope.querySelector('h2,h1') || scope;
      if (!groups.has(block)) groups.set(block, {notes:[], approximate:!range});
      groups.get(block).notes.push(note);
      if (range) ranges.push(range);
    }
    const occupied = [];
    for (const [block, group] of groups) {
      const blockRange = document.createRange();
      blockRange.selectNodeContents(block);
      const rects = [...blockRange.getClientRects()].filter(rect => rect.width && rect.height);
      const rect = rects.at(-1);
      if (!rect) continue;
      const available = innerWidth - rect.right - 16;
      const compact = available < 120;
      const width = compact ? 29 : Math.min(210, available);
      const left = Math.max(8, Math.min(innerWidth - width - 8, rect.right + 8));
      let top = scrollY + rect.top + (rect.height - 25) / 2;
      while (occupied.some(pos => Math.abs(pos.top - top) < 27 && Math.abs(pos.left - left) < 215)) top += 28;
      occupied.push({top, left});
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = `rai-pin${compact ? ' compact' : ''}${group.approximate ? ' approximate' : ''}`;
      pin.style.cssText = `left:${left}px;top:${top}px;width:${width}px`;
      const label = `${group.notes[0].question}${group.notes.length > 1 ? `（${group.notes.length} 条）` : ''}`;
      pin.title = `${label}${group.approximate ? ' · 原选文已变化，标在原章节附近' : ''}`;
      pin.setAttribute('aria-label', `查看已保存的提问：${pin.title}`);
      pin.append('📌');
      const preview = document.createElement('span');
      preview.textContent = group.notes[0].question;
      pin.append(preview);
      if (group.notes.length > 1) {
        const count = document.createElement('b');
        count.textContent = group.notes.length;
        pin.append(count);
      }
      pin.addEventListener('click', async () => {
        if (busy) { openPanel(false); return; }
        const note = group.notes[0];
        active = {selection:note.selection, anchor:note.anchor, section:note.section,
          context:scopeFor(note.anchor).innerText.slice(0,12000)};
        quote.textContent = active.selection;
        sectionLabel.textContent = active.section;
        question.value = '';
        answer.textContent = '';
        openPanel(false);
        historyIds = group.notes.map(item => item.id);
        renderHistory();
        showView('history');
        await loadNotes();
        shell.querySelector('.rai-history summary')?.focus();
      });
      pins.append(pin);
    }
    if (window.CSS?.highlights && window.Highlight) CSS.highlights.set('reader-questions', new Highlight(...ranges));
  }

  function schedulePins() {
    if (pinScheduled) return;
    pinScheduled = true;
    requestAnimationFrame(() => { pinScheduled = false; renderPins(); });
  }

  async function loadNotes() {
    const message = shell.querySelector('.rai-history-status');
    if (!local) { message.textContent = '请用 start-reader.command 打开本机阅读页，以查看个人提问记录。'; return; }
    try {
      const response = await fetch(`/api/notes?document=${encodeURIComponent(documentKey)}`, {cache:'no-store'});
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.notes)) throw new Error(data.error || '无法读取本机提问记录。');
      notes = data.notes;
      message.textContent = '保存在本机 · 查看旧记录不会重新调用 AI。';
      renderHistory();
      schedulePins();
    } catch (error) { message.textContent = error.message || '无法连接本机服务，请重新运行启动器。'; }
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
    if (!node || !page.contains(node) || shell.contains(node) || node.closest('input,textarea,button,nav')) {
      menu.hidden = true;
      return;
    }
    const text = selection.toString().trim().slice(0, 6000);
    if (!text) return;
    const section = node.closest('section[id]') || page;
    const index = textIndex(section);
    const before = document.createRange();
    before.selectNodeContents(section);
    before.setEnd(range.startContainer, range.startOffset);
    const start = findPosition(index.text, text, {start:before.toString().length});
    const contextStart = Math.max(0, start - 4500);
    selected = {selection:text, context:index.text.slice(contextStart, contextStart + 12000),
      section:(section.querySelector('h2,h1')?.textContent || '').trim().slice(0,200),
      anchor:{scope_id:section.id || '', start:Math.max(0,start),
        prefix:index.text.slice(Math.max(0,start - 64),start),
        suffix:index.text.slice(start + text.length, start + text.length + 64)}};
    const rects = range.getClientRects();
    const rect = rects[rects.length - 1] || range.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(innerWidth - 160, rect.right - 110))}px`;
    menu.style.top = `${Math.max(8, Math.min(innerHeight - 52, rect.bottom + 8))}px`;
    menu.hidden = false;
  }

  async function checkConnection() {
    if (!local) {
      send.disabled = true;
      setStatus('问答和个人标记需从本机服务打开：在 paper-library 文件夹中双击 start-reader.command。API key 填在 config.json。');
      return;
    }
    try {
      const response = await fetch('/api/status', {cache:'no-store'});
      const data = await response.json();
      if (data.app !== 'paper-library-reader') throw new Error();
      send.disabled = !data.configured || busy;
      setStatus(data.configured ? `已连接 · ${data.provider} / ${data.model}` : data.error || '请在本机 config.json 中填写 API key，填好后重新打开此面板。已保存的问答仍可在本页记录中查看。', !data.configured);
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
    showView('ask');
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
  panel.addEventListener('close', () => (restoreFocus?.isConnected ? restoreFocus : trigger).focus?.());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.open) {
      panel.close();
      event.stopPropagation();
    }
  });
  document.addEventListener('selectionchange', () => requestAnimationFrame(captureSelection));
  document.addEventListener('pointerup', () => requestAnimationFrame(captureSelection));
  addEventListener('scroll', () => { menu.hidden = true; }, {passive:true});
  addEventListener('resize', () => { menu.hidden = true; schedulePins(); });
  addEventListener('load', schedulePins);
  document.addEventListener('toggle', schedulePins, true);
  document.addEventListener('click', event => { if (!shell.contains(event.target)) schedulePins(); });
  document.addEventListener('input', event => { if (!shell.contains(event.target)) schedulePins(); });
  if (window.ResizeObserver) new ResizeObserver(schedulePins).observe(page);
  shell.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.view === 'history') { historyIds = null; renderHistory(); loadNotes(); }
    showView(button.dataset.view);
  }));
  loadNotes();
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
    send.textContent = 'AI 正在回答…';
    answer.textContent = '';
    setStatus('正在发送本次问题，请稍候…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 75000);
    try {
      const response = await fetch('/api/ask', {method:'POST',
        headers:{'Content-Type':'application/json'}, signal:controller.signal,
        body:JSON.stringify({document:documentKey, question:question.value.trim(), anchor:active?.anchor || {},
          selection:active?.selection || '', context:includeContext.checked ? active?.context || '' : '',
          title:document.title.slice(0,300), section:active?.section || ''})});
      const data = await response.json();
      if (data.note) {
        notes = [data.note, ...notes.filter(note => note.id !== data.note.id)];
        renderHistory();
        schedulePins();
      }
      if (!response.ok) throw new Error(data.error || '请求失败，请重试。');
      if (typeof data.answer !== 'string') throw new Error('没有收到可显示的回答。');
      answer.textContent = data.answer;
      setStatus(data.save_error || `${data.model} · 问答已保存${active?.selection ? '，选文旁已留标记' : ''}。`, Boolean(data.save_error));
    } catch (error) {
      setStatus(error.name === 'AbortError' ? '等待超时，已提交的问题可能仍在处理。稍后查看本页记录。' : error.message || '网络连接失败，请重试。', true);
    } finally {
      clearTimeout(timeout);
      busy = false;
      question.disabled = false;
      includeContext.disabled = false;
      shell.querySelectorAll('.rai-presets button').forEach(button => { button.disabled = false; });
      document.body.classList.remove('rai-busy');
      send.disabled = false;
      send.textContent = '发送问题';
      await loadNotes();
    }
  });
})();
