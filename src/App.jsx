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

  // 🔹 Toolbar 用（只負責複製 HTML）
  // const [selected, setSelected] = useState(null);

  // 🔹 尺寸表專用（預覽 + 存 JPG）
  const [sizeSelected, setSizeSelected] = useState(null);

  const previewRef = useRef(null);
  const [showTop, setShowTop] = useState(false);

  /* 回頂端 */
  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* 讀取 CSV */
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

          const validHeaders = Object.keys(rev[0] || {}).filter(
            (h) => h && h.trim() !== '' && !h.startsWith('_')
          );

          const cleaned = rev.map((row) => {
            const newRow = {};
            validHeaders.forEach((h) => (newRow[h] = row[h]));
            return newRow;
          });

          setRows(cleaned);
          setHeaders(validHeaders);
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

      {/* 🔹 Toolbar：只處理搜尋＋複製 */}
      <Toolbar onSearch={handleSearch} selected={sizeSelected} />

      {/* 🔹 尺寸表預覽 */}
      {sizeSelected?.isSize && sizeSelected.full && (
        <div className="preview-card">
          <div className="preview-header">
            <span className="preview-family-code">{sizeSelected.familyCode}</span>
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

                document.execCommand('copy');
                selection.removeAllRanges();
                alert('已複製尺寸表，貼上後會是表格。');
              }}
            >
              複製表格
            </button>

            <button
              className="preview-copy-btn"
              onClick={async () => {
                const code = sizeSelected.familyCode;
                if (!code) {
                  alert('此筆尺寸表沒有可用的家族碼或條碼');
                  return;
                }

                const el = previewRef.current;
                if (!el) return;

                const rect = el.getBoundingClientRect();
                const scale = 1000 / rect.width;

                const raw = await html2canvas(el, {
                  backgroundColor: '#ffffff',
                  scale: scale,
                  useCORS: true,
                });

                // 強制輸出剛好 1000px 寬
                const targetW = 1000;
                const targetH = Math.round((raw.height * targetW) / raw.width);
                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                canvas.getContext('2d').drawImage(raw, 0, 0, targetW, targetH);

                const link = document.createElement('a');
                link.download = `${code}.jpg`;
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
            dangerouslySetInnerHTML={{ __html: sizeSelected.full }}
          />
        </div>
      )}

      {/* 🔹 表格 */}
      <DataTable
        headers={headers}
        rows={pageRows}
        selected={sizeSelected}
        setSelected={setSizeSelected}
      />

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />

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
