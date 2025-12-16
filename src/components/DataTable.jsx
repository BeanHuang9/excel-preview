import React from 'react';

// 工具：移除 HTML 標籤
const stripHtml = (str) => String(str || '').replace(/<[^>]*>/g, '');

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
        {rows.map((row, i) => {
          // ✅ 找家族碼（防空白 / BOM）
          const familyKey = Object.keys(row).find((k) => k.includes('家族碼'));
          const rawFamilyCode = familyKey ? String(row[familyKey]).trim() : '';

          // ✅ 找條碼（當家族碼為空或 #N/A 時 fallback）
          const barcodeKey = Object.keys(row).find((k) => k.includes('條碼'));
          const barcode = barcodeKey ? String(row[barcodeKey]).trim() : '';

          // ✅ 最終用來當檔名的代碼
          const finalCode = rawFamilyCode && rawFamilyCode !== '#N/A' ? rawFamilyCode : barcode;

          return (
            <tr key={i}>
              {headers.map((h, j) => {
                const fullValue = row[h] || '';
                const displayText = isSizeCol(h) ? fullValue : stripHtml(fullValue);
                const plainValue = stripHtml(fullValue);
                const isSelected = selected?.full === fullValue;

                return (
                  <td
                    key={j}
                    onClick={() => {
                      // ❗只在點「尺寸表欄位」時才更新 selected
                      if (!isSizeCol(h)) return;

                      setSelected({
                        full: fullValue,
                        plain: plainValue,
                        isSize: true,
                        familyCode: finalCode, // ✅ 一定有值（家族碼 or 條碼）
                      });
                    }}
                    className={isSelected ? 'selected-col' : ''}
                    title={displayText}
                  >
                    {isSizeCol(h) ? <div className="clamp-2">{displayText}</div> : displayText}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
