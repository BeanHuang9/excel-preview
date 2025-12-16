import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import Toolbar from './components/Toolbar';
import DataTable from './components/DataTable';
import Pagination from './components/Pagination';
import './App.css';
import html2canvas from 'html2canvas';

const PAGE_SIZE = 50;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState('');
  const previewRef = useRef(null);

  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300); // 超過 300px 才顯示
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    Papa.parse(
      'https://docs.google.com/spreadsheets/d/1nYuv-yPxdKgKargFzbnQeyE15eW7N1QMVGzrbTHrcVE/gviz/tq?tqx=out:csv',
      {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: ({ data }) => {
          setLoading(false);
          const rev = data.reverse();

          // ✅ 過濾掉空白欄位和奇怪的 key
          const validHeaders = Object.keys(rev[0] || {}).filter(
            (h) => h && h.trim() !== '' && !h.startsWith('_')
          );

          setRows(rev);
          setHeaders(validHeaders);

          // ✅ 把每列的空白 key 也清理掉，避免資料列多出垃圾欄位
          const cleaned = rev.map((row) => {
            const newRow = {};
            validHeaders.forEach((h) => {
              newRow[h] = row[h];
            });
            return newRow;
          });

          setRows(cleaned);
          setFiltered(cleaned);
        },
        error: () => setLoading(false),
      }
    );
  }, []);

  const handleSearch = (q) => {
    const keyword = q.toLowerCase();
    setFiltered(
      rows.filter((row) =>
        headers.some((h) =>
          String(row[h] || '')
            .toLowerCase()
            .includes(keyword)
        )
      )
    );
    setPage(1);
  };

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <div className="app">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">資料載入中…</div>
        </div>
      )}

      <h1>尺寸表資料庫</h1>

      <Toolbar onSearch={handleSearch} selected={selected} setSelected={setSelected} />

      {/* ✅ 尺寸表預覽區塊 */}
      {selected?.isSize && selected.full && (
        <div className="preview-card">
          <div className="preview-header">
            <button
              className="preview-copy-btn"
              onClick={() => {
                const el = previewRef.current;
                if (!el) return;

                const range = document.createRange();
                range.selectNodeContents(el);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);

                try {
                  const ok = document.execCommand('copy');
                  selection.removeAllRanges();
                  alert(ok ? '已複製尺寸表，貼上後會是表格。' : '複製失敗');
                } catch {
                  selection.removeAllRanges();
                  alert('請手動複製');
                }
              }}
            >
              複製表格
            </button>

            {/* ➕ 新增：存成 JPG */}
            <button
              className="preview-copy-btn"
              onClick={async () => {
                const el = previewRef.current;
                if (!el) return;

                // 1️⃣ 建立一個暫時的 wrapper
                const wrapper = document.createElement('div');
                wrapper.style.padding = '10px';
                wrapper.style.background = '#ffffff';
                wrapper.style.display = 'inline-block';

                // 2️⃣ 複製尺寸表 DOM
                const clone = el.cloneNode(true);
                wrapper.appendChild(clone);

                // 3️⃣ 丟到畫面外（不影響使用者）
                wrapper.style.position = 'fixed';
                wrapper.style.top = '-9999px';
                document.body.appendChild(wrapper);

                // 4️⃣ 轉成 canvas
                const canvas = await html2canvas(wrapper, {
                  backgroundColor: '#ffffff',
                  scale: 2,
                });

                // 5️⃣ 移除暫時 DOM
                document.body.removeChild(wrapper);

                // 6️⃣ 下載 JPG
                const link = document.createElement('a');
                link.download = '尺寸表.jpg';
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
              }}
            >
              儲存成 JPG
            </button>
          </div>

          <div
            ref={previewRef}
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: selected.full }}
          />
        </div>
      )}

      <DataTable headers={headers} rows={pageRows} selected={selected} setSelected={setSelected} />

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />

      {/* 回頂端按鈕 */}
      {showTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ▲
        </button>
      )}
    </div>
  );
}
