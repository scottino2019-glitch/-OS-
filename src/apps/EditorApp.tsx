import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import { EditorFile } from '../types/phone';
import {
  FileCode,
  Plus,
  Trash2,
  Download,
  Eye,
  Code,
  Check,
  FileText,
  Copy
} from 'lucide-react';

const LANGUAGE_TEMPLATES: Record<EditorFile['language'], string> = {
  markdown: `# 标题 (Titolo)

这里是一篇 Markdown 文档。
- [x] 完成第一项任务
- [ ] 探索更多功能

> 极光OS：流畅体验，明亮优雅。`,
  javascript: `// JavaScript 脚本演示
function greet(name = "极光用户") {
  const time = new Date().toLocaleTimeString();
  return \`你好，\${name}！当前系统时间: \${time}\`;
}

console.log(greet());
`,
  html: `<div class="card" style="padding: 16px; background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 12px; font-family: sans-serif;">
  <h2 style="color: #0284c7; margin: 0 0 8px 0;">极光微卡片</h2>
  <p style="margin: 0 0 12px 0;">轻量 HTML 实时预览卡片</p>
  <button style="background: #0284c7; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold;">点击探索</button>
</div>`,
  json: `{
  "deviceName": "极光 16 Pro",
  "os": "AuroraOS 4.2",
  "theme": "Light Porcelain",
  "features": ["便签", "日历", "轻编辑", "计算器", "外部应用"]
}`,
  text: `华智科技 随笔记录
时间：2026年11月
内容：
这是一个无需服务器的纯本地轻量文本编辑器。
支持即时输入、统计与一键下载保存到本地。`
};

export const EditorApp: React.FC = () => {
  const { editorFiles, addEditorFile, updateEditorFile, deleteEditorFile, t, showToast } = usePhone();

  const [activeFileId, setActiveFileId] = useState<string>(editorFiles[0]?.id || '');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isCopied, setIsCopied] = useState(false);

  const activeFile = editorFiles.find(f => f.id === activeFileId) || editorFiles[0];

  const handleCreateFile = () => {
    const fileNum = editorFiles.length + 1;
    const newName = `doc_${fileNum}.md`;
    addEditorFile({
      name: newName,
      language: 'markdown',
      content: LANGUAGE_TEMPLATES.markdown
    });
    setTimeout(() => {
      if (editorFiles.length > 0) {
        setActiveFileId(editorFiles[0].id);
      }
    }, 50);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`文件 ${activeFile.name} 已保存至本地下载`);
  };

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setIsCopied(true);
    showToast('内容已复制到剪贴板');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const linesCount = activeFile?.content.split('\n').length || 0;
  const charsCount = activeFile?.content.length || 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 select-text">
      {/* Top File Tabs */}
      <div className="bg-white border-b border-slate-200 flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[70%] pb-1.5">
          {editorFiles.map(file => (
            <button
              key={file.id}
              onClick={() => {
                setActiveFileId(file.id);
                setViewMode('edit');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeFile?.id === file.id
                  ? 'bg-slate-50 text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileCode size={14} className={activeFile?.id === file.id ? 'text-indigo-600' : ''} />
              <span className="truncate max-w-[95px]">{file.name}</span>
            </button>
          ))}
          <button
            onClick={handleCreateFile}
            title="新建文件"
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors ml-1"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 pb-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
            title={viewMode === 'edit' ? '预览模式' : '编辑代码'}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'preview'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {viewMode === 'edit' ? <Eye size={16} /> : <Code size={16} />}
          </button>
          <button
            onClick={handleCopy}
            title="复制代码"
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isCopied ? <Check size={16} className="text-emerald-600 font-bold" /> : <Copy size={16} />}
          </button>
          <button
            onClick={handleDownload}
            title="下载文件"
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Download size={16} />
          </button>
          {editorFiles.length > 1 && activeFile && (
            <button
              onClick={() => deleteEditorFile(activeFile.id)}
              title="删除文件"
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {activeFile ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File meta & language selector */}
          <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200 text-xs font-semibold text-slate-600">
            <input
              type="text"
              value={activeFile.name}
              onChange={e => updateEditorFile(activeFile.id, { name: e.target.value })}
              className="bg-slate-100 text-slate-900 font-bold focus:outline-none focus:bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[140px]"
            />
            <div className="flex items-center gap-2">
              <span>{t('格式', 'Tipo')}:</span>
              <select
                value={activeFile.language}
                onChange={e =>
                  updateEditorFile(activeFile.id, {
                    language: e.target.value as EditorFile['language']
                  })
                }
                className="bg-slate-100 text-slate-800 font-bold rounded px-2 py-1 text-xs focus:outline-none border border-slate-200"
              >
                <option value="markdown">Markdown</option>
                <option value="javascript">JavaScript</option>
                <option value="html">HTML</option>
                <option value="json">JSON</option>
                <option value="text">纯文本 (Text)</option>
              </select>
            </div>
          </div>

          {/* Editor Workspace */}
          {viewMode === 'edit' ? (
            <div className="flex-1 flex overflow-hidden bg-white">
              {/* Line numbers column */}
              <div className="w-10 py-3 bg-slate-100 border-r border-slate-200 text-right pr-2 text-slate-400 font-mono text-xs select-none overflow-hidden">
                {Array.from({ length: Math.max(linesCount, 1) }).map((_, i) => (
                  <div key={i} className="leading-6 font-semibold">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={activeFile.content}
                onChange={e => updateEditorFile(activeFile.id, { content: e.target.value })}
                placeholder="开始输入你的代码或文本..."
                spellCheck={false}
                className="flex-1 p-3.5 bg-white text-slate-900 font-mono text-sm leading-6 resize-none focus:outline-none slim-scrollbar whitespace-pre"
              />
            </div>
          ) : (
            /* Preview Mode */
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto slim-scrollbar">
              {activeFile.language === 'html' ? (
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 font-mono">
                    HTML 动态沙盒预览 (Live View)
                  </div>
                  <div
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs"
                    dangerouslySetInnerHTML={{ __html: activeFile.content }}
                  />
                </div>
              ) : (
                <div className="space-y-2 text-slate-800 text-sm leading-relaxed">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 font-mono">
                    文档排版预览 (Document Render)
                  </div>
                  <pre className="p-4 bg-white rounded-xl border border-slate-200 text-slate-800 font-mono text-xs whitespace-pre-wrap shadow-xs">
                    {activeFile.content}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Footer status */}
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-white border-t border-slate-200 text-xs text-slate-600 font-mono font-medium">
            <div className="flex items-center gap-3">
              <span>{linesCount} 行</span>
              <span>{charsCount} 字符</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>已自动存入手机</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <FileText size={40} className="mb-2 opacity-50 text-slate-300" />
          <p className="text-sm font-semibold">暂无打开的文件</p>
          <button
            onClick={handleCreateFile}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            新建文件
          </button>
        </div>
      )}
    </div>
  );
};
