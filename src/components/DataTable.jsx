import React from 'react';

// 仍保留工具函式，給其他欄位用
const stripHtml = (str) => str.replace(/<[^>]*>/g, '');

export default function DataTable({ headers, rows, selected, setSelected }) {
  if (!rows.length) {
    return <p>目前沒有資料。</p>;
  }

  // 判斷是不是「尺寸表」欄位
  const isSizeCol = (h) => h.includes('尺寸表');

  return (
    <table>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className={isSizeCol(h) ? 'size-col' : ''}>
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {headers.map((h, j) => {
              const fullValue = row[h] || '';
              const displayText = isSizeCol(h) ? fullValue : stripHtml(fullValue);
              const plainValue = stripHtml(fullValue);
              const isSelected = selected?.full === fullValue;

              return (
                <td
                  key={j}
                  onClick={() =>
                    setSelected({
                      full: fullValue,
                      plain: plainValue,
                      isSize: isSizeCol(h), // ✅ 多存這個
                    })
                  }
                  className={isSelected ? 'selected-col' : ''}
                  title={displayText}
                >
                  {isSizeCol(h) ? (
                    // 表格裡還是只顯示「原始文字縮兩行」，避免塞真正表格在裡面
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
