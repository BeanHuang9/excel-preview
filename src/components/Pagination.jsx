import React from "react";

export default function Pagination({ page, setPage, totalPages }) {
  if (totalPages <= 1) return null;

  const numbers = [];
  const push = (n) => {
    if (!numbers.includes(n) && n >= 1 && n <= totalPages) numbers.push(n);
  };

  push(1);
  for (let n = page - 2; n <= page + 2; n++) push(n);
  push(totalPages);
  numbers.sort((a, b) => a - b);

  return (
    <div className="pagination">
      {/* 上一頁 */}
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        上一頁
      </button>

      {/* 中間數字 + 省略號 */}
      {numbers.map((n, i) => (
        <React.Fragment key={n}>
          {i > 0 && n - numbers[i - 1] > 1 && (
            <span className="ellipsis">…</span>
          )}
          <button
            className={`page-num ${page === n ? "active" : ""}`}
            onClick={() => setPage(n)}
          >
            {n}
          </button>
        </React.Fragment>
      ))}

      {/* 下一頁 */}
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        下一頁
      </button>
    </div>
  );
}
