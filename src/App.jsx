import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Toolbar from "./components/Toolbar";
import DataTable from "./components/DataTable";
import Pagination from "./components/Pagination";
import "./App.css";

const PAGE_SIZE = 50;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");

  useEffect(() => {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/1nYuv-yPxdKgKargFzbnQeyE15eW7N1QMVGzrbTHrcVE/gviz/tq?tqx=out:csv",
    {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        setLoading(false);
        const rev = data.reverse();

        // ✅ 過濾掉空白欄位和奇怪的 key
        const validHeaders = Object.keys(rev[0] || {}).filter(
          (h) => h && h.trim() !== "" && !h.startsWith("_")
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
        headers.some((h) => String(row[h] || "").toLowerCase().includes(keyword))
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

      <h1>商品尺寸表</h1>

      <Toolbar onSearch={handleSearch} selected={selected} setSelected={setSelected} />

      <DataTable headers={headers} rows={pageRows} selected={selected} setSelected={setSelected} />

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
}
