import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import Toolbar from './components/Toolbar';
import DataTable from './components/DataTable';
import Pagination from './components/Pagination';
import './App.css';

const PAGE_SIZE = 50;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState('');
  const previewRef = useRef(null);

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
            {/* 🚫 不顯示尺寸表預覽文字（整段移除） */}

            {/* ✔ 複製表格按鈕保留在右側 */}
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

                  if (ok) {
                    alert('已複製尺寸表，貼上後會是表格。');
                  } else {
                    alert('複製沒有成功，請手動 Ctrl+C / ⌘C。');
                  }
                } catch (e) {
                  selection.removeAllRanges();
                  alert('瀏覽器不支援自動複製，請手動選取表格後 Ctrl+C / ⌘C。');
                }
              }}
            >
              複製表格
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
    </div>
  );
}
