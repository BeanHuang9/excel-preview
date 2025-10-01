import React, { useState } from "react";

export default function Toolbar({ onSearch, selected }) {
  const [notice, setNotice] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // ✅ 安全的複製函式：支援 https/localhost 的 Clipboard API，
  //    其餘情況退回 textarea + execCommand('copy')
  const copyText = async (text) => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch (err) {
      // 仍失敗時丟出去給外層 catch
      throw err;
    }
  };

  const handleCopy = async () => {
    try {
      await copyText(selected?.full || "");
      setNotice(true);
      setFadeOut(false);
      setTimeout(() => setFadeOut(true), 4500);
      setTimeout(() => setNotice(false), 5000);
    } catch (e) {
      console.error(e);
      alert("複製失敗：瀏覽器限制了剪貼簿權限（試試使用 localhost 或 HTTPS）。");
    }
  };

  return (
    <>
      <div className="toolbar">
        <input
          type="text"
          placeholder="搜尋商品名稱、條碼、家族碼或尺寸表內容…"
          onChange={(e) => onSearch(e.target.value)}
        />
        <input type="text" value={selected?.plain || ""} readOnly />
        <button onClick={handleCopy}>複製</button>
      </div>

      {notice && (
        <div className={`copy-notice ${fadeOut ? "fade-out" : ""}`}>
          已複製到剪貼簿！
        </div>
      )}
    </>
  );
}
