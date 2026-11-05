"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, ArrowDownToLine, ArrowUpFromLine, Check, ChevronDown, Clock3, Copy, FilePlus2, Heart, Layers3, MoreHorizontal, Pencil, Plus, Search, Settings2, Sparkles, Trash2, X } from "lucide-react";
import { createPrompt, exportPrompts, extractVariables, filterPrompts, makeVersion, parsePromptImport, renderTemplate, type Prompt, type PromptDraft } from "@/lib/prompts";

const STORAGE_KEY = "prompt-manager-v1";
const starter: Prompt[] = [
  { id:"welcome-1", title:"深度研究助手", description:"把一个主题拆解为有来源、有结构的研究报告", content:"你是一位严谨的研究分析师。请围绕「{{topic}}」进行深入研究。\n\n目标读者：{{audience}}\n输出语言：{{language}}\n\n请按以下结构输出：\n1. 核心结论（先给结论）\n2. 背景与关键概念\n3. 多角度分析与证据\n4. 风险、争议和信息缺口\n5. 可执行建议\n\n区分事实、推断与观点；不要编造来源。", category:"研究", tags:["研究","分析","报告"], favorite:true, createdAt:"2026-10-01T08:00:00.000Z", updatedAt:"2026-10-01T08:00:00.000Z", versions:[] },
  { id:"welcome-2", title:"短视频爆款拆解", description:"分析视频结构并生成可测试的创作方案", content:"你是一名短视频内容策略师。分析主题「{{topic}}」在平台「{{platform}}」上的内容机会。\n\n请输出：\n- 目标受众与观看动机\n- 前 3 秒钩子（给出 5 个版本）\n- 内容节奏与镜头脚本\n- 标题、封面文案和评论区互动\n- 可验证的 A/B 测试假设\n\n避免空泛套路，给出具体表达。", category:"内容创作", tags:["短视频","营销"], favorite:false, createdAt:"2026-10-02T08:00:00.000Z", updatedAt:"2026-10-02T08:00:00.000Z", versions:[] },
  { id:"welcome-3", title:"代码审查清单", description:"以资深工程师视角审查代码质量和风险", content:"请以资深 {{language}} 工程师身份审查以下代码。\n\n代码：\n```\n{{code}}\n```\n\n重点检查：正确性、安全性、性能、可维护性、边界条件和测试覆盖。按严重程度排序问题，并为每项提供文件/行号依据、影响说明和修复建议。若没有发现问题，也请说明审查范围与局限。", category:"开发", tags:["代码","审查","工程"], favorite:false, createdAt:"2026-10-03T08:00:00.000Z", updatedAt:"2026-10-03T08:00:00.000Z", versions:[] }
].map(p => ({ ...p, versions: [makeVersion(p.content)] }));

const blank: PromptDraft = { title:"", description:"", content:"", category:"工作", tags:[], favorite:false };
const categories = ["全部","工作","研究","内容创作","开发","学习","生活"];

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<PromptDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string,string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [toast, setToast] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const rows = saved ? parsePromptImport(saved) : starter;
      setPrompts(rows);
      setSelectedId(rows[0]?.id ?? "");
    } catch { setPrompts(starter); setSelectedId(starter[0].id); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, exportPrompts(prompts)); }, [prompts, ready]);

  const visible = useMemo(() => filterPrompts(prompts, query, category, favoritesOnly), [prompts, query, category, favoritesOnly]);
  const selected = prompts.find(p => p.id === selectedId) ?? visible[0] ?? null;
  const variables = selected ? extractVariables(selected.content) : [];
  const preview = selected ? renderTemplate(selected.content, previewValues) : "";
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200); };

  function openNew() { setEditing({ ...blank }); setEditingId(null); }
  function openEdit(p: Prompt) { setEditing({ title:p.title, description:p.description, content:p.content, category:p.category, tags:[...p.tags], favorite:p.favorite }); setEditingId(p.id); }
  function saveDraft() {
    if (!editing || !editing.title.trim() || !editing.content.trim()) return;
    if (editingId) {
      setPrompts(rows => rows.map(p => p.id === editingId ? { ...p, ...editing, title:editing.title.trim(), updatedAt:new Date().toISOString(), versions:[makeVersion(editing.content), ...p.versions].slice(0,30) } : p));
      setSelectedId(editingId); notify("提示词已更新，版本已保存");
    } else {
      const next = createPrompt({ ...editing, title:editing.title.trim() });
      setPrompts(rows => [next, ...rows]); setSelectedId(next.id); notify("提示词已创建");
    }
    setEditing(null);
  }
  function removePrompt(id: string) {
    if (!window.confirm("确定删除这条提示词？此操作无法撤销。")) return;
    const next = prompts.filter(p => p.id !== id); setPrompts(next); setSelectedId(next[0]?.id ?? ""); notify("已删除");
  }
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); notify("已复制到剪贴板"); }
    catch { notify("复制失败，请检查浏览器权限"); }
  }
  function toggleFavorite(p: Prompt) { setPrompts(rows => rows.map(row => row.id === p.id ? { ...row, favorite:!row.favorite, updatedAt:new Date().toISOString() } : row)); }
  function downloadExport() {
    const blob = new Blob([exportPrompts(prompts)], { type:"application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "prompt-manager-export.json"; a.click(); URL.revokeObjectURL(url); notify("导出文件已生成");
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      const rows = parsePromptImport(await file.text());
      setPrompts(current => [...rows, ...current]); setSelectedId(rows[0]?.id ?? selectedId); notify(`成功导入 ${rows.length} 条提示词`);
    } catch (error) { notify(error instanceof Error ? error.message : "导入失败"); }
    if (importRef.current) importRef.current.value = "";
  }
  function restoreVersion(content: string) {
    if (!selected) return;
    setPrompts(rows => rows.map(p => p.id === selected.id ? { ...p, content, updatedAt:new Date().toISOString(), versions:[makeVersion(content), ...p.versions] } : p));
    setShowVersions(false); notify("已恢复历史版本");
  }

  if (!ready) return <main className="loading">正在载入你的提示词库…</main>;

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><div><strong>Prompt<span>ly</span></strong><small>YOUR PROMPT WORKSPACE</small></div></div>
      <button className="new-button" onClick={openNew}><Plus size={17}/> 新建提示词 <span>⌘ K</span></button>
      <div className="side-label">工作空间</div>
      <button className={category==="全部"&&!favoritesOnly?"nav-item active":"nav-item"} onClick={()=>{setCategory("全部");setFavoritesOnly(false)}}><Layers3 size={17}/> 全部提示词 <span>{prompts.length}</span></button>
      <button className={favoritesOnly?"nav-item active":"nav-item"} onClick={()=>setFavoritesOnly(v=>!v)}><Heart size={17}/> 我的收藏 <span>{prompts.filter(p=>p.favorite).length}</span></button>
      <div className="side-label category-label">分类 <button onClick={openNew}><Plus size={14}/></button></div>
      {categories.slice(1).map(c=><button key={c} className={category===c?"nav-item active":"nav-item"} onClick={()=>{setCategory(c);setFavoritesOnly(false)}}><span className="category-dot"/> {c}<span>{prompts.filter(p=>p.category===c).length}</span></button>)}
      <div className="sidebar-bottom">
        <div className="storage-card"><div className="storage-icon"><Archive size={16}/></div><div><b>本地优先存储</b><small>数据保存在当前浏览器</small></div><span className="online-dot"/></div>
        <div className="profile"><div className="avatar">A</div><div><b>My Workspace</b><small>Personal edition</small></div><Settings2 size={17}/></div>
      </div>
    </aside>

    <section className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{favoritesOnly?"我的收藏":category==="全部"?"全部提示词":category}</b></div><div className="top-actions"><button className="quiet-button" onClick={()=>importRef.current?.click()}><ArrowUpFromLine size={15}/> 导入</button><button className="quiet-button" onClick={downloadExport}><ArrowDownToLine size={15}/> 导出</button><input ref={importRef} type="file" accept=".json,application/json" hidden onChange={e=>void importFile(e.target.files?.[0])}/></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">PROMPT LIBRARY</div><h1>你的灵感，随时可用。</h1><p>整理、打磨并复用你的 AI 提示词。</p></div><button className="primary-button" onClick={openNew}><Plus size={17}/> 创建提示词</button></div>
        <div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="搜索标题、内容或标签…" value={query} onChange={e=>setQuery(e.target.value)}/><kbd>⌘ K</kbd></div><button className="filter-button" onClick={()=>setFavoritesOnly(v=>!v)}><Heart size={15} fill={favoritesOnly?"currentColor":"none"}/> {favoritesOnly?"显示全部":"只看收藏"}</button><div className="result-count">{visible.length} 条提示词</div></div>
        <div className="workspace-grid">
          <div className="prompt-list">
            {visible.length===0?<div className="empty-state"><div className="empty-icon"><Search/></div><b>没有找到匹配的提示词</b><p>换个关键词，或创建一条新的提示词。</p><button onClick={openNew}>创建提示词</button></div>:visible.map(p=><div role="button" tabIndex={0} key={p.id} className={selected?.id===p.id?"prompt-card selected":"prompt-card"} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelectedId(p.id)}}} onClick={()=>{setSelectedId(p.id);setPreviewValues({});setShowPreview(false);setShowVersions(false)}}><div className="card-top"><span className="card-category">{p.category}</span><button className={p.favorite?"favorite on":"favorite"} aria-label="收藏" onClick={e=>{e.stopPropagation();toggleFavorite(p)}}><Heart size={15} fill={p.favorite?"currentColor":"none"}/></button></div><b>{p.title}</b><p>{p.description||"暂无描述"}</p><div className="card-bottom"><div className="tag-row">{p.tags.slice(0,2).map(t=><span key={t}>#{t}</span>)}</div><small><Clock3 size={12}/> {new Date(p.updatedAt).toLocaleDateString("zh-CN")}</small></div></button>)}
          </div>
          <div className="detail-panel">
            {selected?<><div className="detail-header"><div><span className="card-category">{selected.category}</span><h2>{selected.title}</h2><p>{selected.description||"为这条提示词添加描述，方便以后查找。"}</p></div><div className="detail-actions"><button title="收藏" onClick={()=>toggleFavorite(selected)}><Heart size={17} fill={selected.favorite?"currentColor":"none"}/></button><button title="编辑" onClick={()=>openEdit(selected)}><Pencil size={17}/></button><button title="删除" onClick={()=>removePrompt(selected.id)}><Trash2 size={17}/></button><button title="更多" onClick={()=>setShowVersions(v=>!v)}><MoreHorizontal size={18}/></button></div></div>
              <div className="detail-meta"><span>{selected.versions.length} 个版本</span><span>更新于 {new Date(selected.updatedAt).toLocaleString("zh-CN")}</span><div className="tag-row">{selected.tags.map(t=><span key={t}>#{t}</span>)}</div></div>
              <div className="content-label"><b>提示词内容</b><button onClick={()=>setShowPreview(v=>!v)}><Sparkles size={14}/> {showPreview?"编辑原文":"变量预览"} <ChevronDown size={14}/></button></div>
              {showPreview?<div className="preview-wrap">{variables.length>0?<div className="variable-fields">{variables.map(v=><label key={v}>{v}<input value={previewValues[v]??""} onChange={e=>setPreviewValues(s=>({...s,[v]:e.target.value}))} placeholder={`输入 ${v}…`}/></label>)}</div>:<p className="muted">这条提示词没有检测到变量。</p>}<pre className="prompt-content">{preview}</pre></div>:<pre className="prompt-content">{selected.content}</pre>}
              <div className="detail-footer"><button className="copy-button" onClick={()=>copy(showPreview?preview:selected.content)}><Copy size={16}/> 复制提示词</button><button className="history-button" onClick={()=>setShowVersions(v=>!v)}><Clock3 size={15}/> 版本历史</button></div>
              {showVersions&&<div className="version-list"><div className="version-title">版本历史 <span>最多保留 30 个版本</span></div>{selected.versions.map((v,i)=><div className="version-row" key={v.id}><div><b>{i===0?"当前版本":`版本 ${selected.versions.length-i}`}</b><small>{new Date(v.savedAt).toLocaleString("zh-CN")}</small></div><button disabled={i===0} onClick={()=>restoreVersion(v.content)}>恢复此版本</button></div>)}</div>}
            </>:<div className="empty-detail"><FilePlus2 size={28}/><b>选择一条提示词</b><p>从左侧列表选择，或创建你的第一条提示词。</p><button className="primary-button" onClick={openNew}><Plus size={16}/> 新建提示词</button></div>}
          </div>
        </div>
        <footer className="footer-note"><span><span className="online-dot"/> 所有更改自动保存</span><span>Promptly · Local-first prompt library</span></footer>
      </div>
    </section>

    {editing&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null)}}><div className="modal"><div className="modal-head"><div><span className="eyebrow">{editingId?"EDIT PROMPT":"NEW PROMPT"}</span><h2>{editingId?"编辑提示词":"创建新提示词"}</h2></div><button onClick={()=>setEditing(null)}><X/></button></div><div className="form-body"><label>标题 <input autoFocus value={editing.title} onChange={e=>setEditing(s=>s?({...s,title:e.target.value}):s)} placeholder="例如：产品需求分析助手"/></label><label>描述 <input value={editing.description} onChange={e=>setEditing(s=>s?({...s,description:e.target.value}):s)} placeholder="这条提示词能帮你做什么？"/></label><div className="form-row"><label>分类 <select value={editing.category} onChange={e=>setEditing(s=>s?({...s,category:e.target.value}):s)}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}<option>其他</option></select></label><label>标签 <input value={editing.tags.join(", ")} onChange={e=>setEditing(s=>s?({...s,tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)}):s)} placeholder="用逗号分隔"/></label></div><label>提示词正文 <textarea rows={10} value={editing.content} onChange={e=>setEditing(s=>s?({...s,content:e.target.value}):s)} placeholder="输入提示词。使用 {{变量名}} 创建可填写变量…"/></label><div className="form-hint"><Sparkles size={14}/> 使用 <code>{"{{变量名}}"}</code> 标记变量，预览时可动态填写。</div><label className="check-label"><input type="checkbox" checked={editing.favorite} onChange={e=>setEditing(s=>s?({...s,favorite:e.target.checked}):s)}/> 添加到我的收藏</label></div><div className="modal-foot"><button className="quiet-button" onClick={()=>setEditing(null)}>取消</button><button className="primary-button" disabled={!editing.title.trim()||!editing.content.trim()} onClick={saveDraft}><Check size={16}/> 保存提示词</button></div></div></div>}
    {toast&&<div className="toast"><Check size={15}/>{toast}</div>}
  </main>;
}
