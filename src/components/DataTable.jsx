import React from 'react';

// 工具：移除 HTML 標籤
const stripHtml = (str) => String(str || '').replace(/<[^>]*>/g, '');

// 尺寸表欄位
const isSizeCol = (h) => h.includes('尺寸表');

// 非空非錯誤值
const valid = (v) => v && v !== '#N/A';

export default function DataTable({ headers, rows, selected, setSelected }) {
  if (!rows.length) {
    return <p>目前沒有資料。</p>;
  }

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
          // 取各家族識別欄位
          const familyKey = Object.keys(row).find((k) => k.includes('家族碼'));
          const aggBarcodeKey = Object.keys(row).find((k) => k.includes('集約條碼'));
          const barcodeKey = Object.keys(row).find(
            (k) => k.includes('條碼') && !k.includes('集約')
          );
          const productNameKey = Object.keys(row).find((k) => k.includes('商品頁名稱'));

          const rawFamilyCode = familyKey ? String(row[familyKey]).trim() : '';
          const aggBarcode = aggBarcodeKey ? String(row[aggBarcodeKey]).trim() : '';
          const barcode = barcodeKey ? String(row[barcodeKey]).trim() : '';
          const productName = productNameKey ? String(row[productNameKey]).trim() : '';

          // 最終用來當檔名的代碼（家族碼優先，fallback 條碼）
          const finalCode = valid(rawFamilyCode) ? rawFamilyCode : barcode;

          // 只要任一識別欄位相符即視為同家族
          const isSameFamily =
            selected &&
            ((valid(finalCode) && finalCode === selected.familyCode) ||
              (valid(aggBarcode) && aggBarcode === selected.aggBarcode) ||
              (valid(barcode) && barcode === selected.barcode) ||
              (valid(productName) && productName === selected.productName));

          return (
            <tr key={i} className={isSameFamily ? 'same-family' : ''}>
              {headers.map((h, j) => {
                const fullValue = row[h] || '';
                const displayText = isSizeCol(h) ? fullValue : stripHtml(fullValue);
                const plainValue = stripHtml(fullValue);
                const isSelected = selected?.full === `<table>${fullValue}</table>`;
                // 直接比對已找到的 key，避免欄位名有不可見字元時 includes 靜默失效
                const clickable =
                  isSizeCol(h) ||
                  h === familyKey ||
                  h === aggBarcodeKey ||
                  h === barcodeKey ||
                  h === productNameKey;

                return (
                  <td
                    key={j}
                    onClick={() => {
                      if (!clickable) return;

                      if (isSizeCol(h)) {
                        setSelected({
                          full: `<table>${fullValue}</table>`,
                          plain: plainValue,
                          isSize: true,
                          familyCode: finalCode,
                          aggBarcode,
                          barcode,
                          productName,
                        });
                      } else {
                        // 家族識別欄位：只更新家族資訊，不顯示預覽
                        setSelected({
                          full: null,
                          plain: null,
                          isSize: false,
                          familyCode: finalCode,
                          aggBarcode,
                          barcode,
                          productName,
                        });
                      }
                    }}
                    className={isSelected ? 'selected-col' : ''}
                    style={clickable ? { cursor: 'pointer' } : undefined}
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
