export function initializeWebViewLinks() {
  const ua = navigator.userAgent.toLowerCase();

  const isAndroidWebView =
    ua.includes("android") && (ua.includes("wv") || ua.includes("version/"));

  if (!isAndroidWebView) return;

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest("a");

    if (!link || !link.href) return;

    const url = new URL(link.href, window.location.href);

    if (!["http:", "https:"].includes(url.protocol)) return;

    if (url.hostname === window.location.hostname) return;

    event.preventDefault();

    const intentUrl =
      `intent://${url.host}${url.pathname}${url.search}${url.hash}` +
      `#Intent;scheme=${url.protocol.replace(":", "")};` +
      `action=android.intent.action.VIEW;` +
      `category=android.intent.category.BROWSABLE;end`;

    window.location.href = intentUrl;
  });
}
