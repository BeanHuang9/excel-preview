import React, { useState } from "react";

// 工具函式：去除 HTML tag
const stripHtml = (str) => str.replace(/<[^>]*>/g, "");

export default function DataTable({ headers, rows, selected, setSelected }) {
  const [flashCells, setFlashCells] = useState({});

  if (!rows.length) {
    return (
      <table>
        <tbody>
          <tr>
            <td colSpan={headers.length}>沒有資料</td>
          </tr>
        </tbody>
      </table>
    );
  }

  const handleClick = (rowIndex, colName, fullValue, plainValue) => {
    setSelected({ full: fullValue, plain: plainValue });

    const key = `${rowIndex}-${colName}`;
    setFlashCells((prev) => ({ ...prev, [key]: true }));

    setTimeout(() => {
      setFlashCells((prev) => ({ ...prev, [key]: false }));
    }, 500); // 0.5 秒後移除閃爍
  };

  return (
    <table>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className={h.includes("尺寸表") ? "size-col" : ""}>
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {headers.map((h, j) => {
              const fullValue = row[h] || "";
              const plainValue = stripHtml(fullValue);
              const key = `${i}-${h}`;

              return (
                <td
                  key={j}
                  onClick={() => handleClick(i, h, fullValue, plainValue)}
                  className={`${flashCells[key] ? "flash-once" : ""} ${
                    selected?.full === fullValue ? "selected-col" : ""
                  }`}
                  title={plainValue}
                >
                  {h.includes("尺寸表") ? (
                    <div className="clamp-2">{plainValue}</div>
                  ) : (
                    plainValue
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
