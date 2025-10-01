import React from "react";

// 仍保留工具函式，給其他欄位用
const stripHtml = (str) => str.replace(/<[^>]*>/g, "");

export default function DataTable({ headers, rows, selected, setSelected }) {
  if (!rows.length) { /* ...略... */ }

  const isSizeCol = (h) => h.includes("尺寸表");

  return (
    <table>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className={isSizeCol(h) ? "size-col" : ""}>{h}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {headers.map((h, j) => {
              const fullValue = row[h] || "";
              // ⚠️ 尺寸表欄顯示「原始字串」，其他欄位仍顯示純文字
              const displayText = isSizeCol(h) ? fullValue : stripHtml(fullValue);
              const plainValue   = stripHtml(fullValue);

              return (
                <td
                  key={j}
                  onClick={() => setSelected({ full: fullValue, plain: plainValue })}
                  className={selected?.full === fullValue ? "selected-col" : ""}
                  title={displayText}
                >
                  {isSizeCol(h) ? (
                    // 兩行顯示 + 顯示原始字串（React 會自動轉義，不會真的渲染成 HTML）
                    <div className="clamp-2">{displayText}</div>
                  ) : (
                    displayText
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
