import React, { useState, useRef, useEffect } from 'react';
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
  Copy,
  WrapText,
  Hash,
  Sun,
  Moon,
  Sparkles,
  CheckSquare,
  Square,
  FileCheck,
  X
} from 'lucide-react';

const LANGUAGE_TEMPLATES: Record<EditorFile['language'], string> = {
  markdown: `# 极光极简文档 (Documento Aurora)

欢迎使用极光轻量代码与文档编辑器！
专门为手机大屏触控优化，支持代码编写、符号栏输入与实时预览。

## 今日重点事项
- [x] 优化手机触屏流畅滑动与自适应
- [x] 增强轻编辑应用排版与预览
- [ ] 导出本地备份或文本文件

> "科技与生活融为一体，每一次触控都灵动顺滑。"

\`\`\`javascript
// 简单示例代码
function welcomeUser(name = "极光用户") {
  console.log(\`欢迎使用，\${name}！\`);
}
\`\`\`
`,
  javascript: `// JavaScript 极光脚本演示
function calculateTax(amount, rate = 0.13) {
  const tax = amount * rate;
  return {
    subtotal: amount,
    tax: Number(tax.toFixed(2)),
    total: Number((amount + tax).toFixed(2))
  };
}

const bill = calculateTax(1280);
console.log("账单明细:", bill);
`,
  html: `<div style="padding: 20px; background: linear-gradient(135deg, #f0fdf4, #e0f2fe); border-radius: 16px; border: 1px solid #bae6fd; font-family: -apple-system, sans-serif;">
  <h2 style="color: #0369a1; margin: 0 0 8px 0; font-size: 18px;">✨ 极光卡片沙盒</h2>
  <p style="color: #334155; margin: 0 0 16px 0; font-size: 14px;">在轻编辑中实时渲染 HTML 与内联样式效果。</p>
  <button style="background: #0284c7; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: bold; cursor: pointer;">
    立即探索
  </button>
</div>`,
  json: `{
  "system": "极光OS · 华智虚拟手机",
  "version": "5.2.0-Pro",
  "screen": {
    "touchResponsive": true,
    "nativeScrolling": true
  },
  "features": [
    "便签本",
    "农历日历",
    "轻编辑器",
    "汇率与换算",
    "相册相机",
    "本地即时备份"
  ]
}`,
  text: `华智科技 · 随笔便签
记录日期：2026年11月
内容：
这是一个无需服务器的纯本地轻量文本编辑器。
支持即时输入、统计与一键下载保存到本地。`
};

// Common mobile coding shortcuts
const QUICK_SYMBOLS = [
  { label: 'Tab', insert: '  ' },
  { label: '{ }', insert: '{\n  \n}' },
  { label: '[ ]', insert: '[]' },
  { label: '( )', insert: '()' },
  { label: '" "', insert: '""' },
  { label: "' '", insert: "''" },
  { label: '< >', insert: '<>' },
  { label: '#', insert: '# ' },
  { label: '-', insert: '- ' },
  { label: '*', insert: '*' },
  { label: '=', insert: ' = ' },
  { label: ';', insert: ';' },
  { label: ':', insert: ': ' },
  { label: '`', insert: '`' },
  { label: '=>', insert: ' => ' },
  { label: '//', insert: '// ' }
];

export const EditorApp: React.FC = () => {
  const { editorFiles, addEditorFile, updateEditorFile, deleteEditorFile, t, showToast } = usePhone();

  const [activeFileId, setActiveFileId] = useState<string>(editorFiles[0]?.id || '');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isCopied, setIsCopied] = useState(false);

  // Editor Display Toggles
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync scroll between textarea and line numbers
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineGutterRef = useRef<HTMLDivElement | null>(null);

  const activeFile = editorFiles.find(f => f.id === activeFileId) || editorFiles[0];

  useEffect(() => {
    if (!activeFile && editorFiles.length > 0) {
      setActiveFileId(editorFiles[0].id);
    }
  }, [editorFiles, activeFile]);

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
        setActiveFileId(editorFiles[editorFiles.length - 1]?.id || '');
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
    showToast('代码内容已复制');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Sync line gutter scroll position with textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineGutterRef.current) {
      lineGutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Insert shortcut symbol at cursor position
  const handleInsertSymbol = (symbol: string) => {
    if (!activeFile || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeFile.content;
    const updated = text.substring(0, start) + symbol + text.substring(end);
    updateEditorFile(activeFile.id, { content: updated });

    setTimeout(() => {
      textarea.focus();
      const newPos = start + symbol.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Handle Tab key in textarea to insert 2 spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleInsertSymbol('  ');
    }
  };

  const linesCount = activeFile?.content ? activeFile.content.split('\n').length : 1;
  const charsCount = activeFile?.content.length || 0;
  const wordsCount = activeFile?.content ? activeFile.content.trim().split(/\s+/).filter(Boolean).length : 0;

  // Simple, elegant Markdown renderer
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    lines.forEach((line, index) => {
      // Code blocks ```
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // end code block
          elements.push(
            <div key={`code-${index}`} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xs">
              {codeBlockLang && (
                <div className="bg-slate-800 text-slate-400 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider border-b border-slate-700 flex justify-between items-center">
                  <span>{codeBlockLang}</span>
                  <span className="text-[10px] text-slate-500">code snippet</span>
                </div>
              )}
              <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed whitespace-pre">
                {codeBlockContent.join('\n')}
              </pre>
            </div>
          );
          codeBlockContent = [];
          inCodeBlock = false;
          codeBlockLang = '';
        } else {
          // start code block
          inCodeBlock = true;
          codeBlockLang = line.trim().slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-xl sm:text-2xl font-bold text-slate-900 pb-1.5 mb-2 mt-4 border-b border-slate-200">
            {line.replace(/^#\s+/, '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-base sm:text-lg font-bold text-slate-800 mt-3 mb-1.5">
            {line.replace(/^##\s+/, '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm sm:text-base font-bold text-slate-700 mt-2.5 mb-1">
            {line.replace(/^###\s+/, '')}
          </h3>
        );
      }
      // Checkboxes (- [x] or - [ ])
      else if (/^[-*]\s+\[([ xX])\]\s+(.*)/.test(line)) {
        const match = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)/);
        const isChecked = match ? match[1].toLowerCase() === 'x' : false;
        const text = match ? match[2] : '';
        elements.push(
          <div key={index} className="flex items-center gap-2 py-1 text-xs sm:text-sm text-slate-800">
            {isChecked ? (
              <CheckSquare size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <Square size={16} className="text-slate-400 shrink-0" />
            )}
            <span className={isChecked ? 'line-through text-slate-400' : ''}>{text}</span>
          </div>
        );
      }
      // Bullet list (- or *)
      else if (/^[-*]\s+(.*)/.test(line)) {
        const text = line.replace(/^[-*]\s+/, '');
        elements.push(
          <div key={index} className="flex items-start gap-2 py-0.5 text-xs sm:text-sm text-slate-700 pl-2">
            <span className="text-amber-600 font-bold leading-none mt-1.5">•</span>
            <span>{text}</span>
          </div>
        );
      }
      // Blockquotes (> )
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="my-2.5 pl-3.5 py-1.5 border-l-4 border-amber-500 bg-amber-50/70 text-slate-700 text-xs sm:text-sm italic rounded-r-lg">
            {line.replace(/^>\s+/, '')}
          </blockquote>
        );
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={index} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-0.5">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className={`flex flex-col h-full select-text touch-scroll ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top File Tabs & Action Controls */}
      <div className={`px-2 pt-2 border-b shrink-0 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          {/* File Tabs Scroll Area */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0 pr-2">
            {editorFiles.map(file => {
              const isActive = activeFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => {
                    setActiveFileId(file.id);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                    isActive
                      ? isDarkMode
                        ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-xs'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                      : isDarkMode
                      ? 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileCode size={14} className={isActive ? 'text-amber-500' : 'opacity-60'} />
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  {editorFiles.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEditorFile(file.id);
                      }}
                      title="关闭文件"
                      className="ml-1 p-0.5 hover:bg-black/10 rounded-full text-slate-400 hover:text-rose-500"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              onClick={handleCreateFile}
              title="新建文件"
              className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* View / Edit Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              title={viewMode === 'edit' ? '进入预览模式' : '进入编辑模式'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'preview'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {viewMode === 'edit' ? <Eye size={15} /> : <Code size={15} />}
              <span className="hidden sm:inline">{viewMode === 'edit' ? '预览' : '代码'}</span>
            </button>

            {/* Word wrap toggle */}
            <button
              onClick={() => setWordWrap(!wordWrap)}
              title={wordWrap ? '当前：自动换行 (点击关闭)' : '当前：单行滚动 (点击开启换行)'}
              className={`p-1.5 rounded-xl transition-colors ${
                wordWrap
                  ? isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-100 text-indigo-700'
                  : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <WrapText size={15} />
            </button>

            {/* Line numbers toggle */}
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              title={showLineNumbers ? '隐藏行号' : '显示行号'}
              className={`p-1.5 rounded-xl transition-colors ${
                showLineNumbers
                  ? isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-100 text-indigo-700'
                  : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Hash size={15} />
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? '切换日间浅色模式' : '切换夜间深色模式'}
              className={`p-1.5 rounded-xl transition-colors ${
                isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              title="复制代码"
              className={`p-1.5 rounded-xl transition-colors ${
                isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isCopied ? <Check size={15} className="text-emerald-500 font-bold" /> : <Copy size={15} />}
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              title="保存到本地文件"
              className={`p-1.5 rounded-xl transition-colors ${
                isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Download size={15} />
            </button>
          </div>
        </div>

        {/* File Name & Format Row */}
        {activeFile && (
          <div className="flex items-center justify-between pb-2 pt-1 gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <input
                type="text"
                value={activeFile.name}
                onChange={e => updateEditorFile(activeFile.id, { name: e.target.value })}
                className={`font-mono font-bold px-2 py-1 rounded-lg border focus:outline-none truncate w-full max-w-[180px] ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-100 border-slate-700 focus:border-amber-500'
                    : 'bg-slate-100 text-slate-900 border-slate-200 focus:bg-white focus:border-indigo-500'
                }`}
                placeholder="文件名.ext"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('语法', 'Tipo')}:
              </span>
              <select
                value={activeFile.language}
                onChange={e =>
                  updateEditorFile(activeFile.id, {
                    language: e.target.value as EditorFile['language']
                  })
                }
                className={`font-bold rounded-lg px-2 py-1 text-xs focus:outline-none border ${
                  isDarkMode
                    ? 'bg-slate-800 text-amber-400 border-slate-700'
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <option value="markdown">Markdown (.md)</option>
                <option value="javascript">JavaScript (.js)</option>
                <option value="html">HTML (.html)</option>
                <option value="json">JSON (.json)</option>
                <option value="text">纯文本 (.txt)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Editor Content Workspace */}
      {activeFile ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {viewMode === 'edit' ? (
            <div className={`flex-1 flex min-h-0 overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
              {/* Synchronized Line Numbers Gutter */}
              {showLineNumbers && (
                <div
                  ref={lineGutterRef}
                  className={`w-11 py-3 text-right pr-2 font-mono text-xs select-none overflow-hidden shrink-0 border-r ${
                    isDarkMode
                      ? 'bg-slate-900/90 text-slate-500 border-slate-800'
                      : 'bg-slate-100/90 text-slate-400 border-slate-200'
                  }`}
                >
                  {Array.from({ length: Math.max(linesCount, 1) }).map((_, i) => (
                    <div key={i} className="leading-6 font-semibold tabular-nums">
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}

              {/* Main Code & Document Textarea */}
              <textarea
                ref={textareaRef}
                value={activeFile.content}
                onChange={e => updateEditorFile(activeFile.id, { content: e.target.value })}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                placeholder="在此编写你的代码、文档或 Markdown 笔记..."
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                className={`flex-1 p-3 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none slim-scrollbar touch-scroll ${
                  wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
                } ${
                  isDarkMode
                    ? 'bg-slate-950 text-slate-100 placeholder-slate-600 caret-amber-400'
                    : 'bg-white text-slate-900 placeholder-slate-400 caret-indigo-600'
                }`}
              />
            </div>
          ) : (
            /* Live Rendered Preview Mode */
            <div className={`flex-1 p-4 overflow-y-auto slim-scrollbar touch-scroll ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
              {activeFile.language === 'html' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 pb-1 border-b border-slate-200">
                    <span>HTML 动态实时渲染沙盒</span>
                    <span className="text-emerald-600">● 实时交互</span>
                  </div>
                  <div
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: activeFile.content }}
                  />
                </div>
              ) : activeFile.language === 'markdown' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 pb-1 border-b border-slate-200">
                    <span>Markdown 排版效果渲染</span>
                    <span className="text-indigo-600">● 标题与任务</span>
                  </div>
                  <div className={`p-4 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                    {renderMarkdown(activeFile.content)}
                  </div>
                </div>
              ) : activeFile.language === 'json' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 pb-1 border-b border-slate-200">
                    <span>JSON 数据结构格式化</span>
                    <button
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(activeFile.content);
                          updateEditorFile(activeFile.id, { content: JSON.stringify(parsed, null, 2) });
                          showToast('JSON 格式化成功');
                        } catch {
                          showToast('JSON 语法错误，无法格式化');
                        }
                      }}
                      className="px-2 py-0.5 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500"
                    >
                      格式化对齐
                    </button>
                  </div>
                  <pre className={`p-4 rounded-2xl border font-mono text-xs whitespace-pre-wrap shadow-sm overflow-x-auto leading-relaxed ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {activeFile.content}
                  </pre>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-500 pb-1 border-b border-slate-200">
                    代码文本预览 (Text View)
                  </div>
                  <pre className={`p-4 rounded-2xl border font-mono text-xs whitespace-pre-wrap shadow-sm leading-relaxed ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {activeFile.content}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Quick Coding Symbols Toolbar (Mobile Ergonomics) */}
          {viewMode === 'edit' && (
            <div className={`flex items-center gap-1 px-2 py-1.5 border-t overflow-x-auto no-scrollbar shrink-0 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1 shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                快速符号:
              </span>
              {QUICK_SYMBOLS.map(sym => (
                <button
                  key={sym.label}
                  onClick={() => handleInsertSymbol(sym.insert)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap active:scale-95 transition-transform ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                      : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {sym.label}
                </button>
              ))}
            </div>
          )}

          {/* Footer Metrics & Sync Status */}
          <div className={`flex items-center justify-between px-3 py-1.5 border-t text-[11px] font-mono font-medium shrink-0 ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-2.5">
              <span>{linesCount} 行</span>
              <span>·</span>
              <span>{wordsCount} 词</span>
              <span>·</span>
              <span>{charsCount} 字符</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>已即时本地保存</span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
          <FileText size={48} className="mb-3 opacity-40 text-slate-400" />
          <p className="text-sm font-bold text-slate-600">当前没有打开的文件</p>
          <p className="text-xs text-slate-400 mt-1">点击下方按钮快速创建新文档或代码文件</p>
          <button
            onClick={handleCreateFile}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
          >
            + 新建文档
          </button>
        </div>
      )}
    </div>
  );
};
