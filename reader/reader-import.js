(() => {
  if (document.getElementById('reader-import-panel')) return;
  const local = location.protocol === 'http:' && ['127.0.0.1','localhost'].includes(location.hostname);
  const catalog = document.querySelector('[aria-labelledby="library-heading"]');
  const style = document.createElement('style');
  style.textContent = `
    .rimp-box{margin:0 0 32px;padding:20px 24px;border:1px dashed #7e9a87;border-radius:12px;background:var(--paper,#fffefb);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.rimp-box strong{display:block;font-size:16px}.rimp-box p{margin:4px 0 0;color:var(--muted,#617267);font-size:13px}.rimp-box button,.rimp-choose{font:inherit;border:0;border-radius:6px;padding:9px 16px;background:#285641;color:#fffefb;cursor:pointer}.rimp-trigger{position:fixed;right:24px;bottom:160px;z-index:110;border:1px solid #7e9a87;border-radius:24px;background:var(--paper,#fffefb);color:var(--green,#285641);padding:9px 16px;font:14px/1.5 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;cursor:pointer;box-shadow:0 4px 20px #0001}
    #reader-import-panel{width:min(680px,calc(100vw - 28px));max-height:calc(100dvh - 40px);border:1px solid var(--line,#d8e1d7);border-radius:14px;padding:0;background:var(--paper,#fffefb);color:var(--ink,#233b30);font:14px/1.8 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;box-shadow:0 14px 60px #0003;overflow:auto}#reader-import-panel::backdrop{background:#10201866}#reader-import-panel *{box-sizing:border-box}#reader-import-panel header{display:flex;justify-content:space-between;align-items:center;padding:16px 22px;border-bottom:1px solid var(--line,#d8e1d7)}#reader-import-panel h2{font-size:19px;margin:0}.rimp-close{background:none;border:0;font-size:28px;color:inherit;padding:4px 8px;cursor:pointer}.rimp-body{padding:20px 22px}.rimp-drop{padding:26px 18px;border:2px dashed #7e9a87;border-radius:9px;background:var(--pale,#eef4ec);text-align:center}.rimp-drop p{margin:0 0 12px}.rimp-drop.dragging{border-color:#285641;background:#dce9dc}.rimp-note,.rimp-meta{font-size:12px;color:var(--muted,#617267);margin:10px 0;line-height:1.75}.rimp-status{min-height:1.8em;margin:12px 0;white-space:pre-wrap}.rimp-status[data-error=true]{color:#a04d4a}.rimp-job{border:1px solid var(--line,#d8e1d7);border-radius:8px;padding:12px 15px;margin:12px 0;overflow-wrap:anywhere}.rimp-job strong{display:block}.rimp-job p{margin:5px 0}.rimp-job a{color:var(--green,#285641);text-underline-offset:3px}.rimp-retry{margin-left:14px;background:none;color:inherit;border:1px solid var(--line,#d8e1d7);border-radius:5px;font:inherit;font-size:12px;padding:4px 9px;cursor:pointer}#reader-import-panel button:focus-visible,.rimp-trigger:focus-visible,.rimp-box button:focus-visible{outline:3px solid #a77c42;outline-offset:3px}#reader-import-panel button:disabled{opacity:.5;cursor:default}@media(max-width:600px){.rimp-trigger{right:16px;bottom:151px}.rimp-box{padding:18px}.rimp-body{padding:16px}}@media print{.rimp-box,.rimp-trigger,#reader-import-panel{display:none!important}}
  `;
  document.head.append(style);
  const shell = document.createElement('div');
  shell.dataset.readerAi = 'true';
  shell.innerHTML = `<input class="rimp-file" type="file" accept="application/pdf,.pdf" hidden>
    <dialog id="reader-import-panel" aria-labelledby="reader-import-heading">
      <header><h2 id="reader-import-heading">导入 PDF，生成中文导读</h2><button class="rimp-close" type="button" aria-label="关闭导入面板">×</button></header>
      <div class="rimp-body"><div class="rimp-drop"><p><strong>把 PDF 拖到这里，或拖入阅读页面</strong><br>按 paper-to-web skill 生成，归档后更新文献目录</p><button class="rimp-choose" type="button">选择 PDF</button><p class="rimp-meta">每次一篇 · 最大 50 MB</p></div>
      <p class="rimp-note">生成由本机已登录的 Codex 执行，使用其账户额度；DeepSeek 用于阅读问答。完成后会将原 PDF、导读和媒体同步到当前 GitHub 仓库（public）。</p>
      <p class="rimp-note">生成可能需要数分钟。关闭此面板后任务继续，电脑需保持开机和联网。</p>
      <p class="rimp-status" role="status" aria-live="polite"></p><div class="rimp-jobs" aria-label="导入记录"></div></div>
    </dialog>`;
  document.body.append(shell);
  const panel = shell.querySelector('dialog');
  const fileInput = shell.querySelector('input');
  const choose = shell.querySelector('.rimp-choose');
  const drop = shell.querySelector('.rimp-drop');
  const status = shell.querySelector('.rimp-status');
  let uploading = false, busy = false, available = false, polling = null, opener = null;
  const completed = new Set();
  function message(text,error=false) { status.textContent=text; status.dataset.error=String(error); }
  function openPanel() {
    opener = document.activeElement;
    if (!panel.open) panel.showModal();
    if (!local) message('请双击文献库中的 Paper Library.app 后导入 PDF。直接打开 HTML 可离线阅读正文。');
    else loadJobs();
  }
  shell.querySelector('.rimp-close').addEventListener('click',()=>panel.close());
  panel.addEventListener('close',()=>opener?.focus?.());
  if (catalog) {
    const box = document.createElement('section');
    box.className='rimp-box';
    box.innerHTML='<div><strong>导入新文献</strong><p>拖入 PDF → 生成中文图解导读 → 保存到文献库 → 同步 GitHub</p></div><button type="button">导入 PDF</button>';
    catalog.before(box);
    box.querySelector('button').addEventListener('click',openPanel);
  } else {
    const trigger=document.createElement('button');
    trigger.type='button'; trigger.className='rimp-trigger'; trigger.textContent='导入 PDF';
    trigger.addEventListener('click',openPanel);
    shell.append(trigger);
  }
  choose.addEventListener('click',()=>fileInput.click());
  fileInput.addEventListener('change',()=>{ if(fileInput.files.length) importFiles([...fileInput.files]); fileInput.value=''; });
  document.addEventListener('dragover',event=>{
    if([...event.dataTransfer.types].includes('Files')) { event.preventDefault(); drop.classList.add('dragging'); }
  });
  document.addEventListener('dragleave',()=>drop.classList.remove('dragging'));
  document.addEventListener('drop',event=>{
    if(![...event.dataTransfer.types].includes('Files')) return;
    event.preventDefault(); drop.classList.remove('dragging'); openPanel(); importFiles([...event.dataTransfer.files]);
  });
  async function refreshCatalog() {
    if (!catalog) return;
    const response=await fetch('/',{cache:'no-store'});
    if(!response.ok) return;
    const documentCopy=new DOMParser().parseFromString(await response.text(),'text/html');
    const updated=documentCopy.querySelector('[aria-labelledby="library-heading"]');
    const current=document.querySelector('[aria-labelledby="library-heading"]');
    if(updated && current) current.replaceWith(updated);
  }
  function renderJobs(jobs) {
    const list=shell.querySelector('.rimp-jobs');
    list.replaceChildren();
    if(!jobs.length) { list.textContent='还没有导入记录。'; return; }
    for(const job of jobs) {
      const card=document.createElement('article'); card.className='rimp-job';
      const title=document.createElement('strong'); title.textContent=job.title || job.filename;
      const text=document.createElement('p'); text.textContent=job.message;
      const date=document.createElement('p'); date.className='rimp-meta'; date.textContent=new Date(job.created_at).toLocaleString();
      card.append(title,text,date);
      if(job.url && /^[a-z0-9][a-z0-9-]*\/index\.html$/.test(job.url)) {
        const link=document.createElement('a'); link.href='/'+job.url; link.textContent='打开中文导读 →'; card.append(link);
      }
      if(['failed','interrupted','sync_failed'].includes(job.stage)) {
        const retry=document.createElement('button'); retry.className='rimp-retry'; retry.type='button';
        retry.textContent=job.stage==='sync_failed'?'重试 GitHub 同步':'重新生成'; retry.disabled=busy || uploading;
        retry.addEventListener('click',async()=>{
          retry.disabled=true;
          try {
            const response=await fetch(`/api/imports/${job.id}/retry`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
            const data=await response.json(); if(!response.ok) throw new Error(data.error);
            completed.delete(job.id); message('任务已重新启动。'); await loadJobs();
          } catch(error) { message(error.message || '重试未成功。',true); retry.disabled=false; }
        });
        card.append(retry);
      }
      list.append(card);
      if(['done','duplicate','sync_failed'].includes(job.stage) && !completed.has(job.id)) {
        completed.add(job.id); refreshCatalog().catch(()=>{});
      }
    }
  }
  async function loadJobs() {
    if(!local) { choose.disabled=true; return; }
    try {
      const response=await fetch('/api/imports',{cache:'no-store'});
      const data=await response.json(); if(!response.ok) throw new Error(data.error);
      available=data.available; busy=data.busy;
      choose.disabled=!available || busy || uploading;
      if(!available) message(data.reason,true);
      else if(busy && !uploading) message('论文正在后台处理，完成后会显示打开导读的入口。');
      else if(!uploading && status.dataset.error!=='true') message('拖入 PDF 即开始生成并自动归档、同步。');
      renderJobs(data.jobs);
      clearTimeout(polling);
      if(busy || panel.open) polling=setTimeout(loadJobs,2000);
    } catch(error) {
      available=false; choose.disabled=true;
      message(error.message || '导入服务未连接。请重新打开 Paper Library.app。',true);
      clearTimeout(polling);
    }
  }
  async function importFiles(files) {
    if(!local) return;
    if(files.length!==1) { message('请每次拖入一篇 PDF。',true); return; }
    const file=files[0];
    if(!/\.pdf$/i.test(file.name) || file.size>50*1024*1024 || file.size<5) { message('请选择一篇不超过 50 MB 的 PDF。',true); return; }
    if(uploading || busy) { message('已有论文正在导入，请等待完成。',true); return; }
    uploading=true; choose.disabled=true; message('正在保存 PDF…');
    try {
      const response=await fetch('/api/imports',{method:'POST',headers:{'Content-Type':'application/pdf','X-PDF-Name':encodeURIComponent(file.name)},body:file});
      const data=await response.json(); if(!response.ok) throw new Error(data.error || 'PDF 上传未完成。');
      renderJobs([data.job]);
    } catch(error) { message(error.message || '导入未成功，请重新拖入。',true); }
    finally { uploading=false; await loadJobs(); }
  }
  if(local) loadJobs(); else choose.disabled=true;
})();
