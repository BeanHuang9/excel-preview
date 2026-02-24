import React, { useState } from 'react';

export default function Toolbar({ onSearch, selected }) {
  const [notice, setNotice] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // ✅ 升級版複製：同時寫入 text/html + text/plain
  const copyHTML = async (html) => {
    if (!html) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([html], { type: 'text/plain' }),
          }),
        ]);
      } else {
        // fallback（舊瀏覽器）
        const ta = document.createElement('textarea');
        ta.value = html;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleCopy = async () => {
    try {
      // 🔥 改這裡：直接複製 HTML 原始碼
      await copyHTML(selected?.full || '');

      setNotice(true);
      setFadeOut(false);
      setTimeout(() => setFadeOut(true), 4500);
      setTimeout(() => setNotice(false), 5000);
    } catch (e) {
      console.error(e);
      alert('複製失敗：請使用 HTTPS 或 localhost。');
    }
  };

  const handleGoCodePen = () => {
    window.open('https://codepen.io/', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="toolbar">
        <input
          type="text"
          placeholder="搜尋商品名稱、條碼、家族碼或尺寸表內容…"
          onChange={(e) => onSearch(e.target.value)}
        />

        <textarea
          value={selected?.full || ''}
          readOnly
          style={{
            minWidth: '280px',
            padding: '10px 12px',
            border: '1px solid #cfcfcf',
            borderRadius: '8px',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
          }}
        />

        <button onClick={handleCopy}>複製</button>
        <button onClick={handleGoCodePen}>CodePen</button>
      </div>

      {notice && <div className={`copy-notice ${fadeOut ? 'fade-out' : ''}`}>已複製到剪貼簿！</div>}
    </>
  );
}
