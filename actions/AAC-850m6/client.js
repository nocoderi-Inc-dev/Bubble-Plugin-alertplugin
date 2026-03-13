function(properties, context) {
  // Customize here
  const CONFIG = {
    duration: 2200,
    animationSpeed: 180,
    fadeOutBuffer: 40,
    zIndex: 2147483647,
    top: 12, right: 12,
    topMd: 16, rightMd: 16, maxWidthMd: 360
  };

  const ID = { style: "pv-toast-style", wrapper: "pv-toast-wrap", flag: "__pvToastReady" };
  const THEMES = {
    yellow: { bg: "#ffefc7", fg: "#b88100" },
    green:  { bg: "#cfe8d5", fg: "#1e6c30" },
    red:    { bg: "#fbd0cb", fg: "#b0200c" }
  };

  const text = (properties.text || "").trim();
  if (!text) return;

  if (!window[ID.flag]) {
    window[ID.flag] = true;

    const injectStyle = () => {
      if (document.getElementById(ID.style)) return;
      const style = document.createElement("style");
      style.id = ID.style;
      style.textContent = `
:root{--pv-safe:env(safe-area-inset-top,0px)}
#${ID.wrapper}{
  position:fixed;top:calc(${CONFIG.top}px + var(--pv-safe));right:${CONFIG.right}px;z-index:${CONFIG.zIndex};
  display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none
}
@media (min-width:768px){
  #${ID.wrapper}{top:calc(${CONFIG.topMd}px + var(--pv-safe));right:${CONFIG.rightMd}px;max-width:${CONFIG.maxWidthMd}px}
}
.pv-toast{
  pointer-events:auto;display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:12px;
  box-shadow:0 10px 25px rgba(0,0,0,.12);border:1px solid rgba(0,0,0,.06);
  transform:translateY(-8px);opacity:0;
  transition:transform ${CONFIG.animationSpeed}ms ease,opacity ${CONFIG.animationSpeed}ms ease;
  will-change:transform,opacity
}
.pv-toast.show{transform:translateY(0);opacity:1}
.pv-toast__title{font-weight:700;font-size:14px;line-height:1.2;margin:0}
.pv-toast__msg{font-size:13px;line-height:1.35;margin:2px 0 0;word-break:break-word}
.pv-toast__close{margin-left:auto;border:0;background:transparent;font-size:18px;line-height:1;padding:2px;cursor:pointer;opacity:.85;color:inherit}
.pv-toast__close:hover{opacity:1}
      `.trim();
      document.head.appendChild(style);
    };

    const ensureWrapper = () => {
      let w = document.getElementById(ID.wrapper);
      if (w) return w;
      w = document.createElement("div");
      w.id = ID.wrapper;

      const append = () => {
        if (document.body && !document.getElementById(ID.wrapper)) document.body.appendChild(w);
      };
      if (document.body) append();
      else document.addEventListener("DOMContentLoaded", append, { once: true });

      return w;
    };

    window.__pvToastShow = (options = {}) => {
      injectStyle();
      const wrapper = ensureWrapper();

      const theme = THEMES[(options.theme || "yellow").toLowerCase()] || THEMES.yellow;
      const duration = (typeof options.duration === "number" && options.duration >= 0) ? options.duration : CONFIG.duration;
      const closeable = options.closeable !== false;

      const toast = document.createElement("div");
      toast.className = "pv-toast";
      toast.style.background = theme.bg;
      toast.style.color = theme.fg;

      const content = document.createElement("div");
      content.style.cssText = "flex:1;min-width:0";

      const t = (options.title || "").trim();
      if (t) {
        const p = document.createElement("p");
        p.className = "pv-toast__title";
        p.textContent = t;
        content.appendChild(p);
      }

      const m = (options.text || "").trim();
      if (m) {
        const p = document.createElement("p");
        p.className = "pv-toast__msg";
        p.textContent = m;
        content.appendChild(p);
      }

      toast.appendChild(content);

      let removed = false;
      let timer = null;

      const remove = () => {
        if (removed) return;
        removed = true;
        if (timer) clearTimeout(timer);
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), CONFIG.animationSpeed + CONFIG.fadeOutBuffer);
      };

      if (closeable) {
        const btn = document.createElement("button");
        btn.className = "pv-toast__close";
        btn.type = "button";
        btn.setAttribute("aria-label", "Close");
        btn.textContent = "×";
        btn.addEventListener("click", (e) => { e.stopPropagation(); remove(); });
        toast.appendChild(btn);
      }

      wrapper.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("show"));

      if (duration > 0) timer = setTimeout(remove, duration);

      return { remove, el: toast };
    };
  }

  const theme = (properties.theme || "yellow").trim().toLowerCase();
  const title = (properties.title || "").trim();
  const duration = (typeof properties.duration === "number" && properties.duration >= 0) ? properties.duration : CONFIG.duration;

  window.__pvToastShow({ theme, title, text, duration, closeable: properties.closeable !== false });
}