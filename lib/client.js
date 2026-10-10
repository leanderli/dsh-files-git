window.__ModuleLoader__.load({
	id: "dsh-files-git",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region head · platform deps (require/seed words only)
		const React = require("react");
		const { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore, useId } = React;
		const h = React.createElement;
		const ReactDOM = (() => { try { return require("react-dom"); } catch (e) { return null; } })();
		// Portal helper for the portal call sites in the fragments: react-dom
		// is normally present, but the require above may yield null (a platform
		// without the seed). Falling back to IN-PLACE rendering degrades the
		// portaled popovers/menus to non-floating instead of crashing the whole
		// panel with a TypeError on the null deref.
		const portal = (children, container) => (ReactDOM && typeof ReactDOM.createPortal === "function" ? ReactDOM.createPortal(children, container) : children);
		//#endregion
		const MONACO_WORKER_ENTRIES = {"editor":"assets/editor.worker-lj3bdIIn.js","json":"assets/json.worker-CoJx_OPf.js","css":"assets/css.worker-URu8fCFR.js","html":"assets/html.worker-D1SL3iM8.js","typescript":"assets/ts.worker-BWKtMYOk.js"};
		//#region styles
		// ── inject one <style> tag with all classes (DSH-token-driven) ────────────
		const CSS_TAG = "dsh-files-git/styles";
		if (typeof document !== "undefined" && !document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`)) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-files-git";
			style.dataset.pluginCss = CSS_TAG;
			style.textContent = `
.dgp-trigger{border:1px solid var(--dsw-alias-border-l2);min-width:118px;height:32px;color:var(--dsw-alias-label-primary);font-family:var(--dgp-font-ui,var(--dsw-font-family,sans-serif));cursor:pointer;background:0 0;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:6px 12px;font-size:calc(13px * var(--dgp-ui-scale,1));font-weight:400;line-height:calc(20px * var(--dgp-ui-scale,1));display:inline-flex}
.dgp-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dgp-trigger:disabled{color:color-mix(in srgb,var(--dsw-alias-label-primary) 30%,transparent);cursor:wait}
.dgp-trigger[data-active="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-trigger svg,.dgp-trigger span{flex:none}
.dgp-trigger svg{translate:0 1px} /* align icon visual center with CJK text (pixel-measured -0.95px) */
.dgp-trigger span{white-space:nowrap}
.dgp-triggerCompact{min-width:32px;padding:6px 9px;border-radius:18px}
.dgp-triggerGhost{border-color:transparent;background:0 0}
.dgp-triggerGhost:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dgp-triggerGhost[data-active="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-trigger[data-suspended="true"]{position:relative;border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 38%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 8%,var(--dsw-alias-bg-base))}
.dgp-trigger[data-suspended="true"]::after{content:"";width:6px;height:6px;margin-left:2px;border-radius:50%;background:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,transparent)}
.dgp-trigger[data-suspended="true"]:hover{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 14%,var(--dsw-alias-bg-base))}
.dgp-trigger:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dgp-root{position:fixed;inset:0;z-index:1050;display:flex;align-items:center;justify-content:center;pointer-events:auto;animation:dgp-fade .16s ease}
.dgp-root[data-hidden="true"]{pointer-events:none;--dgp-reveal-height:40px}
.dgp-root[data-hidden="true"] .dgp-dialog{transform:translateY(calc(var(--dgp-reveal-height) - 50vh - 50%));pointer-events:auto}
.dgp-mask{position:absolute;inset:0;background:rgba(15,19,30,.24);pointer-events:auto;transition:opacity .2s ease}
body[data-ds-dark-theme] .dgp-mask{background:rgba(0,0,0,.48)}
.dgp-mask[data-hidden="true"]{opacity:0;pointer-events:none}
.dgp-suspendCue{position:absolute;top:calc(100% - var(--dgp-reveal-height) + 8px);left:50%;z-index:2;box-sizing:border-box;width:32px;height:24px;display:flex;align-items:center;justify-content:center;transform:translateX(-50%);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 72%,transparent);border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 82%,transparent);backdrop-filter:blur(10px) saturate(1.2);-webkit-backdrop-filter:blur(10px) saturate(1.2);box-shadow:0 2px 8px rgba(15,19,30,.12);color:var(--dsw-alias-label-secondary);opacity:.94;pointer-events:none;transition:color .18s ease,opacity .18s ease,background-color .18s ease,border-color .18s ease}
.dgp-dialog:hover .dgp-suspendCue{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-bg-base) 90%,transparent);border-color:var(--dsw-alias-border-l2);opacity:1}
.dgp-dialog > .dgp-suspendCue{position:absolute}
body[data-ds-dark-theme] .dgp-root[data-hidden="true"] .dgp-dialog{background:var(--dsw-alias-bg-base);border-color:var(--dsw-alias-border-l2)}
body[data-ds-dark-theme] .dgp-root[data-hidden="true"] .dgp-suspendCue{background:color-mix(in srgb,var(--dsw-alias-bg-base) 90%,transparent);border-color:var(--dsw-alias-border-l2);box-shadow:0 2px 10px rgba(0,0,0,.34);color:var(--dsw-alias-label-primary);opacity:1}
@media(prefers-reduced-motion:reduce){.dgp-suspendCue{transition:none}}
.dgp-dialog{position:relative;z-index:1;display:flex;flex-direction:column;width:1280px;max-width:94vw;height:90vh;height:90dvh;max-height:90vh;max-height:90dvh;background:color-mix(in srgb,var(--dsw-alias-bg-base) 97%,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:24px;overflow:hidden;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.1);animation:dgp-scale .16s cubic-bezier(.2,.8,.2,1);transition:transform .28s cubic-bezier(.2,.8,.2,1);color:var(--dsw-alias-label-primary);font-family:var(--dgp-font-ui,var(--dsw-font-family,sans-serif))}
/* Frosted-glass backdrop lives on ::before (a dedicated backdrop root) instead
   of the dialog itself — Chrome does NOT apply backdrop-filter to elements
   nested inside another backdrop-filter element, which silently killed the
   blur on the search-history / branch popups. With the dialog no longer a
   backdrop root, popups inside it blur normally again. */
.dgp-dialog::before{content:"";position:absolute;inset:0;z-index:0;background:transparent;backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);pointer-events:none}
.dgp-dialog > div{position:relative;z-index:1}
/* Thin inset scrollbars use semantic DSH text/accent tokens, so the thumb
   stays legible and reverses with the active light/dark theme. */
.dgp-root,.dgp-root *{scrollbar-color:color-mix(in srgb,var(--dsw-alias-label-secondary) 62%,transparent) transparent;scrollbar-width:thin}
.dgp-root *::-webkit-scrollbar{width:6px;height:6px}
.dgp-root *::-webkit-scrollbar-track,.dgp-root *::-webkit-scrollbar-corner{background:transparent}
.dgp-root *::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--dsw-alias-label-secondary) 52%,transparent);border:1px solid transparent;border-radius:999px;background-clip:padding-box}
.dgp-root *::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-state-business-primary);background-clip:padding-box}
.dgp-fileRows,.dgp-globalList,.dgp-previewBody,.dgp-gitScroll,.dgp-diff,.dgp-tree,.dgp-branchList,.dgp-crumbMenu,.dgp-searchHist,.dgp-opDetail,.dgp-body[data-tab="settings"]{scrollbar-gutter:stable;overscroll-behavior:contain}
@keyframes dgp-fade{from{opacity:0}to{opacity:1}}
@keyframes dgp-scale{from{opacity:0;transform:scale(.97) translateY(6px)}to{opacity:1;transform:none}}
.dgp-header{display:flex;flex-wrap:nowrap;align-items:center;gap:12px;padding:6px 18px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;position:relative}
.dgp-headerActions{display:inline-flex;align-items:center;gap:4px;flex:none;margin-left:auto}
.dgp-headerActions .dgp-btn{box-sizing:border-box;width:28px;height:28px;padding:0;justify-content:center;border-color:transparent;background:transparent;color:var(--dsw-alias-label-secondary)}
.dgp-headerActions .dgp-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-settingsPage{display:flex;flex-direction:column;gap:0;max-width:600px;width:100%;margin:0 auto;padding:20px 0 28px}
.dgp-settingsTitle{font-size:calc(15px * var(--dgp-ui-scale,1));font-weight:600;line-height:calc(22px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary);margin-bottom:6px}
/* Settings rows: statement label (+hint) LEFT, dropdown control RIGHT,
   separated by hairline rules — replaces the old tiled option cubes */
.dgp-setRow{border-bottom:.5px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0}
.dgp-setRowMain{display:flex;flex-direction:column;gap:2px;min-width:0}
.dgp-setRowMainFull{flex:1;min-width:0}
.dgp-setRowLabel{font-size:calc(14px * var(--dgp-ui-scale,1));font-weight:400;line-height:calc(22px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary)}
.dgp-setRowHint{font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(18px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-secondary)}
/* DSH-style dropdown select (aligned with the DSH settings page): pill
   trigger button + floating option card with hover rows and a trailing
   checkmark on the selected item.
   The menu card uses LITERAL colors with an explicit alpha, never the host
   surface tokens: in this panel's DOM context a token-based card renders
   translucent on its own (pixel-measured card interior #606060 over a pure
   black code pane, i.e. about 38% white), so var(--dsw-alias-bg-base) and any
   color-mix built on it stay see-through no matter the concentration.
   Alpha is a deliberate literal here: 85% per the user's request, light and
   dark alike, with the dark variant on the same body[data-ds-dark-theme] hook
   the rest of this stylesheet uses. */
.dgp-ddWrap{position:relative;flex:none}
.dgp-ddBtn{box-sizing:border-box;font:inherit;font-size:calc(13px * var(--dgp-ui-scale,1));line-height:calc(20px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary);cursor:pointer;background:var(--dsw-alias-bg-base);border:.5px solid var(--dsw-alias-border-l2);border-radius:18px;padding:8px 14px;min-width:120px;display:inline-flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 1px 2px rgba(0,0,0,.04);transition:background-color .12s}
.dgp-ddBtn:hover,.dgp-ddBtn[data-open="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-ddBtn svg{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-ddLabel{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dgp-ddMenu{position:absolute;top:calc(100% + 6px);right:0;z-index:40;min-width:100%;max-height:min(60vh,420px);overflow-y:auto;overscroll-behavior:contain;background:rgba(247,247,249,.85);border:.5px solid var(--dsw-alias-border-l2);border-radius:14px;box-shadow:0 0 1px rgba(0,0,0,.2),0 6px 20px rgba(0,0,0,.1);padding:6px;display:flex;flex-direction:column;gap:2px;animation:dgp-scale .12s cubic-bezier(.2,.8,.2,1);transform-origin:top right}
body[data-ds-dark-theme] .dgp-ddMenu{background:rgba(38,39,43,.85)}
.dgp-ddItem{box-sizing:border-box;font:inherit;font-size:calc(13px * var(--dgp-ui-scale,1));line-height:calc(20px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:none;border-radius:10px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:16px;white-space:nowrap;text-align:left}
.dgp-ddItem:hover,.dgp-ddItem[data-cursor="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-ddItem[data-selected="true"] svg{color:var(--dsw-alias-label-primary)}
/* Theme preview: full-width strip directly under the theme row, split 1:1
   into two equal sample-code panes (light | dark); palette driven inline */
.dgp-themeSplit{display:flex;gap:10px;width:100%}
.dgp-themeSplit .dgp-themePreview{flex:1 1 0;min-width:0;min-height:150px}
.dgp-themePreview{box-sizing:border-box;border-radius:12px;outline:.5px solid var(--dsw-alias-border-l4);padding:12px 14px;overflow:hidden;font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,SFMono-Regular,Consolas,"Courier New",monospace));font-size:calc(11px * var(--dgp-ui-scale,1));line-height:calc(18px * var(--dgp-ui-scale,1));white-space:pre;user-select:none}
.dgp-titleWrap{flex:0 1 auto;width:max-content;min-width:0;display:flex;align-items:center;gap:7px;max-width:260px}
.dgp-title{margin:0;font-size:calc(14px * var(--dgp-ui-scale,1));font-weight:600;line-height:calc(20px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-wsIcon{display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-state-business-primary);flex:none}
/* Inline tabs (mock-up): the tab strip lives IN the top bar between the
   workspace name and the window controls; no own bottom hairline (the header
   carries the single rule), and the whole strip may shrink on tight widths. */
.dgp-tabsInline{flex:0 1 auto;min-width:0;flex-wrap:nowrap;padding:0;border-bottom:none;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;white-space:nowrap}
.dgp-tabsInline::-webkit-scrollbar{display:none}
.dgp-tabsInline>.dgp-tab{flex:none;white-space:nowrap}
.dgp-tabChip{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:5px;background:var(--dsw-alias-interactive-bg-hover);flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-tab[data-active="true"] .dgp-tabChip,.dgp-tabSplit[data-active="true"] .dgp-tabChip{color:var(--dsw-alias-state-business-primary)}
.dgp-close{border:none;background:0 0;cursor:pointer;color:var(--dsw-alias-label-secondary);width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0}
.dgp-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-tabs{display:flex;gap:4px;flex:none;padding:0 24px;border-bottom:1px solid var(--dsw-alias-border-l1);position:relative;align-items:center}
.dgp-header .dgp-tabsInline{flex:0 1 auto;padding:0;border-bottom:none}
.dgp-tab{border:none;background:0 0;cursor:pointer;font-family:var(--dgp-font-ui,var(--dsw-font-family,sans-serif));font-size:calc(12px * var(--dgp-ui-scale,1));font-weight:500;line-height:calc(18px * var(--dgp-ui-scale,1));padding:5px 10px;color:var(--dsw-alias-label-secondary);border-bottom:2px solid transparent;margin-bottom:-1px;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.dgp-tab:hover{color:var(--dsw-alias-label-primary)}
.dgp-tab[data-active="true"]{color:var(--dsw-alias-state-business-primary);border-bottom-color:var(--dsw-alias-state-business-primary)}
.dgp-tabSplit{padding:0;gap:0;position:relative}
.dgp-tabSplit .dgp-tabMain{border:none;background:0 0;cursor:pointer;font-family:var(--dgp-font-ui,var(--dsw-font-family,sans-serif));font-size:calc(12px * var(--dgp-ui-scale,1));font-weight:500;line-height:calc(18px * var(--dgp-ui-scale,1));padding:5px 3px 5px 10px;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.dgp-tabSplit .dgp-tabMain:hover{color:var(--dsw-alias-label-primary)}
.dgp-tabSplit .dgp-tabMain[data-active="true"]{color:var(--dsw-alias-state-business-primary)}
.dgp-tabSplit[data-active="true"]{background:transparent}
.dgp-tabArrow{border:none;background:0 0;cursor:pointer;padding:5px 10px 5px 2px;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;flex:none}
.dgp-tabArrow:hover{color:var(--dsw-alias-label-primary)}
.dgp-tabArrow[data-open="true"]{color:var(--dsw-alias-label-primary)}
.dgp-body{flex:1;min-height:0;overflow:hidden;padding:8px 12px 12px;display:flex;flex-direction:column;gap:8px}
.dgp-body[data-tab="files"],.dgp-body[data-tab="git"]{padding:0;gap:0}
.dgp-root [hidden]{display:none!important}
.dgp-body[data-tab="settings"]{overflow-y:auto}
.dgp-dialog[data-max="true"]{width:calc(100vw - 24px);max-width:calc(100vw - 24px);height:calc(100vh - 24px);max-height:calc(100vh - 24px)}
.dgp-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.dgp-opBar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.dgp-opDivider{width:1px;align-self:stretch;background:var(--dsw-alias-border-l2);flex:none}
.dgp-commitInline{display:flex;align-items:center;gap:8px;flex:1 1 360px;min-width:0}
.dgp-commitInput{flex:1 1 180px;min-width:140px;height:32px;box-sizing:border-box;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:0 10px;color:var(--dsw-alias-label-primary);font:inherit;font-size:calc(13px * var(--dgp-ui-scale,1));line-height:calc(20px * var(--dgp-ui-scale,1));outline:none}
.dgp-commitInput:focus{border-color:var(--dsw-alias-state-business-primary)}
.dgp-commitInput::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-primary) 45%,transparent)}
.dgp-btn{border:1px solid var(--dsw-alias-border-l2);background:0 0;color:var(--dsw-alias-label-primary);font-family:var(--dgp-font-ui,var(--dsw-font-family,sans-serif));font-size:calc(13px * var(--dgp-ui-scale,1));font-weight:400;line-height:calc(20px * var(--dgp-ui-scale,1));padding:5px 12px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.dgp-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dgp-btn:disabled{opacity:.5;cursor:not-allowed}
.dgp-btn[data-variant="primary"]{background:var(--dsw-alias-button-info-fill);border-color:transparent;color:#fff}
.dgp-btn[data-variant="primary"]:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-button-info-fill) 88%,#000)}
.dgp-btn[data-variant="danger"]{color:var(--dsw-alias-state-error-primary)}
.dgp-btn[data-variant="dangerFill"]{background:var(--dsw-alias-state-error-primary);border-color:transparent;color:#fff}
.dgp-btn[data-variant="dangerFill"]:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 88%,#000)}
.dgp-btn[data-variant="ghost"]{border-color:transparent}
.dgp-btn svg{flex:none}
.dgp-chk{margin:0;cursor:pointer;accent-color:var(--dsw-alias-state-business-primary);width:14px;height:14px;flex:none;vertical-align:middle}
.dgp-chkLbl{display:inline-flex;gap:4px;align-items:center;font-size:calc(12px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-secondary);cursor:pointer}
.dgp-chip{display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border-radius:999px;font-size:calc(11px * var(--dgp-ui-scale,1));line-height:calc(18px * var(--dgp-ui-scale,1));background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap}
.dgp-chip[data-tone="success"]{color:#fff;background:var(--dsw-alias-state-success-primary);border-color:transparent}
.dgp-chip[data-tone="info"]{color:#fff;background:var(--dsw-alias-button-info-fill);border-color:transparent}
.dgp-chip[data-tone="warn"]{color:#fff;background:var(--dsw-alias-state-warn-primary);border-color:transparent}
.dgp-chip[data-tone="error"]{color:#fff;background:var(--dsw-alias-state-error-primary);border-color:transparent}
.dgp-chip[data-tone="primary"]{color:#fff;background:var(--dsw-alias-state-business-primary);border-color:transparent}
.dgp-chip b{font-weight:700}
.dgp-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.dgp-branchSel{position:relative;display:inline-flex;align-items:center;gap:6px;padding:7px 14px 7px 10px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap;max-width:560px;min-width:0;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}
.dgp-branchSel:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.dgp-branchSel[data-open="true"]{border-color:var(--dsw-alias-state-business-primary)}
.dgp-branchSelIcon{display:inline-flex;align-items:center;color:var(--dsw-alias-label-secondary);flex:none}
.dgp-branchSelName{font-size:calc(14px * var(--dgp-ui-scale,1));line-height:calc(22px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary);font-weight:600;max-width:440px;min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace))}
.dgp-branchSelArrow{display:inline-flex;align-items:center;color:var(--dsw-alias-label-secondary);flex:none;transition:transform .14s ease}
.dgp-branchSelArrow[data-open="true"]{transform:rotate(180deg);color:var(--dsw-alias-label-primary)}
.dgp-branchTab{position:relative;display:inline-flex;align-items:center;flex:none}
.dgp-branchPop{position:fixed;left:0;top:0;z-index:60;width:460px;max-width:90vw;background:color-mix(in srgb,var(--dsw-alias-bg-base) 96%,transparent);backdrop-filter:blur(18px) saturate(1.35);-webkit-backdrop-filter:blur(18px) saturate(1.35);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.1);display:flex;flex-direction:column;gap:6px;padding:8px;animation:dgp-scale .14s cubic-bezier(.2,.8,.2,1);will-change:transform}
.dgp-branchPopHead{font-size:calc(11px * var(--dgp-ui-scale,1));font-weight:600;color:var(--dsw-alias-label-secondary);line-height:calc(18px * var(--dgp-ui-scale,1))}
.dgp-branchSearch{box-sizing:border-box;width:100%;height:30px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:0 10px;color:var(--dsw-alias-label-primary);font:inherit;font-size:calc(12px * var(--dgp-ui-scale,1));outline:none}
.dgp-branchSearch:focus{border-color:var(--dsw-alias-state-business-primary)}
.dgp-branchSearch::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-primary) 45%,transparent)}
.dgp-branchList{display:flex;flex-direction:column;gap:1px;max-height:min(48vh,440px);overflow-y:auto}
.dgp-branchList .dgp-row[data-muted="true"] .dgp-rowPath{color:var(--dsw-alias-label-secondary)}
.dgp-branchActions{border-top:1px solid var(--dsw-alias-border-l1);padding-top:6px;display:flex;flex-direction:column;gap:6px}
.dgp-branchInput{display:flex;align-items:center;gap:8px;margin-top:2px}
.dgp-branchPopFoot{display:flex;justify-content:flex-end;border-top:1px solid var(--dsw-alias-border-l1);padding-top:6px}
.dgp-rowActions{display:inline-flex;gap:6px;align-items:center;flex:none}
.dgp-section{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:10px 12px}
.dgp-sectionHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.dgp-sectionTitle{font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(18px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-secondary);margin:0;font-weight:500;display:flex;align-items:center;gap:8px}
.dgp-link{background:0 0;border:none;cursor:pointer;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:calc(12px * var(--dgp-ui-scale,1));text-decoration:none;padding:0}
.dgp-link:hover{text-decoration:underline}
.dgp-linkMuted{color:var(--dsw-alias-label-secondary)}
/* Unified ghost action button for every in-page operation */
.dgp-lbtn{display:inline-flex;align-items:center;gap:4px;background:transparent;border:1px solid transparent;border-radius:7px;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(20px * var(--dgp-ui-scale,1));padding:1px 8px;cursor:pointer;white-space:nowrap;flex:none}
.dgp-lbtn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-lbtn[data-tone="default"]{color:var(--dsw-alias-label-secondary)}
.dgp-lbtn[data-tone="default"]:hover{color:var(--dsw-alias-label-primary)}
.dgp-lbtn[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dgp-lbtn[data-active="true"]{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 14%,transparent);color:var(--dsw-alias-state-business-primary)}
.dgp-lbtn[data-disabled="true"]{opacity:.45;cursor:default}
.dgp-lbtn[data-disabled="true"]:hover{background:transparent}
/* Icon-only ghost button: square-ish hit target. min-height pins it to the
   labelled variant's 24px so a mixed row shares ONE baseline (an SVG-only
   button would otherwise collapse to icon+padding ≈ 18-19px). */
.dgp-lbtn[data-icon-only="true"]{padding:1px 5px;min-height:24px}
.dgp-rows{display:flex;flex-direction:column;gap:1px}
.dgp-row{display:flex;align-items:center;gap:8px;padding:3px 6px;border-radius:6px;font-size:calc(13px * var(--dgp-ui-scale,1));line-height:calc(22px * var(--dgp-ui-scale,1))}
.dgp-row[data-clickable="true"]{cursor:pointer}
.dgp-row[data-clickable="true"]:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-row[data-selected="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-row[data-current="true"] .dgp-rowPath{font-weight:600}
.dgp-row[data-current="true"]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 6%,transparent)}
.dgp-rowPath{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace));font-size:calc(12px * var(--dgp-ui-scale,1))}
.dgp-rowMeta{color:var(--dsw-alias-label-secondary);font-size:calc(11px * var(--dgp-ui-scale,1));white-space:nowrap}
/* Each directory card contains only its scrolling file rows. */
.dgp-fileCard{background:transparent;padding:6px 4px 4px;display:flex;flex:1 1 0;min-height:0;flex-direction:column;gap:1px;overflow:hidden}
.dgp-fileRows{flex:1 1 0;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.dgp-windowRow>.dgp-row{height:100%;box-sizing:border-box}
.dgp-fileCard .dgp-row{padding:5px 8px;border-radius:8px}
.dgp-fileCard .dgp-rowTime{width:118px;flex:none;text-align:right;color:var(--dsw-alias-label-secondary);font-size:calc(11px * var(--dgp-ui-scale,1));white-space:nowrap;font-variant-numeric:tabular-nums}
.dgp-fileCard .dgp-rowMeta{width:56px;flex:none;text-align:right}
.dgp-row:hover .dgp-rowTime,.dgp-row:hover .dgp-rowMeta{color:var(--dsw-alias-label-primary)}
.dgp-fileActs{display:none;gap:6px;align-items:center;flex:none}
.dgp-row:hover .dgp-fileActs{display:inline-flex}
/* Row reference button: ALWAYS visible (the user's explicit requirement — not
   hover-gated like .dgp-fileActs) so one click points the agent at the entry.
   Muted at rest to keep a long listing calm, accent on hover. 18px box inside
   the row's 22px line box, so adding it never changes the row height. */
.dgp-refBtn{flex:none;width:18px;height:18px;padding:0;border:none;border-radius:5px;background:0 0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 58%,var(--dsw-alias-label-secondary))}
.dgp-refBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-business-primary)}
.dgp-row[data-ignored="true"] .dgp-refBtn{opacity:.84}
.dgp-fileActs .dgp-btn{padding:1px 6px;font-size:calc(11px * var(--dgp-ui-scale,1))}
.dgp-badge{font-size:calc(10px * var(--dgp-ui-scale,1));line-height:calc(16px * var(--dgp-ui-scale,1));padding:0 6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap}
.dgp-badge[data-tone="success"]{color:#fff;background:var(--dsw-alias-state-success-primary);border-color:transparent}
.dgp-badge[data-tone="info"]{color:#fff;background:var(--dsw-alias-button-info-fill);border-color:transparent}
.dgp-badge[data-tone="remote"]{color:var(--dsw-alias-label-secondary);background:transparent;border:1px dashed var(--dsw-alias-border-l2)}
.dgp-badge[data-tone="warn"]{color:#fff;background:var(--dsw-alias-state-warn-primary);border-color:transparent}
.dgp-badge[data-tone="error"]{color:#fff;background:var(--dsw-alias-state-error-primary);border-color:transparent}
.dgp-tree{display:flex;flex-direction:column;gap:1px;max-height:420px;overflow-y:auto}
.dgp-treeArrow{width:14px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:calc(11px * var(--dgp-ui-scale,1));flex:none;display:inline-flex;align-items:center;justify-content:center;transition:transform .12s ease}
.dgp-treeArrow[data-open="true"]{transform:rotate(90deg)}
.dgp-treeName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-pre{margin:0;font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace));font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(18px * var(--dgp-ui-scale,1));white-space:pre}
.dgp-preWrap{white-space:pre-wrap;word-break:break-all}
.dgp-diff{display:flex;flex-direction:column;flex:1;min-height:0;font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace));font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(19px * var(--dgp-ui-scale,1));background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:auto;contain:content}
/* Monaco diff host: fills the card; the editor manages its own scroll. */
.dgp-diffMonaco{overflow:hidden;contain:strict}
.dgp-diffLine{white-space:pre;padding:0}
.dgp-diffSpan{display:inline-block;min-width:100%;box-sizing:border-box;padding:0 10px}
.dgp-diffHunk{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,transparent);color:var(--dsw-alias-label-primary);font-weight:600}
.dgp-diffMeta{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1)}
/* Diff semantic colors are FIXED (user requirement): removed = red block,
   inserted / changed = blue block — same hues as the Monaco diff palette,
   independent of the editor theme. */
.dgp-diffAdd{background:color-mix(in srgb,var(--dsw-alias-button-info-fill) 16%,transparent);color:var(--dsw-alias-button-info-fill)}
.dgp-diffDel{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary)}
.dgp-diffWordAdd{background:color-mix(in srgb,var(--dsw-alias-button-info-fill) 34%,transparent);color:var(--dsw-alias-label-primary);font-weight:600}
.dgp-diffWordDel{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 30%,transparent);color:var(--dsw-alias-label-primary);font-weight:600}
.dgp-diffWordSame{color:var(--dsw-alias-label-primary)}
.dgp-textarea{width:100%;min-height:64px;resize:vertical;box-sizing:border-box;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;color:var(--dsw-alias-label-primary);font:inherit;font-size:calc(13px * var(--dgp-ui-scale,1));line-height:calc(20px * var(--dgp-ui-scale,1));outline:none}
.dgp-textarea:focus{border-color:var(--dsw-alias-state-business-primary)}
.dgp-textarea::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-primary) 45%,transparent)}
.dgp-error{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent);border:1px solid var(--dsw-alias-state-error-primary);border-radius:8px;padding:8px 10px;color:var(--dsw-alias-state-error-primary);font-size:calc(13px * var(--dgp-ui-scale,1));display:flex;align-items:center;gap:8px}
/* ── command output module (under the action bar, persistent per op) ── */
.dgp-op{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-base);padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.dgp-op[data-status="running"]{border-color:var(--dsw-alias-state-business-primary)}
.dgp-op[data-status="success"]{border-color:var(--dsw-alias-state-success-primary)}
.dgp-op[data-status="error"]{border-color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent)}
.dgp-opHead{display:flex;align-items:center;gap:8px;min-width:0}
.dgp-opIcon{display:inline-flex;flex:none}
.dgp-opIcon[data-status="running"]{color:var(--dsw-alias-state-business-primary);animation:dgp-spin 1s linear infinite}
.dgp-opIcon[data-status="success"]{color:var(--dsw-alias-state-success-primary)}
.dgp-opIcon[data-status="error"]{color:var(--dsw-alias-state-error-primary)}
.dgp-opTitle{font-size:calc(13px * var(--dgp-ui-scale,1));font-weight:600;line-height:calc(20px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-op[data-status="error"] .dgp-opTitle{color:var(--dsw-alias-state-error-primary)}
.dgp-opClose{border:none;background:0 0;cursor:pointer;color:var(--dsw-alias-label-secondary);width:24px;height:24px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0}
.dgp-opClose:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-progress{height:4px;border-radius:2px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;position:relative}
.dgp-progressBar{position:absolute;top:0;bottom:0;left:0;width:38%;border-radius:2px;background:var(--dsw-alias-state-business-primary);animation:dgp-indeterminate 1.2s cubic-bezier(.4,0,.6,1) infinite}
.dgp-opDetail{margin:0;font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace));font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(18px * var(--dgp-ui-scale,1));white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary);max-height:150px;overflow:auto}
.dgp-op[data-status="error"] .dgp-opDetail{color:var(--dsw-alias-state-error-primary)}
@keyframes dgp-spin{to{transform:rotate(360deg)}}
@keyframes dgp-indeterminate{0%{left:-38%}50%{left:62%}100%{left:100%}}
/* ── confirmation dialog (dangerous ops) ── */
.dgp-confirm{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);-webkit-backdrop-filter:var(--dsw-mask-blur);animation:dgp-fade .14s ease}
.dgp-confirmCard{box-sizing:border-box;width:400px;max-width:calc(100% - 24px);max-height:calc(100% - 24px);overflow:auto;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:16px;box-shadow:0 12px 32px color-mix(in srgb,var(--dsw-alias-label-primary) 14%,transparent);padding:18px 20px;display:flex;flex-direction:column;gap:10px;animation:dgp-scale .14s cubic-bezier(.2,.8,.2,1)}
.dgp-confirmTitle{font-size:calc(14px * var(--dgp-ui-scale,1));font-weight:600;line-height:calc(22px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:8px}
.dgp-confirmTitle[data-danger="true"]{color:var(--dsw-alias-state-error-primary)}
.dgp-confirmMsg{font-size:calc(13px * var(--dgp-ui-scale,1));line-height:calc(20px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-secondary);white-space:pre-wrap;word-break:break-word}
.dgp-confirmActions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}
/* ── Git tab vertical layout ──
   inline status + actions → op output → work area (changes + commit box; collapses to
   2:8 master-detail when a diff opens) → history (collapsed bar by default). */
.dgp-gitTop{display:flex;flex-direction:column;gap:10px;flex:none;min-height:0}
.dgp-gitState{display:flex;align-items:center;gap:6px;flex:none;flex-wrap:wrap;padding:4px 8px}
.dgp-gitState:empty{display:none}
.dgp-repoInfo{position:relative;display:inline-flex;align-items:center;flex:none}
.dgp-repoInfo>summary{list-style:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dgp-repoInfo>summary::-webkit-details-marker{display:none}
.dgp-repoInfo>summary:hover,.dgp-repoInfo[open]>summary{color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dgp-repoInfoPop{position:absolute;left:0;top:calc(100% + 6px);z-index:45;width:min(440px,calc(100vw - 32px));box-sizing:border-box;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 94%,transparent);box-shadow:0 8px 24px rgba(0,0,0,.16);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.dgp-repoInfoRow{display:grid;grid-template-columns:76px minmax(0,1fr);gap:10px;padding:6px 0;font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(18px * var(--dgp-ui-scale,1))}
.dgp-repoInfoRow+.dgp-repoInfoRow{border-top:1px solid var(--dsw-alias-border-l1)}
.dgp-repoInfoLabel{color:var(--dsw-alias-label-secondary)}
.dgp-repoInfoValue{min-width:0;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;user-select:text}
.dgp-gitWork{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:0}
.dgp-gitWork[data-diff="true"]{display:grid;grid-template-columns:minmax(260px,3fr) minmax(0,7fr)}
.dgp-gitCol{display:flex;flex-direction:column;gap:0;min-height:0;min-width:0;overflow:hidden}
.dgp-gitCard{display:flex;flex-direction:column;min-height:0;background:transparent;padding:0}
.dgp-gitCol .dgp-commitInline{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));flex:none;gap:6px;padding:8px;border-top:1px solid var(--dsw-alias-border-l1)}
.dgp-gitCol .dgp-commitInput{grid-column:1/-1;min-width:0;width:100%}
.dgp-gitCol .dgp-commitInline .dgp-btn{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;justify-content:center;padding-inline:6px}
.dgp-gitCol .dgp-op{margin:6px 8px;flex:none}
.dgp-changePanel{display:flex;flex-direction:column;min-width:0;min-height:0;gap:6px}
.dgp-changeHead{flex:none;min-height:29px;margin:0;padding:0 8px}
.dgp-changeScroll{background:color-mix(in srgb,var(--dsw-alias-bg-base) 97%,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:8px 10px}
.dgp-gitGrow{flex:1}
.dgp-gitScroll{flex:1;min-height:0;overflow-y:auto;contain:content}
.dgp-diffCard{min-height:0;min-width:0;align-self:stretch;background:transparent;border:0;border-radius:0;padding:0}
.dgp-histBar{flex:none;display:flex;align-items:center;gap:8px;width:100%;border:0;border-top:1px solid var(--dsw-alias-border-l1);background:transparent;cursor:pointer;padding:8px;font:inherit;color:var(--dsw-alias-label-primary);text-align:left}
.dgp-histBar:hover{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dgp-histBar>svg{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-histCard{flex:none;min-width:0;border-top:1px solid var(--dsw-alias-border-l1);padding:8px}
.dgp-histList{max-height:min(300px,38vh)}
.dgp-commitView{flex:1;min-height:0;display:flex;flex-direction:column;gap:0}
.dgp-commitHead{display:flex;align-items:center;gap:8px;flex:none;min-width:0}
.dgp-commitGrid{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,3fr) minmax(0,7fr);gap:0}
.dgp-commitFilesPane{border-right:1px solid var(--dsw-alias-border-l1)}
.dgp-commitSubject{padding:6px 8px;color:var(--dsw-alias-label-secondary);font-size:calc(12px * var(--dgp-ui-scale,1));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none}
.dgp-commitFilesPane{display:flex;flex-direction:column;min-width:0;min-height:0}
.dgp-commitFilesCard{flex:1;min-height:0}
/* History rows: two-line layout — main line (hash + refs + subject + menu),
   meta line (committer <email> · local time). Column so the meta line spans
   the full row width under the subject. */
/* Commit-detail file rows: simple flex row (badge + path inline). */
.dgp-logRow{display:flex;align-items:center;gap:8px}
/* History entries: two-line layout — main line (hash + refs + subject +
   menu), meta line (committer <email> · local time). OWN class: the
   commit-detail rows reuse .dgp-logRow, so the column layout must not
   leak into them (a stretched full-width badge). */
.dgp-histEntry{align-items:stretch;gap:10px;padding-top:0;padding-bottom:0}
.dgp-histBody{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;margin-block:5px}
/* git graph column: a stretched SVG tile per row (non-scaling stroke) plus
   an independent 14px square SVG node viewport with circle primitives. Lane
   colors are a FIXED palette via panel vars (theme-reactive, not editor-bound). */
.dgp-logGraph{position:relative;flex:none;align-self:stretch}
.dgp-logGraph svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.dgp-logGraph svg.dgp-graphNode{inset:auto;top:50%;width:14px;height:14px;transform:translate(-50%,-50%);pointer-events:none}
.dgp-root{--dsw-graph-c0:#2f6bed;--dsw-graph-c1:#1a7f37;--dsw-graph-c2:#9a6700;--dsw-graph-c3:#8250df;--dsw-graph-c4:#1b7c83;--dsw-graph-c5:#cf222e}
body[data-ds-dark-theme] .dgp-root{--dsw-graph-c0:#4c8dff;--dsw-graph-c1:#3fb950;--dsw-graph-c2:#d29922;--dsw-graph-c3:#bc8cff;--dsw-graph-c4:#39c5cf;--dsw-graph-c5:#ff7b72}
.dgp-logMain{display:flex;align-items:center;gap:8px;min-width:0}
.dgp-logSubject{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--dgp-font-ui,var(--dsw-font-family,sans-serif));font-size:calc(13px * var(--dgp-ui-scale,1));font-weight:500;color:var(--dsw-alias-label-primary)}
.dgp-logRefs{max-width:42%;display:inline-block;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}
.dgp-logMeta{display:flex;align-items:center;gap:8px;padding-left:1px;font-size:calc(11px * var(--dgp-ui-scale,1));line-height:calc(16px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden}
.dgp-logAuthor{flex:none;color:var(--dsw-alias-label-secondary);font-weight:500}
.dgp-logEmail{min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,SFMono-Regular,Consolas,monospace))}
.dgp-logDate{flex:none;margin-left:auto;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-variant-numeric:tabular-nums}
.dgp-dirRow{color:var(--dsw-alias-label-primary);font-weight:500}
.dgp-dirRow>svg{flex:none;color:color-mix(in srgb,var(--dsw-alias-label-primary) 76%,var(--dsw-alias-state-business-primary) 24%)}
/* Compact Codex-style change tree: slim disclosure rows, indent guides, and
   smaller action controls keep more room for deep file names. */
.dgp-treeRow{position:relative;padding-top:1px;padding-bottom:1px;line-height:calc(20px * var(--dgp-ui-scale,1));gap:4px}
.dgp-treeRow::before{content:"";position:absolute;z-index:0;left:22px;top:0;bottom:0;width:var(--tree-guide-width,0);background-image:repeating-linear-gradient(to right,color-mix(in srgb,var(--dsw-alias-border-l1) 72%,transparent) 0 1px,transparent 1px 8px);pointer-events:none}
.dgp-treeRow .dgp-rowPath{font-size:calc(11.5px * var(--dgp-ui-scale,1))}
.dgp-treeRow .dgp-rowActions{gap:3px}
.dgp-treeRow .dgp-rowActions .dgp-lbtn{padding:1px 5px;font-size:calc(11px * var(--dgp-ui-scale,1))}
/* Ignored entries keep their names subdued while retaining recognizable icon
   colors. This preserves row hierarchy without washing out file-type artwork. */
.dgp-row[data-ignored="true"] .dgp-treeName{color:var(--dsw-alias-label-secondary);opacity:.55}
.dgp-row[data-ignored="true"] .dgp-fileIcon{opacity:.88}
.dgp-logMenuBtn{border:none;background:0 0;cursor:pointer;color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent);width:22px;height:22px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0;font:inherit;font-size:calc(14px * var(--dgp-ui-scale,1));line-height:1}
.dgp-logMenuBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-logMenu{position:fixed;z-index:1300;min-width:224px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 96%,transparent);backdrop-filter:blur(18px) saturate(1.35);-webkit-backdrop-filter:blur(18px) saturate(1.35);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.14);padding:4px;display:flex;flex-direction:column;animation:dgp-logmenu-in .12s cubic-bezier(.2,.8,.2,1);will-change:transform}
/* Default anchor = the menu's LEFT edge, so it opens to the RIGHT of the
   click. Near the right viewport edge [data-flip] right-anchors it instead
   (opens leftward) rather than overflowing off-screen. */
@keyframes dgp-logmenu-in{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes dgp-logmenu-in-flip{from{transform:translateX(-100%) scale(.96);opacity:0}to{transform:translateX(-100%) scale(1);opacity:1}}
.dgp-logMenu[data-flip="true"]{transform:translateX(-100%);animation-name:dgp-logmenu-in-flip}
.dgp-logMenuItem{border:none;background:0 0;cursor:pointer;color:var(--dsw-alias-label-primary);font:inherit;font-size:calc(13px * var(--dgp-ui-scale,1));line-height:calc(20px * var(--dgp-ui-scale,1));padding:6px 10px;border-radius:7px;display:flex;align-items:center;gap:8px;text-align:left}
.dgp-logMenuItem:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-logMenuItem[data-danger="true"]{color:var(--dsw-alias-state-error-primary)}
.dgp-logMenuItem>svg{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-logMenuItem[data-danger="true"]>svg{color:var(--dsw-alias-state-error-primary)}
.dgp-muted{color:var(--dsw-alias-label-secondary)}
.dgp-empty{color:var(--dsw-alias-label-secondary);padding:8px 0}
.dgp-hint{font-size:calc(12px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-secondary)}
/* ── master-detail file browser (single list ⇄ 50/50 split ⇄ 1:9 preview) ── */
.dgp-crumbs{display:flex;align-items:center;gap:2px;flex-wrap:wrap;flex:none;padding:0 2px;font-size:calc(12px * var(--dgp-ui-scale,1))}
.dgp-crumb{border:none;background:0 0;cursor:pointer;color:var(--dsw-alias-label-secondary);font:inherit;font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(20px * var(--dgp-ui-scale,1));padding:2px 6px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.dgp-crumb:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-crumbActive{color:var(--dsw-alias-label-primary);font-weight:500}
/* External-file crumb segments: display-only, no hover / pointer affordance. */
.dgp-crumbStatic{cursor:default;user-select:auto}
.dgp-crumbStatic:hover{background:0 0;color:var(--dsw-alias-label-secondary)}
.dgp-searchToolbar{height:30px;display:flex;align-items:center;gap:8px;flex:none;min-width:0}
.dgp-searchRow{box-sizing:border-box;height:30px;display:flex;flex:1 1 auto;flex-wrap:nowrap;align-items:center;gap:4px;min-width:0;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:0 6px;position:relative}
.dgp-searchRow>.dgp-lbtn{font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(18px * var(--dgp-ui-scale,1));padding:1px 7px}
.dgp-searchRow:focus-within{border-color:var(--dsw-alias-state-business-primary)}
.dgp-toolbarActions{display:flex;align-items:center;gap:4px;flex:none}
.dgp-toolbarActionDivider{margin:0 3px}
.dgp-crumbsInline{flex:0 1 auto;min-width:0;max-width:min(36vw,380px);flex-wrap:nowrap;overflow:hidden;white-space:nowrap;padding:0;gap:1px}
.dgp-crumbsInline .dgp-crumb{flex:0 1 auto;min-width:0;max-width:180px;overflow:hidden;padding:2px 2px}
.dgp-crumbsInline .dgp-crumbRoot{flex:none;width:24px;justify-content:center;padding:2px 0}
.dgp-crumbsInline .dgp-crumb>svg{flex:none}
.dgp-crumbsInline .dgp-crumbLabel{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-crumbsInline .dgp-crumbSep{flex:none}
.dgp-crumbsInline .dgp-crumbEllipsis{flex:none;min-width:28px;justify-content:center;font-weight:600;letter-spacing:1px}
.dgp-toolbarDivider{height:18px;flex:none;border-left:1px solid var(--dsw-alias-border-l2);margin:0 2px}
.dgp-toolbarFolder{width:22px;height:22px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dgp-toolbarFolder:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-crumbMenu{position:fixed;z-index:61;min-width:180px;max-width:min(360px,88vw);max-height:min(42vh,360px);overflow:auto;background:color-mix(in srgb,var(--dsw-alias-bg-base) 97%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 0 1px rgba(0,0,0,.2),0 4px 16px rgba(0,0,0,.08);padding:6px;display:flex;flex-direction:column;gap:2px;animation:dgp-scale .12s cubic-bezier(.2,.8,.2,1)}
.dgp-crumbMenuItem{display:flex;align-items:center;gap:8px;width:100%;min-width:0;padding:6px 8px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:calc(12px * var(--dgp-ui-scale,1));text-align:left;cursor:pointer}
.dgp-crumbMenuItem:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-crumbMenuItem>svg{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-crumbMenuLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-searchIcon{display:inline-flex;flex:none;color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent)}
.dgp-search{border:none;background:0 0;outline:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:calc(12px * var(--dgp-ui-scale,1));line-height:calc(24px * var(--dgp-ui-scale,1));min-width:0;flex:1}
.dgp-search::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-primary) 45%,transparent)}
.dgp-searchHist{position:fixed;left:0;top:0;z-index:60;background:color-mix(in srgb,var(--dsw-alias-bg-base) 97%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 0 1px rgba(0,0,0,.2),0 4px 16px rgba(0,0,0,.08);padding:6px;display:flex;flex-direction:column;gap:2px;animation:dgp-scale .12s cubic-bezier(.2,.8,.2,1);will-change:transform}
.dgp-searchHistHead{display:flex;align-items:center;justify-content:space-between;font-size:calc(11px * var(--dgp-ui-scale,1));color:color-mix(in srgb,var(--dsw-alias-label-primary) 55%,transparent);padding:2px 6px 4px}
.dgp-searchHistItem{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:7px;cursor:pointer;font-size:calc(12px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary);min-width:0;border:none;background:0 0;font-family:inherit;text-align:left}
.dgp-searchHistItem:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-searchHistItem .dgp-treeName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace))}
.dgp-pvSwitch{display:inline-flex;gap:2px}
.dgp-crumbSep{color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent);display:inline-flex;align-items:center;flex:none;white-space:pre}
.dgp-split{display:grid;flex:1;min-height:0;gap:0;transition:grid-template-columns .22s cubic-bezier(.2,.8,.2,1)}
.dgp-split[data-dragging="true"]{transition:none;cursor:col-resize}
.dgp-gutter{width:100%;height:100%;cursor:col-resize;flex:none;position:relative;display:flex;align-items:center;justify-content:center;user-select:none;touch-action:none}
.dgp-gutter::before{content:"";width:1px;height:100%;background:var(--dsw-alias-border-l1);transition:background .15s}
.dgp-gutter:hover::before{background:var(--dsw-alias-border-l2)}
.dgp-gutter:active::before{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-pane{min-width:0;min-height:0;overflow:hidden;background:transparent;display:flex;flex-direction:column;gap:0;contain:content}
.dgp-pane[data-flat="true"]{border:0;border-radius:0;background:transparent;padding:0}
.dgp-paneTitle{font-size:calc(11px * var(--dgp-ui-scale,1));line-height:calc(16px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-secondary);padding:2px 6px 4px;font-weight:500;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-globalList{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.dgp-paneEmpty{color:var(--dsw-alias-label-secondary);font-size:calc(12px * var(--dgp-ui-scale,1));padding:10px 8px}
.dgp-fileIcon{display:inline-flex;align-items:center;justify-content:center;flex:none;color:color-mix(in srgb,var(--dsw-alias-label-primary) 68%,var(--dsw-alias-state-business-primary) 32%)}
.dgp-fileIcon--dir{border-radius:5px;color:color-mix(in srgb,var(--dsw-alias-label-primary) 68%,var(--dsw-alias-state-business-primary) 32%);transition:color .12s ease,background-color .12s ease}
.dgp-row[data-directory="true"][data-selected="true"]{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 8%,transparent)}
.dgp-row[data-directory="true"][data-selected="true"] .dgp-fileIcon--dir{color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 14%,transparent)}
.dgp-row[data-directory="true"]:hover .dgp-fileIcon--dir,.dgp-dirRow[data-open="true"] .dgp-fileIcon{color:var(--dsw-alias-state-business-primary)}
.dgp-dirRow[data-open="true"] .dgp-fileIcon{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,transparent);border-radius:5px}
.dgp-dirRow[data-open="true"]>svg{color:var(--dsw-alias-state-business-primary)}
/* File-type tiles come from the generated vscode-icons artwork (fileicons.js):
   full-color SVG bodies that size themselves from the size prop, so no
   wrapper CSS is needed here. Directories keep the Lucide outline folder above
   — the same "outline folder + colored file tile" split DSH's tree uses. */
.dgp-previewHead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:2px 14px 2px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dgp-previewName{font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace));font-size:calc(13px * var(--dgp-ui-scale,1));color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.dgp-previewBody{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:12px 14px;overscroll-behavior:contain;contain:content}
/* Markdown chunked-render progress: thin bar above the streaming content. */
.dgp-mdChunk{content-visibility:auto;contain-intrinsic-size:auto 600px}
.dgp-mdProg{height:3px;border-radius:2px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;margin:-4px 0 10px}
.dgp-mdProgBar{height:100%;background:var(--dsw-alias-state-business-primary);transition:width .15s ease}
/* Full-bleed frame previews (PDF viewer / sandboxed HTML): no padding,
   the iframe fills the pane. */
.dgp-previewBody.dgp-frameBody{padding:0;display:flex}
.dgp-frameBody iframe{flex:1;width:100%;min-height:0;border:none;background:#fff}
/* Centered image preview (blob URL <img>), contained within the pane. */
.dgp-mediaBody{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:visible}
.dgp-mediaBody img{max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,.18)}
/* Inline CodeMirror editing: the host must fill the preview pane so the
   editor's own scroller can scroll — previewBody becomes a column flex
   container, host is flex:1 (min-height:0) and the .cm-editor height:100%. */
.dgp-editBody{display:flex;flex-direction:column;padding:0;overflow:hidden}
.dgp-editorHost{flex:1;min-height:0;overflow:hidden;border-radius:0 0 10px 10px}
.dgp-editorHost .cm-editor{height:100%;font-size:calc(13px * var(--dgp-ui-scale,1))}
.dgp-editorHost .cm-scroller{font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,SFMono-Regular,Consolas,monospace));line-height:1.6}
.dgp-editorHost .cm-editor.cm-focused{outline:none}
.dgp-editorHost .cm-gutters{border-right:1px solid var(--dsw-alias-border-l1)}
.dgp-previewBody .dgp-pre{margin:0;white-space:pre-wrap;word-break:break-all}
/* syntax-highlight tokens (GitHub-flavored light, DSH-dark aware) */
.dgp-tk-c{color:#8b949e;font-style:italic}
.dgp-tk-s{color:#0a7d33}
.dgp-tk-n{color:#b35900}
.dgp-tk-k{color:#8250df;font-weight:500}
.dgp-tk-t{color:#0550ae}
body[data-ds-dark-theme] .dgp-tk-s{color:#7ee2a8}
body[data-ds-dark-theme] .dgp-tk-n{color:#e5a563}
body[data-ds-dark-theme] .dgp-tk-k{color:#d2a8ff}
body[data-ds-dark-theme] .dgp-tk-t{color:#79c0ff}
/* markdown rendering */
.dgp-md{font-size:calc(13px * var(--dgp-ui-scale,1));line-height:1.7;color:var(--dsw-alias-label-primary);overflow-wrap:break-word}
.dgp-previewCut{color:color-mix(in srgb,var(--dsw-alias-label-primary) 55%,transparent);font-size:calc(12px * var(--dgp-ui-scale,1));margin:10px 0 0;padding-top:8px;border-top:1px dashed var(--dsw-alias-border-l2)}
.dgp-md h1{font-size:calc(20px * var(--dgp-ui-scale,1));font-weight:600;margin:2px 0 12px}
.dgp-md h2{font-size:calc(17px * var(--dgp-ui-scale,1));font-weight:600;margin:18px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dgp-md h3{font-size:calc(15px * var(--dgp-ui-scale,1));font-weight:600;margin:14px 0 6px}
.dgp-md h4,.dgp-md h5,.dgp-md h6{font-size:calc(13px * var(--dgp-ui-scale,1));font-weight:600;margin:12px 0 6px}
.dgp-md p{margin:0 0 10px}
.dgp-md ul,.dgp-md ol{margin:0 0 10px;padding-left:22px}
.dgp-md li{margin:2px 0}
.dgp-md code{font-family:var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace));font-size:calc(12px * var(--dgp-ui-scale,1));background:var(--dsw-alias-bg-layer-2);border-radius:4px;padding:1px 5px}
.dgp-md pre{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px 12px;overflow-x:auto;overflow-y:hidden;margin:0 0 12px}
.dgp-md pre code{background:0 0;padding:0;font-size:calc(12px * var(--dgp-ui-scale,1));line-height:1.6}
.dgp-md a{color:var(--dsw-alias-state-business-primary);text-decoration:none}
.dgp-md a:hover{text-decoration:underline}
.dgp-md blockquote{margin:0 0 12px;padding:4px 12px;border-left:3px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-radius:0 8px 8px 0}
.dgp-md hr{border:none;border-top:1px solid var(--dsw-alias-border-l1);margin:14px 0}
.dgp-md table{border-collapse:collapse;margin:0 0 12px;font-size:calc(12px * var(--dgp-ui-scale,1));width:100%}
.dgp-md th,.dgp-md td{border:1px solid var(--dsw-alias-border-l2);padding:5px 10px;text-align:left}
.dgp-md th{background:var(--dsw-alias-bg-layer-1);font-weight:500}
.dgp-md img{max-width:100%}
/* ── upload / export status row + multi-select bar + row checkbox ── */
.dgp-noteRow{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 8%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-state-business-primary) 45%,transparent);border-radius:8px;padding:6px 10px;color:var(--dsw-alias-label-primary);font-size:calc(13px * var(--dgp-ui-scale,1));display:flex;align-items:center;gap:8px}
.dgp-multiBar{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0;min-height:44px;flex:none;padding:6px 12px;background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1)}
.dgp-multiSelection{display:flex;align-items:center;gap:8px;min-width:0}
.dgp-multiCount{display:inline-flex;align-items:center;min-height:0;padding:0;border-radius:0;background:none;color:var(--dsw-alias-label-secondary);font-size:calc(12px * var(--dgp-ui-scale,1));font-weight:500;white-space:nowrap;font-variant-numeric:tabular-nums}
.dgp-multiSelection>.dgp-lbtn{box-sizing:border-box;height:28px;min-height:28px;padding:2px 6px;gap:5px;border-radius:6px}
.dgp-multiBarActions{display:flex;align-items:center;gap:4px;flex:none;margin-left:auto}
.dgp-multiBarActions>.dgp-lbtn{min-height:30px;padding:4px 9px;border-radius:7px}
.dgp-multiBarActions>.dgp-lbtn:first-child:not([data-disabled="true"]){background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,transparent);color:var(--dsw-alias-state-business-primary)}
.dgp-multiBarActions>.dgp-lbtn:first-child:not([data-disabled="true"]):hover{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 16%,transparent)}
.dgp-multiDivider{width:1px;height:18px;margin-inline:4px;flex:none;background:var(--dsw-alias-border-l1)}
.dgp-rowCheck{width:16px;height:16px;flex:none;border:1px solid var(--dsw-alias-border-l2);border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:calc(11px * var(--dgp-ui-scale,1));line-height:1;color:#fff;cursor:pointer;user-select:none;background:var(--dsw-alias-bg-base)}
.dgp-rowCheck[data-checked="true"]{background:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary)}
.dgp-rowCheck:hover{border-color:var(--dsw-alias-state-business-primary)}
/* ── narrow viewport (mobile): full-screen sheet + single-column drill-down ─
   The layout branch key is .dgp-root[data-narrow], driven by narrowStore's
   matchMedia ((max-width:720px) or (no hover and ≤1024px)) — CSS and the
   render logic share ONE source of truth; no duplicate media queries here. */
.dgp-root[data-narrow="true"] .dgp-mask{background:transparent}
.dgp-root[data-narrow="true"] .dgp-dialog{width:100%;max-width:100%;height:100vh;height:100dvh;max-height:100vh;max-height:100dvh;border:none;border-radius:0;animation:dgp-sheet-in .22s cubic-bezier(.2,.8,.2,1)}
/* Frosted glass stays on mobile at a LIGHT radius: blur(8px) — the user's
   performance call (2026-09-09, "低于10的blur"): the tint comes from the
   dialog's own 86% color-mix background (base rule), the blur only softens
   what bleeds through, so 8px keeps the glass language at minimal GPU cost.
   ::before carries only the blur (Chrome needs a dedicated backdrop root). */
.dgp-root[data-narrow="true"] .dgp-dialog::before{backdrop-filter:blur(8px) saturate(1.3);-webkit-backdrop-filter:blur(8px) saturate(1.3)}
.dgp-root[data-narrow="true"] .dgp-header{gap:6px;padding:calc(6px + env(safe-area-inset-top,0px)) 10px 6px}
.dgp-root[data-narrow="true"] .dgp-tabs{padding:0 8px}
.dgp-root[data-narrow="true"] .dgp-tabsInline{flex:1;padding:0}
.dgp-root[data-narrow="true"] .dgp-searchToolbar{gap:4px}
.dgp-root[data-narrow="true"] .dgp-searchRow{gap:4px;padding:0 6px}
.dgp-root[data-narrow="true"] .dgp-toolbarActions{gap:2px}
.dgp-root[data-narrow="true"] .dgp-toolbarActionDivider{display:none}
.dgp-root[data-narrow="true"] .dgp-crumbsInline{max-width:24vw}
.dgp-root[data-narrow="true"] .dgp-body{padding:8px 10px calc(12px + env(safe-area-inset-bottom,0px))}
.dgp-root[data-narrow="true"] .dgp-body[data-tab="files"],.dgp-root[data-narrow="true"] .dgp-body[data-tab="git"]{padding:0 0 env(safe-area-inset-bottom,0px)}
.dgp-root[data-narrow="true"] .dgp-multiBar{align-items:flex-start;flex-wrap:wrap;gap:4px 8px;padding:6px 10px}
.dgp-root[data-narrow="true"] .dgp-multiSelection{width:100%;justify-content:space-between}
.dgp-root[data-narrow="true"] .dgp-multiBarActions{width:100%;flex-wrap:wrap;justify-content:flex-end}
.dgp-root[data-narrow="true"] .dgp-tabSplit .dgp-tabMain span{max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Every split/grid collapses to one pane (the render also drops the gutter). */
.dgp-root[data-narrow="true"] .dgp-split{grid-template-columns:1fr !important;transition:none}
.dgp-root[data-narrow="true"] .dgp-gitWork[data-diff="true"]{grid-template-columns:1fr}
.dgp-root[data-narrow="true"] .dgp-commitGrid{grid-template-columns:1fr;gap:0}
/* Anchor-positioned popups overflow a phone width — pin them full-width.
   !important is required to beat their inline left/top positioning. */
.dgp-root[data-narrow="true"] .dgp-branchPop{left:8px !important;right:8px;width:auto;max-width:none}
.dgp-root[data-narrow="true"] .dgp-repoInfoPop{left:auto;right:0;max-width:calc(100vw - 32px)}
.dgp-root[data-narrow="true"] .dgp-logMenu{left:8px !important;right:8px;min-width:0;transform:none;animation:dgp-fade .12s ease}
/* System-explorer affordances are meaningless on a phone. */
.dgp-root[data-narrow="true"] .dgp-toolbarFolder{display:none}
/* Font sizes stay independent: UI scales its hierarchy; preview text owns its
   own size even when DSH/browser styles set sizes on pre/code elements. */
.dgp-root{font-size:var(--dgp-ui-size,13px)}
.dgp-fileCard .dgp-row{height:max(32px,calc(32px * var(--dgp-ui-scale,1)));box-sizing:border-box}
.dgp-changeScroll .dgp-row{height:max(30px,calc(30px * var(--dgp-ui-scale,1)));box-sizing:border-box}
.dgp-previewBody pre.dgp-pre,.dgp-previewBody pre.dgp-pre code,.dgp-fontSample{font-size:var(--dgp-preview-size,12px);line-height:1.65}
.dgp-fontSample{margin:4px 0 12px;padding:10px 12px;white-space:pre-wrap;overflow-wrap:anywhere;font-family:var(--dgp-font-mono,monospace);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border-radius:8px}
.dgp-previewBody .dgp-md{font-size:var(--dgp-preview-size,12px);line-height:1.7}
.dgp-previewBody .dgp-md h1{font-size:1.54em}
.dgp-previewBody .dgp-md h2{font-size:1.31em}
.dgp-previewBody .dgp-md h3{font-size:1.15em}
.dgp-previewBody .dgp-md h4,.dgp-previewBody .dgp-md h5,.dgp-previewBody .dgp-md h6{font-size:1em}
.dgp-previewBody .dgp-md code,.dgp-previewBody .dgp-md pre code,.dgp-previewBody .dgp-md table{font-size:1em}
.dgp-previewBody .dgp-md pre{font-size:inherit}
.dgp-diff{font-size:var(--dgp-preview-size,12px);line-height:1.65}
/* Narrow width: the 修改时间 column + its header drop out (size stays). */
.dgp-root[data-narrow="true"] .dgp-rowTime{display:none}
/* Single-bar header on a phone: let the workspace title shrink and keep the
   inline tabs swipeable. */
.dgp-root[data-narrow="true"] .dgp-titleWrap{max-width:140px}
/* One local toolbar per pane. Search and edit replace controls in this row. */
.dgp-localToolbar{box-sizing:border-box;min-height:max(36px,calc(30px * var(--dgp-ui-scale,1)));display:flex;align-items:center;flex:none;flex-wrap:nowrap;gap:6px;padding:3px 8px;margin:0;border-bottom:1px solid var(--dsw-alias-border-l1);min-width:0}
.dgp-localToolbar>.dgp-sectionTitle{flex:1;min-width:0;display:flex;align-items:center;gap:4px;overflow:hidden;white-space:nowrap}
.dgp-toolbarTitle{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-localToolbar .dgp-lbtn,.dgp-localToolbar svg{flex:none}
.dgp-directoryToolbar .dgp-crumbsInline{flex:1;max-width:none}
.dgp-directoryToolbar .dgp-searchRow{border:0;background:var(--dsw-alias-bg-layer-1);height:max(28px,calc(26px * var(--dgp-ui-scale,1)));flex:1}
.dgp-directoryToolbar .dgp-searchRow:focus-within{box-shadow:inset 0 0 0 1px var(--dsw-alias-state-business-primary)}
.dgp-directoryLabel{display:flex;align-items:center;gap:6px;flex:1;min-width:0;font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;text-align:left}
.dgp-directoryLabel span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-previewName{flex:1}
.dgp-previewPane{container-type:inline-size}
.dgp-modeWide{flex:none}
.dgp-toolbarMenuBtn{box-sizing:border-box;width:28px;height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center;flex:none;border:0;border-radius:5px;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dgp-toolbarMenuBtn:hover,.dgp-toolbarMenuBtn[aria-expanded="true"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-toolbarMenuBtn:focus-visible,.dgp-directoryLabel:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}
.dgp-toolbarMenu{position:fixed;z-index:1220;box-sizing:border-box;overflow:auto;padding:4px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;box-shadow:0 8px 24px color-mix(in srgb,var(--dsw-alias-label-primary) 14%,transparent);color:var(--dsw-alias-label-primary);font:inherit;font-family:var(--dgp-font-ui,var(--dsw-font-family,sans-serif))}
.dgp-toolbarMenu .dgp-logMenuItem{width:100%;box-sizing:border-box;min-height:28px;display:grid;grid-template-columns:14px minmax(0,1fr) 12px;gap:6px;white-space:normal}
.dgp-menuIcon,.dgp-menuCheck{display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary)}
.dgp-logMenuItem[data-danger="true"] .dgp-menuIcon{color:var(--dsw-alias-state-error-primary)}
.dgp-toolbarMenu .dgp-logMenuItem:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}
.dgp-toolbarMenu .dgp-logMenuItem:disabled{opacity:.45;cursor:default}
.dgp-toolbarMenuInfo{font-size:calc(11px * var(--dgp-ui-scale,1));line-height:1.5;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;padding:4px 6px 6px;margin-bottom:2px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dgp-toolbarMenu .dgp-menuLabel{flex:1;min-width:0;text-align:left}
.dgp-toolbarMenuBtn.dgp-modeCompact{display:none}
.dgp-diff{border:0;border-radius:0}
.dgp-changeScroll{border:0;border-radius:0;padding:4px 8px}
.dgp-changeHead>.dgp-sectionTitle{font-size:calc(12px * var(--dgp-ui-scale,1))}
@container(max-width:650px){.dgp-previewSize{display:none}}
@container(max-width:520px){.dgp-modeWide{display:none}.dgp-toolbarMenuBtn.dgp-modeCompact{display:inline-flex}}
@container(max-width:400px){.dgp-previewCopy{display:none}}
.dgp-root[data-narrow="true"] .dgp-commitFilesPane{border-right:0}
/* Confirmed single-header design: page state owns its portaled context/actions. */
.dgp-singleHeader{container-type:inline-size;container-name:dgp-header;box-sizing:border-box;min-height:max(44px,calc(36px * var(--dgp-ui-scale,1)));padding:4px 12px;gap:12px}
.dgp-singleHeader[data-page="files"]{gap:4px}
.dgp-singleHeader .dgp-titleWrap{max-width:200px}
.dgp-workspaceTab{box-sizing:border-box;font:inherit;background:none;border:0;border-bottom:2px solid transparent;padding:4px 0;cursor:pointer;color:var(--dsw-alias-label-primary)}
.dgp-workspaceTab[data-active="true"]{border-bottom-color:var(--dsw-alias-state-business-primary)}
.dgp-workspaceTab:hover .dgp-title{color:var(--dsw-alias-state-business-primary)}
.dgp-workspaceTab:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px;border-radius:4px}
.dgp-navigationMenu{max-width:110px;min-width:0}
.dgp-navigationMenu>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-singleHeader .dgp-tabsInline{flex:none;overflow:visible}
.dgp-singleHeader .dgp-tab{padding:4px 8px;line-height:calc(20px * var(--dgp-ui-scale,1))}
.dgp-singleHeader .dgp-pageNavGit{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;min-height:max(28px,calc(26px * var(--dgp-ui-scale,1)));padding:4px 8px;margin:0;border:0;border-bottom:2px solid transparent;border-radius:0;background:none;color:var(--dsw-alias-label-secondary);font-weight:500}
.dgp-singleHeader .dgp-pageNavGit:hover{background:none;color:var(--dsw-alias-state-business-primary)}
.dgp-singleHeader .dgp-pageNavGit[data-active="true"]{border-bottom-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary)}
.dgp-singleHeader .dgp-pageNavGit:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px;border-radius:4px}
.dgp-singleHeader .dgp-pageNavGit>svg{flex:none}
.dgp-headerHost{display:flex;align-items:center;flex:1;min-width:0;align-self:stretch}
.dgp-pageToolbar{display:flex;align-items:center;gap:8px;flex:1;min-width:0;width:100%;font-size:calc(12px * var(--dgp-ui-scale,1))}
.dgp-pageActions,.dgp-directoryActions{display:flex;align-items:center;gap:4px;flex:none}
.dgp-pageActions{margin-left:auto;gap:8px}
.dgp-fileContext,.dgp-gitContext,.dgp-directoryContext{display:flex;align-items:center;gap:6px;flex:0 1 auto;min-width:0;overflow:hidden}
.dgp-fileContext .dgp-directoryContext{max-width:100%}
.dgp-contextPath{display:flex;align-items:center;gap:2px;flex:0 1 auto;min-width:0;overflow:hidden}
.dgp-contextPath>.dgp-crumbSep{flex:none}
.dgp-contextPath .dgp-crumbsInline{flex:0 1 auto;max-width:none}
.dgp-contextPath[data-preview="true"] .dgp-crumbsInline{max-width:55%}
.dgp-contextActions{display:flex;align-items:center;gap:4px;flex:none;min-width:0}
.dgp-directoryContext[data-search="true"]>.dgp-contextActions{flex:none;min-width:0}
.dgp-fileSearchSlot{display:flex;align-items:center;min-width:0;flex:none}
.dgp-fileSearchSlot[data-open="true"]{flex:0 1 420px;max-width:420px}
.dgp-directoryToolbar>.dgp-fileSearchSlot{margin-left:auto}
.dgp-pageToolbar>.dgp-tab{flex:none}
.dgp-settingsToolbar>.dgp-toolbarTitle,.dgp-historyToolbar>.dgp-toolbarTitle{flex:0 1 auto}
.dgp-historyContext{display:flex;align-items:center;gap:4px;flex:0 1 auto;min-width:0;max-width:min(48vw,560px)}
.dgp-historyHash{flex:none;font-family:var(--dgp-font-mono,var(--dsw-font-mono,monospace));color:var(--dsw-alias-label-secondary)}
.dgp-historyContext>.dgp-crumbSep{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-historyContext>.dgp-lbtn{padding-inline:4px}
.dgp-pageActions .dgp-pvSwitch{padding:1px;border-radius:7px;background:var(--dsw-alias-bg-layer-1)}
.dgp-fileContext .dgp-previewName{min-width:24px}
.dgp-directoryToolbar .dgp-crumbsInline{max-width:none}
.dgp-pageToolbar .dgp-searchRow{flex:0 1 420px;min-width:0;max-width:420px;height:max(28px,calc(26px * var(--dgp-ui-scale,1)));border:0;background:var(--dsw-alias-bg-layer-1)}
.dgp-pageToolbar .dgp-searchRow:focus-within{box-shadow:inset 0 0 0 1px var(--dsw-alias-state-business-primary)}
.dgp-singleHeader .dgp-headerActions{margin-left:0;gap:2px;border-left:1px solid var(--dsw-alias-border-l1);padding-left:8px}
.dgp-singleHeader .dgp-settingsActive{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-business-primary)}
.dgp-singleHeader .dgp-headerActions .dgp-btn,.dgp-singleHeader .dgp-toolbarMenuBtn{height:max(28px,calc(24px * var(--dgp-ui-scale,1)))}
.dgp-toolbarMenuText{width:auto;gap:4px;padding:0 6px;font:inherit}
.dgp-branchSelect{display:flex;align-items:center;gap:6px;min-width:0;max-width:100%;border:0;border-radius:5px;padding:4px;background:none;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}
.dgp-branchSelect:hover,.dgp-branchSelect[data-open="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-branchSelect:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}
.dgp-branchSelect svg{flex:none}
.dgp-gitContext .dgp-branchTab{flex:0 1 auto;min-width:0;overflow:hidden}
.dgp-changeCount{flex:none;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.dgp-contentHead{box-sizing:border-box;display:flex;align-items:center;gap:6px;min-height:max(32px,calc(26px * var(--dgp-ui-scale,1)));margin:0;padding:4px 8px;flex:none;min-width:0}
.dgp-contentHead>.dgp-sectionTitle{flex:1;min-width:0;overflow:hidden;white-space:nowrap;gap:4px}
.dgp-contentHead .dgp-lbtn,.dgp-contentHead .dgp-chip{flex:none}
.dgp-changePanel>.dgp-empty,.dgp-gitCol>.dgp-empty,.dgp-commitFilesCard .dgp-empty{padding:8px}
.dgp-commitFilesCard .dgp-logRow{margin-inline:4px;padding-inline:4px}
.dgp-changePanel{gap:0}
.dgp-listPane{container-type:inline-size}
.dgp-gitWork,.dgp-gitWork[data-diff="true"]{display:grid;grid-template-columns:minmax(240px,.3fr) 8px minmax(0,.7fr);gap:0}
.dgp-gitCol{height:100%}
.dgp-diffEmpty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;min-width:0;min-height:0;color:var(--dsw-alias-label-secondary);font-size:calc(13px * var(--dgp-ui-scale,1))}
.dgp-gitCol .dgp-histCard{flex:0 1 auto;max-height:40%;overflow:hidden}
.dgp-gitCol .dgp-histList{min-height:0;max-height:none}
.dgp-gitCol .dgp-commitInline{margin-top:auto}
.dgp-root[data-narrow="true"] .dgp-singleHeader{padding:calc(4px + env(safe-area-inset-top,0px)) 8px 4px;gap:4px}
.dgp-root[data-narrow="true"] .dgp-singleHeader .dgp-titleWrap,.dgp-root[data-narrow="true"] .dgp-singleHeader .dgp-tabsInline{display:none}
.dgp-root[data-narrow="true"] .dgp-singleHeader .dgp-headerActions .dgp-btn{display:none}
.dgp-root[data-narrow="true"] .dgp-singleHeader .dgp-headerActions{border:0;padding:0}
.dgp-root[data-narrow="true"] .dgp-singleHeader:has([data-editing="true"]) .dgp-headerActions{display:none}
.dgp-root[data-narrow="true"] .dgp-directoryContext[data-search="true"]>.dgp-contextPath{display:none}
.dgp-root[data-narrow="true"] .dgp-historyContext{flex:1;max-width:none}
.dgp-root[data-narrow="true"] .dgp-fileToolbar .dgp-directoryActions,.dgp-root[data-narrow="true"] .dgp-fileToolbar .dgp-previewCopy,.dgp-root[data-narrow="true"] .dgp-fileToolbar .dgp-pvSwitch,.dgp-root[data-narrow="true"] .dgp-fileToolbar .dgp-modeCompact,.dgp-root[data-narrow="true"] .dgp-fileToolbar .dgp-previewClose{display:none}
.dgp-root[data-narrow="true"] .dgp-gitContext .dgp-chip,.dgp-root[data-narrow="true"] .dgp-changeCount{display:none}
.dgp-root[data-narrow="true"] .dgp-gitWork{grid-template-columns:1fr}
@container dgp-header (max-width:1100px){.dgp-singleHeader .dgp-titleWrap{max-width:140px}.dgp-pageToolbar .dgp-previewCopy,.dgp-pageToolbar .dgp-modeWide,.dgp-gitContext .dgp-chip,.dgp-changeCount{display:none}.dgp-pageToolbar .dgp-modeCompact{display:inline-flex}}
@container dgp-header (max-width:850px){.dgp-singleHeader .dgp-titleWrap{max-width:24px}.dgp-singleHeader .dgp-title{display:none}}
@container(max-width:460px){.dgp-listPane .dgp-rowTime{display:none}}
@keyframes dgp-sheet-in{from{transform:translateY(28px);opacity:0}to{transform:none;opacity:1}}
`;
			document.head.appendChild(style);
		}
		//#endregion

		//#region icons
		// ── Lucide UI icons (lucide-static v0.552.0, ISC license) ────────────────
		// All icons are 24×24 stroke SVGs rendered with currentColor — color and
		// opacity keep coming from the existing CSS rules, only the glyph shapes
		// changed. Exported names are unchanged from the previous DSH inline set.
		const svg = (...kids) => ({ size = 16, className, style }) =>
			h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", xmlns: "http://www.w3.org/2000/svg", className, style, "aria-hidden": "true" }, ...kids);
		const lp = (d) => h("path", { d });
		const IconFolderOpen = svg(lp("m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"));
		const IconFolderClose = svg(lp("M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"), lp("M2 10h20"));
		const IconBranch = svg(h("line", { x1: "6", x2: "6", y1: "3", y2: "15" }), h("circle", { cx: "18", cy: "6", r: "3" }), h("circle", { cx: "6", cy: "18", r: "3" }), lp("M18 9a9 9 0 0 1-9 9"));
		const IconBranchOp = IconBranch;
		const IconClose = svg(lp("M18 6 6 18"), lp("m6 6 12 12"));
		const IconRefresh = svg(lp("M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"), lp("M21 3v5h-5"), lp("M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"), lp("M8 16H3v5"));
		const IconChevronRight = svg(lp("m9 18 6-6-6-6"));
		const IconChevronDown = svg(lp("m6 9 6 6 6-6"));
		const IconChevronUp = svg(lp("m18 15-6-6-6 6"));
		const IconChevronLeft = svg(lp("m15 18-6-6 6-6"));
		const IconCheck = svg(lp("M20 6 9 17l-5-5"));
		const IconCheckOk = IconCheck;
		const IconListChecks = svg(lp("M13 5h8"), lp("M13 12h8"), lp("M13 19h8"), lp("m3 5 2 2 4-4"), lp("m3 12 2 2 4-4"), lp("m3 19 2 2 4-4"));
		const IconCopy = svg(h("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }), lp("M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"));
		const IconCode = svg(lp("m16 18 6-6-6-6"), lp("m8 6-6 6 6 6"));
		const IconData = svg(h("ellipse", { cx: "12", cy: "5", rx: "9", ry: "3" }), lp("M3 5V19A9 3 0 0 0 21 19V5"), lp("M3 12A9 3 0 0 0 21 12"));
		const IconListPen = svg(lp("m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351"), lp("M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"), lp("M8 18h1"));
		const IconPaperclip = svg(lp("m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"));
		const IconGlobe = svg(h("circle", { cx: "12", cy: "12", r: "10" }), lp("M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"), lp("M2 12h20"));
		const IconSearch = svg(lp("m21 21-4.34-4.34"), h("circle", { cx: "11", cy: "11", r: "8" }));
		const IconMaximize = svg(lp("M8 3H5a2 2 0 0 0-2 2v3"), lp("M21 8V5a2 2 0 0 0-2-2h-3"), lp("M3 16v3a2 2 0 0 0 2 2h3"), lp("M16 21h3a2 2 0 0 0 2-2v-3"));
		const IconSend = svg(lp("m5 12 7-7 7 7"), lp("M12 19V5"));
		// Warning triangle (lucide "triangle-alert"): danger confirmations and hard
		// reset keep the warning-triangle semantics (circle-alert read too soft).
		const IconWarning = svg(lp("m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-3"), lp("M12 9v4"), lp("M12 17h.01"));
		const IconLoading = svg(lp("M21 12a9 9 0 1 1-6.219-8.56"));
		const IconPlus = svg(lp("M5 12h14"), lp("M12 5v14"));
		const IconEdit = svg(lp("M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"), lp("M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"));
		const IconDownload = svg(lp("M12 15V3"), lp("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), lp("m7 10 5 5 5-5"));
		const IconSettings = svg(lp("M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"), h("circle", { cx: "12", cy: "12", r: "3" }));
		const IconEllipsis = svg(h("circle", { cx: "12", cy: "12", r: "1" }), h("circle", { cx: "19", cy: "12", r: "1" }), h("circle", { cx: "5", cy: "12", r: "1" }));
		const IconArrowLeft = svg(lp("m12 19-7-7 7-7"), lp("M19 12H5"));
		const IconArrowDown = svg(lp("M12 5v14"), lp("m19 12-7 7-7-7"));
		const IconEye = svg(lp("M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"), h("circle", { cx: "12", cy: "12", r: "3" }));
		const IconInfo = svg(h("circle", { cx: "12", cy: "12", r: "10" }), lp("M12 16v-4"), lp("M12 8h.01"));
		const IconExternalLink = svg(lp("M15 3h6v6"), lp("M10 14 21 3"), lp("M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"));
		const IconSave = svg(lp("M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"), lp("M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"), lp("M7 3v4a1 1 0 0 0 1 1h7"));
		const IconAtSign = svg(h("circle", { cx: "12", cy: "12", r: "4" }), lp("M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"));
		const IconTrash = svg(lp("M10 11v6"), lp("M14 11v6"), lp("M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"), lp("M3 6h18"), lp("M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"));
		const IconRightUp = svg(lp("M7 7h10v10"), lp("M7 17 17 7"));
		//#endregion

		//#region fileicons
		// ── file-type icons (GENERATED — do not edit by hand) ────────────────────
		// Source: @iconify-json/vscode-icons (the VS Code "vscode-icons" artwork,
		// MIT). Regenerate with: node scripts/gen-file-icons.mjs
		// Each entry is an inline SVG body plus its intrinsic viewBox, so the icons
		// need no network and no runtime dependency — the plugin stays a single
		// self-contained bundle. Bodies that define ids carry the __DGPICON__ token
		// instead: fileIconFor swaps it for a per-instance id (see the generator).
		const FILE_ICON_ART = {
		"default-file": { w: 32, h: 32, body: "<path fill=\"#c5c5c5\" d=\"M20.414 2H5v28h22V8.586ZM7 28V4h12v6h6v18Z\"/>" },
		"file-type-audio": { w: 32, h: 32, body: "<path fill=\"#00007f\" d=\"M17.229 4a.9.9 0 0 0-.569.232l-7.6 6.32a1.16 1.16 0 0 1-.955.328H3.208A1.2 1.2 0 0 0 2 12.088v7.826a1.2 1.2 0 0 0 1.208 1.206H8.1a1.16 1.16 0 0 1 .955.328l7.6 6.32c.521.433 1.081.224 1.081-.289V4.522A.494.494 0 0 0 17.229 4M27 6.3l-1.791 1.793a14.71 14.71 0 0 1 0 15.844l1.785 1.776A17.19 17.19 0 0 0 27 6.3m-4.333 4.323L20.905 12.4a6.035 6.035 0 0 1 0 7.237l1.756 1.756a8.554 8.554 0 0 0 .01-10.769Z\"/>" },
		"file-type-c": { w: 32, h: 32, body: "<path fill=\"#005f91\" d=\"M10.676 15.973a10.05 10.05 0 0 0 1.175 5.151a5.446 5.446 0 0 0 6.306 2.408a4.28 4.28 0 0 0 3.09-3.6l.109-.61c1.737.251 4.537.658 6.274.906l-.11.44a11.26 11.26 0 0 1-2.7 5.39a9.44 9.44 0 0 1-5.366 2.688a14.6 14.6 0 0 1-8.277-.819a10.15 10.15 0 0 1-5.777-6.24a16.23 16.23 0 0 1 .019-11.45a10.54 10.54 0 0 1 8.963-7.054a13.35 13.35 0 0 1 6.666.555a9.57 9.57 0 0 1 6.167 6.9c.094.352.114.417.114.417c-1.932.351-4.319.8-6.238 1.215c-.362-1.915-1.265-3.428-3.2-3.9a5.263 5.263 0 0 0-6.616 3.57a10.5 10.5 0 0 0-.385 1.439a12.3 12.3 0 0 0-.214 2.594\"/>" },
		"file-type-cmake": { w: 32, h: 32, body: "<defs><linearGradient id=\"__DGPICON__SVGCgNrzdsa\" x1=\"9.955\" x2=\"16.68\" y1=\"9.096\" y2=\"23.324\" gradientTransform=\"matrix(1 0 0 -1 0 32)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#1011a1\"/><stop offset=\"1\" stop-color=\"#6969e1\"/></linearGradient><linearGradient id=\"__DGPICON__SVGrgqtQcHo\" x1=\"16.231\" x2=\"25.618\" y1=\"19.655\" y2=\"3.782\" gradientTransform=\"matrix(1 0 0 -1 0 32)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#b40e0e\"/><stop offset=\"1\" stop-color=\"#ff5959\"/></linearGradient><linearGradient id=\"__DGPICON__SVGV3I43cHR\" x1=\"21.663\" x2=\"8.381\" y1=\"4.823\" y2=\"5.938\" gradientTransform=\"matrix(1 0 0 -1 0 32)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#01a300\"/><stop offset=\"1\" stop-color=\"#01df00\"/></linearGradient><linearGradient id=\"__DGPICON__SVGhUomfdFs\" x1=\"14.643\" x2=\"14.472\" y1=\"8.368\" y2=\"14.145\" gradientTransform=\"matrix(1 0 0 -1 0 32)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#848484\"/><stop offset=\"1\" stop-color=\"#d2d2d2\"/></linearGradient></defs><path fill=\"url(#__DGPICON__SVGCgNrzdsa)\" d=\"M17.257 16.919L2.246 29.749L15.994 2.283Z\"/><path d=\"m2.262 29.768l-.038-.03L16.012 2.193l.008.088l1.263 14.649l-.01.008ZM15.977 2.374L2.324 29.649L17.23 16.908Z\"/><path fill=\"url(#__DGPICON__SVGrgqtQcHo)\" d=\"M17.952 24.931L16 2.28l13.767 27.471Z\"/><path d=\"m29.818 29.8l-.061-.025l-11.828-4.827v-.015L15.975 2.282l.047-.013Zm-11.842-4.887L29.715 29.7L16.036 2.408Z\"/><path fill=\"url(#__DGPICON__SVGV3I43cHR)\" d=\"m11.16 22.094l18.621 7.654H2.25Z\"/><path d=\"M29.781 29.773H2.183l.051-.044l8.921-7.665l.014.006l18.622 7.655Zm-27.464-.05h27.337l-18.489-7.6Z\"/><path fill=\"url(#__DGPICON__SVGhUomfdFs)\" d=\"m11.189 22.112l6.059-5.168l.843 7.98Z\"/><path d=\"m18.149 25l-.077-.032l-6.978-2.842l6.194-5.283l.01.094Zm-6.865-2.9l6.748 2.749l-.824-7.8Z\"/><path d=\"M29.7 29.911H2.285a.22.22 0 0 1-.182-.088a.22.22 0 0 1 .022-.2L15.864 2.187a.17.17 0 0 1 .14-.1a.15.15 0 0 1 .13.085l13.733 27.435a.24.24 0 0 1 .02.226a.21.21 0 0 1-.187.078m-27.468-.16l.057.011h27.4l.073-.009a.2.2 0 0 0-.028-.077L16 2.248v.012L2.261 29.684a.3.3 0 0 0-.025.067Z\"/>" },
		"file-type-cpp": { w: 32, h: 32, body: "<path fill=\"#984c93\" d=\"M14.742 24.047a10.24 10.24 0 0 1-4.673.919a7.63 7.63 0 0 1-5.914-2.346A8.88 8.88 0 0 1 2 16.369a9.48 9.48 0 0 1 2.422-6.748a8.22 8.22 0 0 1 6.285-2.588a11.2 11.2 0 0 1 4.035.641v3.761A6.84 6.84 0 0 0 11 10.395a4.81 4.81 0 0 0-3.712 1.535a5.9 5.9 0 0 0-1.413 4.159A5.8 5.8 0 0 0 7.209 20.1a4.57 4.57 0 0 0 3.59 1.493a7.3 7.3 0 0 0 3.943-1.113Zm2.37-9.218v-2.344h2.344v2.344H21.8v2.343h-2.344v2.343h-2.344v-2.343H14.77v-2.344zm8.201 0v-2.344h2.344v2.344H30v2.343h-2.343v2.343h-2.344v-2.343h-2.342v-2.344z\"/>" },
		"file-type-csharp": { w: 32, h: 32, body: "<path fill=\"#368832\" d=\"M19.792 7.071h2.553v2.553H24.9V7.071h2.552v2.553H30v2.552h-2.55v2.551H30v2.553h-2.551v2.552H24.9v-2.55h-2.55v2.552h-2.557v-2.55H17.24v-2.559h2.553v-2.546H17.24V9.622h2.554Zm2.553 7.658H24.9v-2.553h-2.555Zm-7.656 9.284a10.2 10.2 0 0 1-4.653.915a7.6 7.6 0 0 1-5.89-2.336A8.84 8.84 0 0 1 2 16.367a9.44 9.44 0 0 1 2.412-6.719a8.18 8.18 0 0 1 6.259-2.577a11.1 11.1 0 0 1 4.018.638v3.745a6.8 6.8 0 0 0-3.723-1.036a4.8 4.8 0 0 0-3.7 1.529a5.88 5.88 0 0 0-1.407 4.142a5.77 5.77 0 0 0 1.328 3.992a4.55 4.55 0 0 0 3.575 1.487a7.3 7.3 0 0 0 3.927-1.108Z\"/>" },
		"file-type-css": { w: 32, h: 32, body: "<path fill=\"#639\" d=\"M1.995 1.994h23.52a4.48 4.48 0 0 1 4.48 4.48v19.04a4.48 4.48 0 0 1-4.48 4.48H6.475a4.48 4.48 0 0 1-4.48-4.48Z\"/><path fill=\"#fff\" d=\"M9.079 24.87v-4.704c0-1.876 1.204-2.884 3.024-2.884c1.792-.028 2.912 1.148 2.856 3.136h-2.072c.056-.756-.28-1.316-.84-1.288c-.7 0-.896.476-.896 1.372v4.088c0 .868.28 1.288.896 1.316c.644 0 .896-.644.84-1.372h2.072c.112 2.044-1.176 3.248-2.996 3.22c-1.764 0-2.884-.98-2.884-2.884m6.636-.336h1.932c.028.896.308 1.456.924 1.456s.84-.364.84-1.204c0-.7-.308-1.092-1.064-1.456l-.728-.336c-1.288-.616-1.82-1.372-1.82-2.884c0-1.68 1.064-2.856 2.8-2.856s2.66 1.204 2.688 3.164h-1.876c0-.812-.168-1.372-.784-1.372c-.56 0-.84.28-.84.98s.252.98.924 1.26l.672.308c1.428.672 2.044 1.54 2.044 3.164c0 1.932-1.092 2.996-2.884 2.996s-2.8-1.232-2.828-3.22m6.328 0h1.96c0 .896.308 1.456.896 1.456s.84-.364.84-1.204c0-.7-.28-1.092-1.064-1.456l-.728-.336c-1.288-.616-1.792-1.372-1.792-2.884c0-1.68 1.036-2.856 2.8-2.856s2.632 1.204 2.688 3.164h-1.876c-.028-.812-.196-1.372-.812-1.372c-.56 0-.812.28-.812.98s.224.98.896 1.26l.7.308c1.4.672 2.016 1.54 2.016 3.164c0 1.932-1.092 2.996-2.884 2.996s-2.8-1.232-2.828-3.22\"/>" },
		"file-type-dartlang": { w: 32, h: 32, body: "<path fill=\"#66c3fa\" d=\"M16.739 2.037a1.3 1.3 0 0 0-.916.377l-.013.01l-8.59 4.965l8.566 8.566v.006l10.3 10.3l1.963-3.536l-7.081-16.997l-3.3-3.3a1.3 1.3 0 0 0-.927-.388Z\"/><path fill=\"#215896\" d=\"m7.25 7.35l-4.962 8.581l-.01.013a1.32 1.32 0 0 0-.378.919a1.3 1.3 0 0 0 .387.924L6.4 21.9l16.084 6.327l3.636-2.02l-.1-.1h-.025l-10.083-10.1H15.9z\"/><path fill=\"#235997\" d=\"m7.192 7.362l8.764 8.773h.013l10.087 10.1l3.839-.732l.005-11.363l-4.054-3.973a6.5 6.5 0 0 0-3.624-1.616v-.044z\"/><path fill=\"#58b6f0\" d=\"m7.256 7.411l8.768 8.768v.013l10.092 10.092l-.734 3.839h-11.36l-3.971-4.056a6.5 6.5 0 0 1-1.614-3.625h-.044z\"/>" },
		"file-type-docker": { w: 32, h: 32, body: "<path fill=\"#3a4e55\" d=\"M18.191 13.071H20.7v2.566h1.27a5.5 5.5 0 0 0 1.744-.292a4.5 4.5 0 0 0 .848-.383a3.15 3.15 0 0 1-.589-1.623a3.43 3.43 0 0 1 .616-2.416l.264-.305l.314.253a4 4 0 0 1 1.575 2.538a3.84 3.84 0 0 1 2.913.271l.345.2l-.181.354a3.63 3.63 0 0 1-3.648 1.74c-2.173 5.413-6.9 7.976-12.642 7.976A7.96 7.96 0 0 1 6.3 20.211l-.025-.043l-.226-.459a7.3 7.3 0 0 1-.579-3.693l.035-.38h2.143v-2.565h2.51v-2.51h5.02v-2.51h3.012v5.02Z\"/><path fill=\"#00aada\" d=\"M26.324 14.021a3.31 3.31 0 0 0-1.418-2.821a3.07 3.07 0 0 0 .289 3.821a5.28 5.28 0 0 1-3.225 1.037H5.883a6.8 6.8 0 0 0 .667 3.737l.183.335a6 6 0 0 0 .379.569q.992.064 1.829.045a9 9 0 0 0 2.669-.389a.193.193 0 1 1 .126.365q-.135.047-.281.088a8.4 8.4 0 0 1-1.845.3c.044 0-.046.007-.046.007l-.082.007a22 22 0 0 1-2.008-.006l-.01.007a7.88 7.88 0 0 0 6.063 2.41c5.56 0 10.276-2.465 12.365-8c1.482.152 2.906-.226 3.553-1.49a3.5 3.5 0 0 0-3.122-.022\"/><path fill=\"#27b9ec\" d=\"M26.324 14.021a3.31 3.31 0 0 0-1.418-2.821a3.07 3.07 0 0 0 .289 3.821a5.28 5.28 0 0 1-3.225 1.037H6.836a5.22 5.22 0 0 0 2.106 4.686a9 9 0 0 0 2.669-.389a.193.193 0 1 1 .126.365q-.135.047-.281.088a9 9 0 0 1-1.894.314l-.019-.022c1.892.971 4.636.967 7.782-.241a21.87 21.87 0 0 0 9.1-6.889l-.1.048\"/><path fill=\"#088cb9\" d=\"M5.913 17.732a6.4 6.4 0 0 0 .637 2.061l.183.335a6 6 0 0 0 .379.569q.992.064 1.829.045a9 9 0 0 0 2.669-.389a.193.193 0 1 1 .126.365q-.135.047-.281.088a8.8 8.8 0 0 1-1.891.307h-.1q-.438.025-.922.026c-.351 0-.709-.007-1.1-.026a7.9 7.9 0 0 0 6.076 2.413c4.76 0 8.9-1.807 11.3-5.8Z\"/><path fill=\"#039cc7\" d=\"M6.98 17.732a4.83 4.83 0 0 0 1.961 3.01a9 9 0 0 0 2.669-.389a.193.193 0 1 1 .126.365q-.135.047-.281.088a9 9 0 0 1-1.9.307c1.892.971 4.628.957 7.773-.252a20.6 20.6 0 0 0 5.377-3.13Z\"/><path fill=\"#00acd3\" d=\"M9.889 13.671h.172v1.813h-.172zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813H9.23v-1.813Zm-.33 0h.179v1.813H8.9v-1.813Zm-.33 0h.179v1.813H8.57zm-.323 0h.172v1.813h-.17v-1.813Zm-.181-.181h2.175v2.176H8.066V13.49Zm4.335-2.329h.172v1.813H12.4zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.178v1.813h-.178zm-.323 0h.172v1.813h-.172zm-.181-.181h2.176v2.176h-2.175z\"/><path fill=\"#26c2ee\" d=\"M12.4 13.671h.172v1.813H12.4zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.178v1.813h-.178zm-.323 0h.172v1.813h-.172zm-.181-.181h2.176v2.176h-2.175z\"/><path fill=\"#00acd3\" d=\"M14.909 13.671h.172v1.813h-.172zm-.33 0h.179v1.813h-.178zm-.33 0h.179v1.813h-.178zm-.33 0h.181v1.813h-.179v-1.813Zm-.33 0h.179v1.813h-.179zm-.323 0h.172v1.813h-.172zm-.181-.181h2.176v2.176h-2.174V13.49Z\"/><path fill=\"#26c2ee\" d=\"M14.909 11.161h.172v1.813h-.172zm-.33 0h.179v1.813h-.178zm-.33 0h.179v1.813h-.178zm-.33 0h.181v1.813h-.179v-1.813Zm-.33 0h.179v1.813h-.179zm-.323 0h.172v1.813h-.172zm-.181-.181h2.176v2.176h-2.174v-2.177Zm4.335 2.691h.172v1.813h-.172zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813H16.1zm-.323 0h.172v1.813h-.172zm-.177-.181h2.176v2.176H15.6z\"/><path fill=\"#00acd3\" d=\"M17.42 11.161h.172v1.813h-.172zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813H16.1zm-.323 0h.172v1.813h-.172zm-.181-.181h2.176v2.176H15.6v-2.177Z\"/><path fill=\"#26c2ee\" d=\"M17.42 8.65h.172v1.813h-.172zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813H16.1zm-.323 0h.172v1.813h-.172zm-.177-.181h2.176v2.176H15.6z\"/><path fill=\"#00acd3\" d=\"M19.93 13.671h.17v1.813h-.17zm-.33 0h.178v1.813H19.6zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.33 0h.179v1.813h-.179zm-.323 0h.172v1.813h-.172zm-.181-.181h2.176v2.176h-2.175z\"/><path fill=\"#d5eef2\" d=\"M12.616 19.193a.6.6 0 1 1-.6.6a.6.6 0 0 1 .6-.6\"/><path fill=\"#3a4e55\" d=\"M12.616 19.363a.4.4 0 0 1 .156.029a.175.175 0 1 0 .241.236a.43.43 0 1 1-.4-.265M2 17.949h27.92c-.608-.154-1.923-.362-1.707-1.159c-1.105 1.279-3.771.9-4.444.267c-.749 1.087-5.111.674-5.415-.173c-.939 1.1-3.85 1.1-4.789 0c-.3.847-4.666 1.26-5.415.173c-.673.631-3.338 1.012-4.444-.267c.217.8-1.1 1.005-1.707 1.159\"/><path fill=\"#c0dbe1\" d=\"M14.211 23.518a5.3 5.3 0 0 1-2.756-2.711a9.2 9.2 0 0 1-1.987.3q-.436.024-.917.025q-.554 0-1.168-.033a7.94 7.94 0 0 0 6.145 2.43q.344 0 .683-.013\"/><path fill=\"#d5eef2\" d=\"M12.007 21.773a5.2 5.2 0 0 1-.552-.966a9.2 9.2 0 0 1-1.987.3a6.3 6.3 0 0 0 2.539.664\"/>" },
		"file-type-dotenv": { w: 32, h: 32, body: "<g fill-rule=\"evenodd\"><path d=\"M3.167 3.167h25.667v25.667H3.167z\"/><path fill=\"#ecd53f\" fill-rule=\"nonzero\" d=\"M30 2v28H2V2zM14.757 20.539H9.98v6.44h4.898v-1.085h-3.597V24.14h3.232v-1.085H11.28v-1.428h3.475v-1.09zm2.503 0h-1.264v6.44h1.207v-4.2l2.597 4.2h1.305v-6.44h-1.21v4.3zm5.97 0h-1.41l2.303 6.44h1.388l2.306-6.44h-1.38l-1.577 4.766l-1.63-4.767zM8.3 24.96H6.34v1.96H8.3z\"/></g>" },
		"file-type-excel": { w: 32, h: 32, body: "<defs><linearGradient id=\"__DGPICON__SVGSuUii0pt\" x1=\"4.494\" x2=\"13.832\" y1=\"-2092.086\" y2=\"-2075.914\" gradientTransform=\"translate(0 2100)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#18884f\"/><stop offset=\".5\" stop-color=\"#117e43\"/><stop offset=\"1\" stop-color=\"#0b6631\"/></linearGradient></defs><path fill=\"#185c37\" d=\"M19.581 15.35L8.512 13.4v14.409A1.19 1.19 0 0 0 9.705 29h19.1A1.19 1.19 0 0 0 30 27.809V22.5Z\"/><path fill=\"#21a366\" d=\"M19.581 3H9.705a1.19 1.19 0 0 0-1.193 1.191V9.5L19.581 16l5.861 1.95L30 16V9.5Z\"/><path fill=\"#107c41\" d=\"M8.512 9.5h11.069V16H8.512Z\"/><path d=\"M16.434 8.2H8.512v16.25h7.922a1.2 1.2 0 0 0 1.194-1.191V9.391A1.2 1.2 0 0 0 16.434 8.2\" opacity=\".1\"/><path d=\"M15.783 8.85H8.512V25.1h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191\" opacity=\".2\"/><path d=\"M15.783 8.85H8.512V23.8h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191\" opacity=\".2\"/><path d=\"M15.132 8.85h-6.62V23.8h6.62a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191\" opacity=\".2\"/><path fill=\"url(#__DGPICON__SVGSuUii0pt)\" d=\"M3.194 8.85h11.938a1.193 1.193 0 0 1 1.194 1.191v11.918a1.193 1.193 0 0 1-1.194 1.191H3.194A1.19 1.19 0 0 1 2 21.959V10.041A1.19 1.19 0 0 1 3.194 8.85\"/><path fill=\"#fff\" d=\"m5.7 19.873l2.511-3.884l-2.3-3.862h1.847L9.013 14.6c.116.234.2.408.238.524h.017q.123-.281.26-.546l1.342-2.447h1.7l-2.359 3.84l2.419 3.905h-1.809l-1.45-2.711A2.4 2.4 0 0 1 9.2 16.8h-.024a1.7 1.7 0 0 1-.168.351l-1.493 2.722Z\"/><path fill=\"#33c481\" d=\"M28.806 3h-9.225v6.5H30V4.191A1.19 1.19 0 0 0 28.806 3\"/><path fill=\"#107c41\" d=\"M19.581 16H30v6.5H19.581Z\"/>" },
		"file-type-font": { w: 32, h: 32, body: "<path fill=\"#cfcfcf\" d=\"m12.677 17.781l-2.626-6.256l-2.694 6.256Zm6.723 6.511h-7.069v-1.365l.458-.023a1.85 1.85 0 0 0 .972-.2a.31.31 0 0 0 .145-.263a4.2 4.2 0 0 0-.419-1.4l-.812-1.931H7.322L6.4 21.259a3.3 3.3 0 0 0-.349 1.157c0 .036 0 .119.154.241a2.5 2.5 0 0 0 1.191.247l.448.033v1.354H2v-1.31l.4-.07a2.2 2.2 0 0 0 1-.318a6.3 6.3 0 0 0 1.18-2.066l5.575-13.036H11.2l5.512 13.174a5.3 5.3 0 0 0 1.049 1.835a1.96 1.96 0 0 0 1.19.4l.454.027Zm6.441-2.732v-3.985a23 23 0 0 0-2.226.97a3.85 3.85 0 0 0-1.29 1.05a2.03 2.03 0 0 0-.388 1.2a1.95 1.95 0 0 0 .491 1.362a1.49 1.49 0 0 0 1.13.544a4.14 4.14 0 0 0 2.283-1.141m-3.333 2.949a2.83 2.83 0 0 1-2.139-.893a3.2 3.2 0 0 1-.833-2.285a2.96 2.96 0 0 1 .415-1.577a5 5 0 0 1 1.791-1.625a24 24 0 0 1 3.617-1.588v-.074a2.9 2.9 0 0 0-.383-1.833a1.33 1.33 0 0 0-1.075-.412a1.16 1.16 0 0 0-.816.26a.69.69 0 0 0-.277.536l.023.646a1.62 1.62 0 0 1-.4 1.158a1.48 1.48 0 0 1-2.1-.019a1.63 1.63 0 0 1-.391-1.134a2.8 2.8 0 0 1 1.182-2.177a4.8 4.8 0 0 1 3.125-.932a5.4 5.4 0 0 1 2.508.524a2.63 2.63 0 0 1 1.213 1.346a6.4 6.4 0 0 1 .244 2.2v3.55a15 15 0 0 0 .051 1.749a.7.7 0 0 0 .054.2c.085-.078.284-.225.864-.806l.819-.828v1.967l-.1.128c-.958 1.283-1.883 1.907-2.83 1.907a1.6 1.6 0 0 1-1.257-.557a1.8 1.8 0 0 1-.358-.74a9.7 9.7 0 0 1-1.433.977a3.6 3.6 0 0 1-1.514.332\"/>" },
		"file-type-git": { w: 32, h: 32, body: "<path fill=\"#dd4c35\" d=\"M29.472 14.753L17.247 2.528a1.8 1.8 0 0 0-2.55 0l-2.539 2.539l3.22 3.22a2.141 2.141 0 0 1 2.712 2.73l3.1 3.1a2.143 2.143 0 1 1-1.285 1.21l-2.895-2.895v7.617a2.141 2.141 0 1 1-1.764-.062V12.3a2.146 2.146 0 0 1-1.165-2.814l-3.17-3.172L2.528 14.7a1.8 1.8 0 0 0 0 2.551l12.225 12.221a1.8 1.8 0 0 0 2.55 0L29.472 17.3a1.8 1.8 0 0 0 0-2.551\"/><path fill=\"#fff\" d=\"m12.158 5.067l3.22 3.22a2.141 2.141 0 0 1 2.712 2.73l3.1 3.1a2.143 2.143 0 1 1-1.285 1.21l-2.895-2.895v7.617a2.141 2.141 0 1 1-1.764-.062V12.3a2.146 2.146 0 0 1-1.165-2.814l-3.17-3.172\"/>" },
		"file-type-go": { w: 254.5, h: 225, body: "<path fill=\"#00acd7\" d=\"M-46.926 89c-.621 0-.777-.311-.466-.777l3.262-4.194a2.23 2.23 0 0 1 1.708-.777h55.448c.621 0 .777.466.466.932l-2.64 4.038a2.37 2.37 0 0 1-1.553.932Zm-23.453 14.285c-.621 0-.777-.311-.466-.777l3.262-4.194a2.23 2.23 0 0 1 1.708-.777H4.95a.714.714 0 0 1 .777.932L4.484 102.2a1.36 1.36 0 0 1-1.4.932Zm37.587 14.289c-.621 0-.777-.466-.466-.932l2.174-3.883a2.06 2.06 0 0 1 1.553-.932H1.533c.621 0 .932.466.932 1.087l-.311 3.728a1.17 1.17 0 0 1-1.087 1.087ZM128.426 86.2c-9.785 2.485-16.464 4.349-26.093 6.834c-2.33.621-2.485.777-4.5-1.553c-2.33-2.64-4.038-4.349-7.3-5.9c-9.785-4.815-19.259-3.417-28.112 2.33c-10.561 6.834-16 16.929-15.842 29.51c.155 12.425 8.7 22.676 20.968 24.385c10.561 1.4 19.414-2.33 26.4-10.251c1.4-1.708 2.64-3.572 4.194-5.747H68.163c-3.262 0-4.038-2.019-2.951-4.659c2.019-4.815 5.747-12.891 7.921-16.929a4.19 4.19 0 0 1 3.883-2.485h56.535c-.311 4.194-.311 8.387-.932 12.581a66.24 66.24 0 0 1-12.736 30.442c-11.183 14.752-25.783 23.915-44.265 26.4c-15.221 2.019-29.355-.932-41.78-10.251a48.8 48.8 0 0 1-19.725-34.48c-2.019-16.929 2.951-32.15 13.2-45.508C38.342 66.475 52.942 57.312 70.8 54.05c14.6-2.64 28.578-.932 41.159 7.61a48.7 48.7 0 0 1 18.017 21.9c.935 1.398.313 2.175-1.55 2.64\"/><path fill=\"#00acd7\" d=\"M179.835 172.09c-14.134-.311-27.025-4.349-37.9-13.668a48.7 48.7 0 0 1-16.774-29.976c-2.8-17.551 2.019-33.082 12.581-46.905c11.338-14.91 25.006-22.676 43.488-25.938c15.842-2.8 30.753-1.243 44.265 7.921c12.27 8.387 19.88 19.725 21.9 34.635c2.64 20.968-3.417 38.052-17.861 52.652a71.17 71.17 0 0 1-37.276 19.88c-4.191.778-8.384.933-12.423 1.399m36.965-62.747a45 45 0 0 0-.466-5.125c-2.8-15.376-16.929-24.074-31.684-20.657c-14.444 3.262-23.763 12.425-27.18 27.025a25.58 25.58 0 0 0 14.289 29.355c8.542 3.728 17.085 3.262 25.317-.932c12.269-6.369 18.948-16.309 19.724-29.666\"/>" },
		"file-type-graphql": { w: 32, h: 32, body: "<path fill=\"#e10098\" d=\"M4.781 22.746L16.232 2.914l1.028.593L5.81 23.34z\"/><path fill=\"#e10098\" d=\"M4.545 21.162h22.902v1.187H4.545z\"/><path fill=\"#e10098\" d=\"m4.999 21.828l.593-1.028l11.455 6.614l-.594 1.028zM14.95 4.59l.594-1.027l11.455 6.614l-.594 1.028z\"/><path fill=\"#e10098\" d=\"M5.002 10.174L16.456 3.56l.594 1.028l-11.455 6.614z\"/><path fill=\"#e10098\" d=\"m14.743 3.508l1.028-.594l11.45 19.833l-1.027.593zM5.454 9.386h1.187v13.228H5.454z\"/><path fill=\"#e10098\" d=\"M25.36 9.386h1.187v13.228H25.36z\"/><path fill=\"#e10098\" d=\"m15.734 27.042l9.962-5.752l.519.898l-9.963 5.752z\"/><path fill=\"#e10098\" d=\"M28.12 23a2.5 2.5 0 1 1-.915-3.411A2.5 2.5 0 0 1 28.12 23M8.2 11.5a2.5 2.5 0 1 1-.915-3.411A2.5 2.5 0 0 1 8.2 11.5M3.88 23a2.5 2.5 0 1 1 3.411.915A2.5 2.5 0 0 1 3.88 23M23.8 11.5a2.5 2.5 0 1 1 3.411.915A2.5 2.5 0 0 1 23.8 11.5M16 30a2.5 2.5 0 1 1 2.5-2.5A2.493 2.493 0 0 1 16 30m0-23.009a2.5 2.5 0 1 1 2.5-2.5a2.493 2.493 0 0 1-2.5 2.5\"/>" },
		"file-type-html": { w: 32, h: 32, body: "<path fill=\"#e44f26\" d=\"M5.902 27.201L3.655 2h24.69l-2.25 25.197L15.985 30z\"/><path fill=\"#f1662a\" d=\"m16 27.858l8.17-2.265l1.922-21.532H16z\"/><path fill=\"#ebebeb\" d=\"M16 13.407h-4.09l-.282-3.165H16V7.151H8.25l.074.83l.759 8.517H16zm0 8.027l-.014.004l-3.442-.929l-.22-2.465H9.221l.433 4.852l6.332 1.758l.014-.004z\"/><path fill=\"#fff\" d=\"M15.989 13.407v3.091h3.806l-.358 4.009l-3.448.93v3.216l6.337-1.757l.046-.522l.726-8.137l.076-.83zm0-6.256v3.091h7.466l.062-.694l.141-1.567l.074-.83z\"/>" },
		"file-type-image": { w: 32, h: 32, body: "<path fill=\"#2dcc9f\" d=\"M30 5.851v20.298H2V5.851z\"/><path fill=\"#fff\" d=\"M24.232 8.541a2.2 2.2 0 1 0 1.127.623a2.2 2.2 0 0 0-1.127-.623M18.111 20.1q-2.724-3.788-5.45-7.575L4.579 23.766h10.9q1.316-1.832 2.634-3.663M22.057 16q-2.793 3.882-5.584 7.765h11.169Q24.851 19.882 22.057 16\"/>" },
		"file-type-ini": { w: 32, h: 32, body: "<path fill=\"#99b8c4\" d=\"m23.265 24.381l.9-.894c4.164.136 4.228-.01 4.411-.438l1.144-2.785l.085-.264l-.093-.231c-.049-.122-.2-.486-2.8-2.965V15.5c3-2.89 2.936-3.038 2.765-3.461l-1.139-2.814c-.171-.422-.236-.587-4.37-.474l-.9-.93a20 20 0 0 0-.141-4.106l-.116-.263l-2.974-1.3c-.438-.2-.592-.272-3.4 2.786l-1.262-.019c-2.891-3.086-3.028-3.03-3.461-2.855L9.149 3.182c-.433.175-.586.237-.418 4.437l-.893.89c-4.162-.136-4.226.012-4.407.438l-1.146 2.786l-.09.267l.094.232c.049.12.194.48 2.8 2.962v1.3c-3 2.89-2.935 3.038-2.763 3.462l1.138 2.817c.174.431.236.584 4.369.476l.9.935a20.2 20.2 0 0 0 .137 4.1l.116.265l2.993 1.308c.435.182.586.247 3.386-2.8l1.262.016c2.895 3.09 3.043 3.03 3.466 2.859l2.759-1.115c.436-.173.588-.234.413-4.436m-11.858-6.524a4.957 4.957 0 1 1 6.488 2.824a5.014 5.014 0 0 1-6.488-2.824\"/>" },
		"file-type-java": { w: 32, h: 32, body: "<path fill=\"#5382a1\" d=\"M12.7 23.56s-1.07.622.761.833a16 16 0 0 0 5.8-.246a10 10 0 0 0 1.539.753c-5.481 2.349-12.405-.136-8.1-1.339m-.674-3.067s-1.2.888.633 1.078a22.6 22.6 0 0 0 7.481-.359a3.3 3.3 0 0 0 1.152.7c-6.627 1.938-14.009.153-9.266-1.421\"/><path fill=\"#e76f00\" d=\"M17.673 15.294a2.05 2.05 0 0 1-.355 2.954s3.429-1.77 1.854-3.987c-1.471-2.067-2.6-3.095 3.508-6.636c0 0-9.586 2.394-5.007 7.669\"/><path fill=\"#5382a1\" d=\"M24.922 25.827s.792.652-.872 1.157c-3.164.958-13.168 1.248-15.948.038c-1-.435.874-1.038 1.464-1.164a3.8 3.8 0 0 1 .966-.108c-1.111-.783-7.181 1.537-3.083 2.2c11.176 1.812 20.372-.816 17.473-2.124m-11.711-8.508s-5.089 1.209-1.8 1.648a38 38 0 0 0 6.731-.072a53 53 0 0 0 4.221-.555a9 9 0 0 0-1.28.685c-5.17 1.358-15.153.726-12.283-.665a9.6 9.6 0 0 1 4.407-1.042m9.133 5.104c5.253-2.73 2.824-5.353 1.129-5a4 4 0 0 0-.6.161a.96.96 0 0 1 .449-.346c3.354-1.179 5.933 3.478-1.083 5.322a.5.5 0 0 0 .106-.138\"/><path fill=\"#e76f00\" d=\"M19.172 1.906s2.909 2.91-2.759 7.386c-4.546 3.59-1.037 5.637 0 7.975c-2.653-2.394-4.6-4.5-3.294-6.463c1.917-2.879 7.229-4.275 6.056-8.9\"/><path fill=\"#5382a1\" d=\"M13.727 29.818c5.042.323 12.786-.179 12.969-2.565c0 0-.353.9-4.167 1.623a41.5 41.5 0 0 1-12.76.2s.645.533 3.959.746\"/>" },
		"file-type-js": { w: 32, h: 32, body: "<path fill=\"#f5de19\" d=\"M18.774 19.7a3.73 3.73 0 0 0 3.376 2.078c1.418 0 2.324-.709 2.324-1.688c0-1.173-.931-1.589-2.491-2.272l-.856-.367c-2.469-1.052-4.11-2.37-4.11-5.156c0-2.567 1.956-4.52 5.012-4.52A5.06 5.06 0 0 1 26.9 10.52l-2.665 1.711a2.33 2.33 0 0 0-2.2-1.467a1.49 1.49 0 0 0-1.638 1.467c0 1.027.636 1.442 2.1 2.078l.856.366c2.908 1.247 4.549 2.518 4.549 5.376c0 3.081-2.42 4.769-5.671 4.769a6.58 6.58 0 0 1-6.236-3.5ZM6.686 20c.538.954 1.027 1.76 2.2 1.76c1.124 0 1.834-.44 1.834-2.15V7.975h3.422v11.683c0 3.543-2.078 5.156-5.11 5.156A5.31 5.31 0 0 1 3.9 21.688Z\"/>" },
		"file-type-json": { w: 32, h: 32, body: "<path fill=\"#f5de19\" d=\"M4.014 14.976a2.5 2.5 0 0 0 1.567-.518a2.38 2.38 0 0 0 .805-1.358a15.3 15.3 0 0 0 .214-2.944q.012-2.085.075-2.747a5.2 5.2 0 0 1 .418-1.686a3 3 0 0 1 .755-1.018A3.05 3.05 0 0 1 9 4.125A6.8 6.8 0 0 1 10.544 4h.7v1.96h-.387a2.34 2.34 0 0 0-1.723.468a3.4 3.4 0 0 0-.425 2.092a36 36 0 0 1-.137 4.133a4.7 4.7 0 0 1-.768 2.06A4.6 4.6 0 0 1 6.1 16a3.8 3.8 0 0 1 1.992 1.754a8.9 8.9 0 0 1 .618 3.865q0 2.435.05 2.9a1.76 1.76 0 0 0 .504 1.181a2.64 2.64 0 0 0 1.592.337h.387V28h-.7a5.7 5.7 0 0 1-1.773-.2a2.97 2.97 0 0 1-1.324-.93a3.35 3.35 0 0 1-.681-1.63a24 24 0 0 1-.165-3.234a16.5 16.5 0 0 0-.214-3.106a2.4 2.4 0 0 0-.805-1.361a2.5 2.5 0 0 0-1.567-.524Zm23.972 2.035a2.5 2.5 0 0 0-1.567.524a2.4 2.4 0 0 0-.805 1.361a16.5 16.5 0 0 0-.212 3.109a24 24 0 0 1-.169 3.234a3.35 3.35 0 0 1-.681 1.63a2.97 2.97 0 0 1-1.324.93a5.7 5.7 0 0 1-1.773.2h-.7V26.04h.387a2.64 2.64 0 0 0 1.592-.337a1.76 1.76 0 0 0 .506-1.186q.05-.462.05-2.9a8.9 8.9 0 0 1 .618-3.865A3.8 3.8 0 0 1 25.9 16a4.6 4.6 0 0 1-1.7-1.286a4.7 4.7 0 0 1-.768-2.06a36 36 0 0 1-.137-4.133a3.4 3.4 0 0 0-.425-2.092a2.34 2.34 0 0 0-1.723-.468h-.387V4h.7a6.8 6.8 0 0 1 1.54.125a3.05 3.05 0 0 1 1.149.581a3 3 0 0 1 .755 1.018a5.2 5.2 0 0 1 .418 1.686q.062.662.075 2.747a15.3 15.3 0 0 0 .212 2.947a2.38 2.38 0 0 0 .805 1.355a2.5 2.5 0 0 0 1.567.518Z\"/>" },
		"file-type-kotlin": { w: 32, h: 32, body: "<g fill=\"none\"><path fill=\"url(#__DGPICON__SVG5NiZhbGj)\" d=\"M30 30H2V2h28L15.711 15.794z\"/><defs><radialGradient id=\"__DGPICON__SVG5NiZhbGj\" cx=\"0\" cy=\"0\" r=\"1\" gradientTransform=\"matrix(-28 0 0 -28 30 2)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#e44857\"/><stop offset=\".504\" stop-color=\"#c711e1\"/><stop offset=\"1\" stop-color=\"#7f52ff\"/></radialGradient></defs></g>" },
		"file-type-license": { w: 32, h: 32, body: "<defs><linearGradient id=\"__DGPICON__SVGmofYFcWG\" x1=\"-264.845\" x2=\"-255.586\" y1=\"181.772\" y2=\"182.061\" gradientTransform=\"rotate(153.82 -142.976 -47.771)scale(1 -1)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#bd6316\"/><stop offset=\"1\" stop-color=\"#4e1500\"/></linearGradient><linearGradient id=\"__DGPICON__SVGnJ3pCbpX\" x1=\"-263.276\" x2=\"-256.603\" y1=\"170.205\" y2=\"171.772\" href=\"#__DGPICON__SVGmofYFcWG\"/><linearGradient id=\"__DGPICON__SVGMrBZzbeY\" x1=\"-265.068\" x2=\"-256.777\" y1=\"175.732\" y2=\"178.801\" href=\"#__DGPICON__SVGmofYFcWG\"/><linearGradient id=\"__DGPICON__SVGfIPENsHv\" x1=\"-655.014\" x2=\"-655.555\" y1=\"147.549\" y2=\"146.948\" gradientTransform=\"rotate(18.83 723.694 -1849.006)scale(-1 1)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffd436\"/><stop offset=\"1\" stop-color=\"#8b3f02\"/></linearGradient><linearGradient id=\"__DGPICON__SVGwiYLJd3C\" x1=\"-258.899\" x2=\"-253.843\" y1=\"170.981\" y2=\"171.325\" gradientTransform=\"rotate(153.82 -142.976 -47.771)scale(1 -1)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff8b7\"/><stop offset=\"1\" stop-color=\"#fcbf0e\"/></linearGradient><linearGradient id=\"__DGPICON__SVGESyEmRVH\" x1=\"-258.884\" x2=\"-253.896\" y1=\"170.975\" y2=\"171.314\" href=\"#__DGPICON__SVGmofYFcWG\"/><linearGradient id=\"__DGPICON__SVGREjbOeQM\" x1=\"-257.805\" x2=\"-257.726\" y1=\"172.266\" y2=\"168.648\" gradientTransform=\"rotate(153.82 -142.976 -47.771)scale(1 -1)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVG027WPcDj\" x1=\"-258.935\" x2=\"-256.173\" y1=\"181.92\" y2=\"182.108\" href=\"#__DGPICON__SVGwiYLJd3C\"/><linearGradient id=\"__DGPICON__SVGyornQdTp\" x1=\"-274.156\" x2=\"-274.512\" y1=\"170.544\" y2=\"173.778\" gradientTransform=\"matrix(-1 0 0 1 -257.657 -155.509)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGkN47ldnx\" x1=\"-645.79\" x2=\"-645.121\" y1=\"-337.938\" y2=\"-334.17\" gradientTransform=\"rotate(-127.94 -392.31 14.206)scale(1 -1)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffef94\"/><stop offset=\"1\" stop-color=\"#ffd200\"/></linearGradient><linearGradient id=\"__DGPICON__SVGXZn9ocJO\" x1=\"-276.128\" x2=\"-274.754\" y1=\"178.682\" y2=\"178.682\" gradientTransform=\"rotate(-26.18 -189.074 647.88)scale(-1 1)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVG2gxeCd7k\" x1=\"-274.314\" x2=\"-271.841\" y1=\"178.887\" y2=\"178.987\" gradientTransform=\"rotate(-26.18 -189.074 647.88)scale(-1 1)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGeRxH6LPb\" x1=\"-273.817\" x2=\"-274.213\" y1=\"189.281\" y2=\"174.569\" gradientTransform=\"rotate(-26.18 -189.074 647.88)scale(-1 1)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#d89530\"/><stop offset=\"1\" stop-color=\"#772d00\"/></linearGradient><linearGradient id=\"__DGPICON__SVG73jqed6L\" x1=\"-274.075\" x2=\"-273.917\" y1=\"174.09\" y2=\"181.459\" gradientTransform=\"rotate(-26.18 -189.074 647.88)scale(-1 1)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVG4QBNucLe\" x1=\"-272.919\" x2=\"-273.315\" y1=\"189.281\" y2=\"174.57\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGXv14weIK\" x1=\"-273.177\" x2=\"-273.019\" y1=\"174.071\" y2=\"181.44\" gradientTransform=\"rotate(-26.18 -189.074 647.88)scale(-1 1)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGz1cqjdyv\" x1=\"-652.29\" x2=\"-651.867\" y1=\"-335.227\" y2=\"-332.867\" gradientTransform=\"rotate(-127.94 -392.31 14.206)scale(1 -1)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffdb57\"/><stop offset=\"1\" stop-color=\"#b55c13\"/></linearGradient><linearGradient id=\"__DGPICON__SVGjFrLsb5T\" x1=\"-665.076\" x2=\"-659.751\" y1=\"157.413\" y2=\"150.922\" gradientTransform=\"rotate(18.83 723.694 -1849.006)scale(-1 1)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGqtklOeYo\" x1=\"-665.161\" x2=\"-664.822\" y1=\"156.114\" y2=\"155.701\" gradientTransform=\"rotate(18.83 723.694 -1849.006)scale(-1 1)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGjZuHwbNh\" x1=\"-665.308\" x2=\"-665.836\" y1=\"156.436\" y2=\"155.32\" gradientTransform=\"rotate(18.83 723.694 -1849.006)scale(-1 1)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVG8hPAsSTj\" x1=\"-655.442\" x2=\"-654.817\" y1=\"147.568\" y2=\"146.776\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGqd0dIejc\" x1=\"-253.999\" x2=\"-254.134\" y1=\"175.1\" y2=\"173.736\" gradientTransform=\"rotate(153.82 -142.976 -47.771)scale(1 -1)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGbRTRziON\" x1=\"-252.571\" x2=\"-252.785\" y1=\"173.138\" y2=\"170.963\" gradientTransform=\"rotate(153.82 -142.976 -47.771)scale(1 -1)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGXpeWx1aE\" x1=\"-257.206\" x2=\"-259.174\" y1=\"169.107\" y2=\"169.787\" gradientTransform=\"rotate(153.82 -142.976 -47.771)scale(1 -1)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGIUwBJc5A\" x1=\"-260.717\" x2=\"-260.77\" y1=\"170.284\" y2=\"171.228\" gradientTransform=\"rotate(153.82 -142.976 -47.771)scale(1 -1)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGGQnUfdbd\" x1=\"-257.835\" x2=\"-257.782\" y1=\"174.993\" y2=\"171.93\" gradientTransform=\"rotate(153.82 -142.976 -47.771)scale(1 -1)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGkqE4j96Z\" x1=\"-263.928\" x2=\"-255.721\" y1=\"171.018\" y2=\"171.018\" gradientTransform=\"rotate(153.82 -142.976 -47.771)scale(1 -1)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGa3T2CVnB\" x1=\"-514.299\" x2=\"-505.041\" y1=\"-57.926\" y2=\"-57.638\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGmofYFcWG\"/><linearGradient id=\"__DGPICON__SVGZeemGbVQ\" x1=\"-512.744\" x2=\"-505.964\" y1=\"-69.496\" y2=\"-67.904\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGmofYFcWG\"/><linearGradient id=\"__DGPICON__SVG4pXW7cns\" x1=\"-514.521\" x2=\"-506.23\" y1=\"-63.966\" y2=\"-60.897\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGmofYFcWG\"/><linearGradient id=\"__DGPICON__SVGz1lPTckx\" x1=\"-662.221\" x2=\"-662.762\" y1=\"-197.167\" y2=\"-197.768\" gradientTransform=\"matrix(-.564 -.911 -.774 .455 -516.113 -497.612)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGcBFu1dvT\" x1=\"-508.354\" x2=\"-503.297\" y1=\"-68.717\" y2=\"-68.373\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGwiYLJd3C\"/><linearGradient id=\"__DGPICON__SVGQvjQIZiB\" x1=\"-508.338\" x2=\"-503.351\" y1=\"-68.723\" y2=\"-68.384\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGmofYFcWG\"/><linearGradient id=\"__DGPICON__SVGeHD5sRoS\" x1=\"-507.26\" x2=\"-507.18\" y1=\"-67.432\" y2=\"-71.05\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVG19IpQcjs\" x1=\"-508.389\" x2=\"-505.627\" y1=\"-57.779\" y2=\"-57.591\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGwiYLJd3C\"/><linearGradient id=\"__DGPICON__SVG85efRhKR\" x1=\"-523.609\" x2=\"-523.966\" y1=\"-69.153\" y2=\"-65.918\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -492.49 -86.99)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGGdFalbTB\" x1=\"-645.333\" x2=\"-642.973\" y1=\"-334.169\" y2=\"-332.091\" href=\"#__DGPICON__SVGkN47ldnx\"/><linearGradient id=\"__DGPICON__SVGOjVzRbET\" x1=\"-525.581\" x2=\"-524.207\" y1=\"-61.015\" y2=\"-61.015\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -492.49 -86.99)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGscgdGcRs\" x1=\"-523.768\" x2=\"-521.294\" y1=\"-60.81\" y2=\"-60.71\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -492.49 -86.99)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGakdwydkv\" x1=\"-523.27\" x2=\"-523.666\" y1=\"-50.416\" y2=\"-65.127\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -492.49 -86.99)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGG6MQr2cb\" x1=\"-523.528\" x2=\"-523.37\" y1=\"-65.606\" y2=\"-58.238\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -492.49 -86.99)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGXRrEmcZQ\" x1=\"-522.372\" x2=\"-522.768\" y1=\"-50.416\" y2=\"-65.127\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -492.49 -86.99)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGi2WMHbKh\" x1=\"-522.631\" x2=\"-522.472\" y1=\"-65.626\" y2=\"-58.257\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -492.49 -86.99)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGLeACibTa\" x1=\"-649.116\" x2=\"-646.827\" y1=\"-328.591\" y2=\"-326.795\" href=\"#__DGPICON__SVGkN47ldnx\"/><linearGradient id=\"__DGPICON__SVG9uUmsbXE\" x1=\"-672.284\" x2=\"-666.958\" y1=\"-187.303\" y2=\"-193.795\" gradientTransform=\"matrix(-.564 -.911 -.774 .455 -516.113 -497.612)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGl9apRboF\" x1=\"-672.369\" x2=\"-672.03\" y1=\"-188.603\" y2=\"-189.016\" gradientTransform=\"matrix(-.564 -.911 -.774 .455 -516.113 -497.612)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGxfFH5fOf\" x1=\"-672.516\" x2=\"-673.044\" y1=\"-188.281\" y2=\"-189.397\" gradientTransform=\"matrix(-.564 -.911 -.774 .455 -516.113 -497.612)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGyqk9tdzU\" x1=\"-662.648\" x2=\"-662.023\" y1=\"-197.148\" y2=\"-197.94\" gradientTransform=\"matrix(-.564 -.911 -.774 .455 -516.113 -497.612)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGRTHl6clb\" x1=\"-503.367\" x2=\"-503.501\" y1=\"-64.607\" y2=\"-65.971\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGlrssAbqp\" x1=\"-502.006\" x2=\"-502.232\" y1=\"-66.361\" y2=\"-68.654\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGyVezad9t\" x1=\"-506.661\" x2=\"-508.629\" y1=\"-70.591\" y2=\"-69.911\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGiefcvdhi\" x1=\"-510.172\" x2=\"-510.224\" y1=\"-69.414\" y2=\"-68.47\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGeRxH6LPb\"/><linearGradient id=\"__DGPICON__SVGfRyLFcLo\" x1=\"-507.289\" x2=\"-507.236\" y1=\"-64.705\" y2=\"-67.768\" gradientTransform=\"matrix(-.947 -.323 -.148 .966 -476.554 -85.464)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGRHRPsqnF\" x1=\"-642.337\" x2=\"-640.048\" y1=\"-337.231\" y2=\"-335.435\" gradientTransform=\"rotate(-127.94 -392.31 14.206)scale(1 -1)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffdb57\"/><stop offset=\"1\" stop-color=\"#b66512\"/></linearGradient><linearGradient id=\"__DGPICON__SVGBtcXhdWx\" x1=\"-628.479\" x2=\"-627.663\" y1=\"-215.005\" y2=\"-209.203\" gradientTransform=\"rotate(37.85 2.12 -998.377)scale(-1 1)\" href=\"#__DGPICON__SVGmofYFcWG\"/><linearGradient id=\"__DGPICON__SVGarE9ubhv\" x1=\"-633.006\" x2=\"-622.552\" y1=\"-211.18\" y2=\"-211.18\" gradientTransform=\"rotate(37.85 2.12 -998.377)scale(-1 1)\" href=\"#__DGPICON__SVGwiYLJd3C\"/><linearGradient id=\"__DGPICON__SVGyIQIicum\" x1=\"-627.491\" x2=\"-627.755\" y1=\"-215.556\" y2=\"-211.648\" gradientTransform=\"rotate(37.85 2.12 -998.377)scale(-1 1)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVGKb76ycsW\" x1=\"-627.796\" x2=\"-627.057\" y1=\"-210.705\" y2=\"-205.186\" gradientTransform=\"rotate(37.85 2.12 -998.377)scale(-1 1)\" href=\"#__DGPICON__SVGfIPENsHv\"/><linearGradient id=\"__DGPICON__SVG8hmImb4h\" x1=\"245.815\" x2=\"245.923\" y1=\"139.434\" y2=\"136.367\" gradientTransform=\"rotate(7.312 1187.515 -1764.249)\" href=\"#__DGPICON__SVGwiYLJd3C\"/><linearGradient id=\"__DGPICON__SVGCEzC1cyq\" x1=\"-626.269\" x2=\"-627.643\" y1=\"-215.112\" y2=\"-213.078\" gradientTransform=\"rotate(37.85 2.12 -998.377)scale(-1 1)\" href=\"#__DGPICON__SVGfIPENsHv\"/></defs><path fill=\"url(#__DGPICON__SVGmofYFcWG)\" d=\"m13.372 16.416l5.013-2.464l.93 1.893l-.054.238l-2.048 1.007l5.706 11.611l-.221.359l-1.543.758l-.82-.45l-5.459-11.109l-.482.237z\"/><path fill=\"url(#__DGPICON__SVGnJ3pCbpX)\" d=\"m9.24 13.619l1.2 2.44c.072.146.416.252.617.292l2.634.683l4.609-2.268l.867-2.342a.68.68 0 0 0 .036-.674l-1.2-2.44a.55.55 0 0 0-.452-.3l-4.44.136a1.28 1.28 0 0 0-1.018.541l-2.72 3.162a.92.92 0 0 0-.133.77m1.932.033a.36.36 0 0 1 .011-.334l1.84-2.215a.83.83 0 0 1 .66-.351l2.877-.088a.36.36 0 0 1 .293.2l.356.725a.242.242 0 0 1-.139.339L11.833 14.5a.224.224 0 0 1-.3-.121Z\"/><path fill=\"url(#__DGPICON__SVGMrBZzbeY)\" d=\"m9.426 13.209l1.2 2.44c.072.146.416.252.617.292l2.7.547l.782 1.591l.375-.179l5.459 11.109l.82.451l1.541-.76l-.017-.683l.868-1.458l-.241-.49l-.54.1l-.31-.63l.41-.366l-.59-1.199l-.593-.006l-.277-.564l.357-.473l-.3-.607l-.568.043l-.432-.879l.382-.423l-.161-.327a.87.87 0 0 1-.659-1.342l-.345-.7a1.347 1.347 0 0 1-.962-1.956l-.29-.591l.631-.31l-.773-1.546l.843-2.277a.68.68 0 0 0 .035-.674l-1.2-2.44a.55.55 0 0 0-.453-.3l-4.435.131a1.28 1.28 0 0 0-1.018.541l-2.84 3.419a.55.55 0 0 0-.016.516m1.932.033a.36.36 0 0 1 .011-.334l1.84-2.215a.83.83 0 0 1 .66-.351l2.877-.088a.35.35 0 0 1 .293.2l.356.725a.242.242 0 0 1-.139.339l-5.238 2.574a.224.224 0 0 1-.3-.121Z\"/><path fill=\"url(#__DGPICON__SVGfIPENsHv)\" d=\"m14.47 18.381l.276-.318l.335-.164l-.139.245z\"/><path fill=\"url(#__DGPICON__SVGwiYLJd3C)\" d=\"m11.259 15.828l2.776.6l4.38-2.152l.865-2.339a.58.58 0 0 0 .024-.567L18.1 8.917a.44.44 0 0 0-.367-.246l-4.438.13a1.17 1.17 0 0 0-.938.5L9.52 12.725a.45.45 0 0 0-.011.414l1.206 2.453a1 1 0 0 0 .544.236m.354-1.836l-.358-.729a.46.46 0 0 1 .013-.434v-.008l1.853-2.221a.92.92 0 0 1 .739-.389l2.881-.084a.47.47 0 0 1 .392.257l.358.729c.005.009.19.3-.187.481l-5.244 2.577c-.272.129-.44-.164-.447-.179\"/><path fill=\"url(#__DGPICON__SVGESyEmRVH)\" d=\"M11.246 15.738c.006 0 2.438.51 2.751.591l4.354-2.139l.878-2.336a.47.47 0 0 0 .015-.458l-1.208-2.458a.34.34 0 0 0-.282-.187l-4.454.141a1.08 1.08 0 0 0-.864.46l-2.863 3.436a.34.34 0 0 0-.008.313l1.206 2.454a1.1 1.1 0 0 0 .475.183m.245-1.7l-.355-.723a.57.57 0 0 1 .018-.535v-.008l.01-.015l1.865-2.241a1.03 1.03 0 0 1 .824-.43l2.9-.091a.57.57 0 0 1 .492.316l.359.73a.46.46 0 0 1 .027.338a.48.48 0 0 1-.265.286l-5.287 2.6a.42.42 0 0 1-.331.025a.5.5 0 0 1-.258-.248Z\"/><path fill=\"url(#__DGPICON__SVGREjbOeQM)\" d=\"M11.268 15.663c.009 0 2.53.528 2.722.577l4.3-2.113l.878-2.314a.42.42 0 0 0 .01-.4l-1.2-2.436a.28.28 0 0 0-.237-.156l-4.433.149a1.03 1.03 0 0 0-.82.437l-2.353 2.823l-.5.595a.28.28 0 0 0 0 .254l1.193 2.421a1.2 1.2 0 0 0 .44.163m.14-1.529l-.351-.715a.57.57 0 0 1-.011-.56l1.959-2.36a1.08 1.08 0 0 1 .86-.447l2.887-.1a.63.63 0 0 1 .538.341l.356.724a.54.54 0 0 1-.309.773l-5.267 2.588a.48.48 0 0 1-.662-.243Z\"/><path fill=\"url(#__DGPICON__SVG027WPcDj)\" d=\"m18.463 14.345l.7 1.433l-.653.321l.319.649a1.428 1.428 0 0 0 1 2.043l.3.619a.958.958 0 0 0 .706 1.436l.107.218l-.39.428l.5 1.011l.577-.047l.239.485l-.366.478l.336.683h.6l.523 1.065l-.419.371l.382.777l.549-.1l.181.368A96 96 0 0 1 22.8 28v.638l-1.342.659l-.729-.414l-5.488-11.176l-.467.23l-.7-1.433Z\"/><path fill=\"url(#__DGPICON__SVGyornQdTp)\" d=\"M14.289 15.413h4.622v1.4h-4.622z\" transform=\"rotate(-26.171 16.6 16.113)\"/><path fill=\"url(#__DGPICON__SVGkN47ldnx)\" d=\"m18.128 14.582l-.8.392l.617 1.256l.8-.392Zm-1.319.648l.617 1.256l.308-.152l-.617-1.256Z\"/><path fill=\"url(#__DGPICON__SVGXZn9ocJO)\" d=\"m18.4 16.123l.308.628a1.523 1.523 0 0 0 1.037 2.11l.263.535a1.052 1.052 0 0 0 .744 1.513l.054.111l-.381.423l.557 1.134l.567-.043l.177.36l-.357.472l.392.8l.591.006l.456.929l-.409.366l.45.917l.539-.1l.12.243L22.634 28l-1.027.5l-5.525-11.235Z\"/><path fill=\"url(#__DGPICON__SVG2gxeCd7k)\" d=\"m17.141 16.745l5.528 11.248l.046.511l-1.247.613l-.613-.349l-5.483-11.154Z\"/><path fill=\"url(#__DGPICON__SVGeRxH6LPb)\" d=\"m22.287 28.694l.427-.21l-4.794-9.754l-1.028-1.554l.602 1.764z\"/><path fill=\"url(#__DGPICON__SVG73jqed6L)\" d=\"M16.892 17.176L22.5 28.589l-.213.105l-4.793-9.754z\"/><path fill=\"url(#__DGPICON__SVG4QBNucLe)\" d=\"m21.481 29.09l.427-.209l-4.794-9.755l-1.028-1.554l.602 1.764z\"/><path fill=\"url(#__DGPICON__SVGXv14weIK)\" d=\"m16.086 17.572l5.608 11.413l-.213.105l-4.793-9.754z\"/><path fill=\"url(#__DGPICON__SVGz1cqjdyv)\" d=\"m18.27 16.189l-.411.2l5.285 10.755l.279-.47l-.181-.369l-.386.072l-.45-.917l.294-.26l-.508-1.034h-.424l-.392-.8l.256-.338l-.237-.482l-.407.031l-.557-1.134l.273-.3l-.143-.291a1.04 1.04 0 0 1-.619-1.259l-.391-.8a1.505 1.505 0 0 1-.906-1.844Zm-.68.334l5.371 10.929l.108-.182l-5.319-10.825Z\"/><path fill=\"url(#__DGPICON__SVGjFrLsb5T)\" d=\"m15.018 18.247l5.356 10.997l.196-.273l-5.391-11.032z\"/><path fill=\"url(#__DGPICON__SVGqtklOeYo)\" d=\"m20.436 29.315l.211-.291l.705.361l-.203.294z\"/><path fill=\"url(#__DGPICON__SVGjZuHwbNh)\" d=\"m21.446 29.41l-.179.26l1.382-.659l.131-.241z\"/><path fill=\"url(#__DGPICON__SVG8hPAsSTj)\" d=\"m14.029 16.673l-.225.388l.601 1.293l.297-.354z\"/><path fill=\"url(#__DGPICON__SVGqd0dIejc)\" d=\"m13.946 16.506l-.239.432l-2.944-.761l.124-.345z\"/><path fill=\"url(#__DGPICON__SVGbRTRziON)\" d=\"M9.359 13s-.145.444-.087.563l1.212 2.465l.2-.384Z\"/><path fill=\"url(#__DGPICON__SVGXpeWx1aE)\" d=\"m16.683 10.624l.1-.327l-2.963.095a.9.9 0 0 0-.51.251l-.007.165a2 2 0 0 1 .394-.1Z\"/><path fill=\"url(#__DGPICON__SVGIUwBJc5A)\" d=\"M16.83 10.309a.33.33 0 0 1 .17.137l.382.762l-.164.279l-.341-.693c-.023-.047-.108-.145-.147-.149Z\"/><path fill=\"url(#__DGPICON__SVGGQnUfdbd)\" d=\"m11.237 13.786l.171.348a.48.48 0 0 0 .661.248l5.267-2.588a.54.54 0 0 0 .309-.773l-.153-.31l1.08-.531l.606 1.232a.42.42 0 0 1-.01.4l-.878 2.314l-4.3 2.113c-.191-.049-2.713-.575-2.722-.577a1.2 1.2 0 0 1-.439-.16l-.6-1.222Z\"/><path fill=\"url(#__DGPICON__SVGkqE4j96Z)\" d=\"m13.377 8.968l.532 1.084l.539-.018l-.532-1.084Zm2.306-.077l-1.395.047l.533 1.084l1.4-.046Zm1.471 2.994l-1.142.561l1.106 2.25l1.142-.561Zm-1.447.711l-.441.217l1.106 2.251l.441-.217Z\"/><path fill=\"url(#__DGPICON__SVGa3T2CVnB)\" d=\"m10.65 14.159l5.287 1.803L15.623 18l-.173.134l-2.16-.737l-1.921 12.501l-.371.102l-1.627-.555l-.395-.913l1.838-11.961l-.508-.173z\"/><path fill=\"url(#__DGPICON__SVGZeemGbVQ)\" d=\"m8.951 9.175l-.542 2.747a.57.57 0 0 0 .175.452l1.976 2.461l4.866 1.659l1.969-1.077a.535.535 0 0 0 .4-.463l.4-2.627a.66.66 0 0 0-.188-.544L14.453 8.7a1.31 1.31 0 0 0-1.1-.337l-3.874.345a.71.71 0 0 0-.528.467m1.5 1.407a.28.28 0 0 1 .192-.234l2.633-.256a.93.93 0 0 1 .724.315l2.3 2a.43.43 0 0 1 .121.352l-.1.651s-.027.237-.3.146L10.5 11.667a.27.27 0 0 1-.172-.305Z\"/><path fill=\"url(#__DGPICON__SVG4pXW7cns)\" d=\"m9.322 9.01l-.4 2.627c-.024.157.188.481.324.653l1.817 2.33l-.263 1.714l.392.134l-1.843 11.959l.395.914l1.627.555l.363-.507l1.483-.436l.081-.528l-.479-.314l.1-.678l.523.028l.2-1.283l-.461-.428l.093-.608l.54-.087l.1-.653l-.469-.375l.145-.946l.532-.034l.054-.352a1.05 1.05 0 0 1-.29-.859a.69.69 0 0 1 .512-.585l.116-.756a1.6 1.6 0 0 1-.364-1.232a1.07 1.07 0 0 1 .688-.874l.1-.636l.666.227l.246-1.674l1.915-1.047a.535.535 0 0 0 .4-.463l.4-2.627a.66.66 0 0 0-.188-.544l-3.556-3.08a1.31 1.31 0 0 0-1.1-.336l-4.109.445a.43.43 0 0 0-.29.356m1.5 1.407a.28.28 0 0 1 .192-.234l2.663-.289a.85.85 0 0 1 .711.218l2.3 2a.43.43 0 0 1 .122.352l-.12.781s-.027.237-.3.146L10.871 11.5a.27.27 0 0 1-.171-.3Z\"/><path fill=\"url(#__DGPICON__SVGz1lPTckx)\" d=\"m10.428 16.37l.392-.033l.353.12l-.244.078z\"/><path fill=\"url(#__DGPICON__SVGcBFu1dvT)\" d=\"m9.317 12.221l1.846 2.421l4.619 1.575l1.967-1.076a.45.45 0 0 0 .331-.393l.406-2.641a.53.53 0 0 0-.152-.441l-3.552-3.083a1.2 1.2 0 0 0-1.011-.31l-4.109.453a.35.35 0 0 0-.237.292l-.405 2.641a1.26 1.26 0 0 0 .297.562m1.289-1.077l.121-.785a.37.37 0 0 1 .25-.305h.008l2.675-.295a.95.95 0 0 1 .794.247l2.3 2a.56.56 0 0 1 .166.467l-.121.785c0 .01-.014.35-.411.215l-5.53-1.886a.42.42 0 0 1-.252-.443\"/><path fill=\"url(#__DGPICON__SVGQvjQIZiB)\" d=\"M9.356 12.146c0 .005 1.63 2.115 1.831 2.4l4.591 1.566l1.974-1.065a.37.37 0 0 0 .264-.321l.406-2.646a.4.4 0 0 0-.118-.338l-3.571-3.091a1.12 1.12 0 0 0-.931-.285l-4.133.444a.27.27 0 0 0-.179.221l-.406 2.642a1.4 1.4 0 0 0 .272.473m1.126-1.054l.12-.778a.45.45 0 0 1 .309-.375h.024l2.7-.29a1.07 1.07 0 0 1 .883.278l2.324 2.01a.7.7 0 0 1 .212.581l-.121.786a.38.38 0 0 1-.165.265a.42.42 0 0 1-.365.018l-5.576-1.9a.5.5 0 0 1-.273-.219a.55.55 0 0 1-.072-.377Z\"/><path fill=\"url(#__DGPICON__SVGeHD5sRoS)\" d=\"M9.415 12.108c.006.008 1.693 2.194 1.816 2.366l4.535 1.546l1.963-1.048a.33.33 0 0 0 .228-.282l.4-2.623a.34.34 0 0 0-.1-.283L14.7 8.719a1.07 1.07 0 0 0-.884-.271l-3.4.359l-.716.076a.23.23 0 0 0-.142.183s-.4 2.594-.4 2.611a1.5 1.5 0 0 0 .257.431m.952-1.007l.118-.77a.46.46 0 0 1 .3-.414l2.836-.308a1.12 1.12 0 0 1 .921.292l2.316 2a.76.76 0 0 1 .234.632s-.1.633-.12.779c-.034.219-.191.5-.668.339l-5.555-1.894a.584.584 0 0 1-.383-.657Z\"/><path fill=\"url(#__DGPICON__SVG19IpQcjs)\" d=\"m15.781 16.3l-.237 1.543l-.689-.235l-.107.7a1.16 1.16 0 0 0-.7.917a1.72 1.72 0 0 0 .367 1.283l-.1.666a.77.77 0 0 0-.527.634a1.15 1.15 0 0 0 .29.912l-.036.235l-.542.031l-.167 1.088l.479.379l-.08.522l-.55.084l-.113.736l.471.432l-.176 1.146l-.532-.031l-.128.837l.488.317l-.061.4c-.09.027-1.455.411-1.455.411l-.352.462l-1.424-.483l-.343-.822l1.843-12.03l-.493-.168l.237-1.543Z\"/><path fill=\"url(#__DGPICON__SVG85efRhKR)\" d=\"m11.056 16.181l4.374 1.491l.208-1.352l-4.374-1.492z\"/><path fill=\"url(#__DGPICON__SVGGdFalbTB)\" d=\"m15.388 16.234l-.842-.287l-.207 1.353l.841.287ZM14 15.76l-.208 1.353l.325.111l.208-1.353Z\"/><path fill=\"url(#__DGPICON__SVGOjVzRbET)\" d=\"m14.756 17.55l-.1.676a1.25 1.25 0 0 0-.7.957A1.85 1.85 0 0 0 14.3 20.5l-.089.576a.84.84 0 0 0-.525.678a1.26 1.26 0 0 0 .275.95l-.018.119l-.531.034l-.188 1.221l.469.375l-.06.388l-.539.087l-.132.858l.46.427l-.154 1l-.522-.028l-.152.987l.478.314l-.04.262l-1.506.443l-1.083-.369l1.86-12.1Z\"/><path fill=\"url(#__DGPICON__SVGscgdGcRs)\" d=\"m13.423 17.1l-1.86 12.1l-.246.4L10 29.16l-.289-.692l1.845-12.009Z\"/><path fill=\"url(#__DGPICON__SVGakdwydkv)\" d=\"m10.877 29.44l.45.154l1.614-10.501l.049-1.863l-.499 1.709z\"/><path fill=\"url(#__DGPICON__SVGG6MQr2cb)\" d=\"m12.99 17.23l-1.888 12.287l-.225-.077l1.614-10.501z\"/><path fill=\"url(#__DGPICON__SVGXRrEmcZQ)\" d=\"m10.028 29.151l.449.153l1.614-10.501l.049-1.863l-.499 1.71z\"/><path fill=\"url(#__DGPICON__SVGi2WMHbKh)\" d=\"m12.14 16.94l-1.887 12.287l-.225-.076l1.613-10.501z\"/><path fill=\"url(#__DGPICON__SVGLeACibTa)\" d=\"m14.615 17.5l-.433-.148l-1.782 11.58l.478-.14l.061-.4l-.339-.222l.152-.987l.374.02l.171-1.113l-.33-.306l.132-.858l.387-.062l.08-.519l-.336-.268l.188-1.221l.381-.024l.048-.314a1.2 1.2 0 0 1-.154-.766a.85.85 0 0 1 .363-.59l.132-.856a1.8 1.8 0 0 1-.231-1.123a1.26 1.26 0 0 1 .536-.861Zm-.717-.244L12.09 29.024l.185-.054l1.791-11.655Z\"/><path fill=\"url(#__DGPICON__SVG9uUmsbXE)\" d=\"M10.932 16.665L9.075 28.47l.303-.058l1.85-11.855z\"/><path fill=\"url(#__DGPICON__SVGl9apRboF)\" d=\"m9.085 28.566l.325-.06l.354.766l-.321.068z\"/><path fill=\"url(#__DGPICON__SVGxfFH5fOf)\" d=\"m9.823 29.357l-.283.06l1.447.513l.235-.081z\"/><path fill=\"url(#__DGPICON__SVGyqk9tdzU)\" d=\"m11.024 14.816l-.391.12l-.241 1.367l.429-.043z\"/><path fill=\"url(#__DGPICON__SVGRTHl6clb)\" d=\"m11.05 14.636l-.425.141l-2.084-2.606l.483-.214z\"/><path fill=\"url(#__DGPICON__SVGlrssAbqp)\" d=\"M9.384 8.813s-.358.218-.378.346l-.546 2.773l.51-.253Z\"/><path fill=\"url(#__DGPICON__SVGyVezad9t)\" d=\"m16.435 12.332l.256-.168l-2.375-2.052a.96.96 0 0 0-.538-.183l-.1.115a2 2 0 0 1 .362.211Z\"/><path fill=\"url(#__DGPICON__SVGiefcvdhi)\" d=\"M16.724 12.208a.4.4 0 0 1 .058.221c-.016.1-.112.774-.12.825l-.283.085l.115-.747a.4.4 0 0 0-.033-.213Z\"/><path fill=\"url(#__DGPICON__SVGfRyLFcLo)\" d=\"m10.424 10.725l-.058.375a.584.584 0 0 0 .381.653l5.553 1.894c.478.163.634-.12.668-.339l.051-.334l1.139.388l-.2 1.327a.33.33 0 0 1-.228.282l-1.963 1.048l-4.535-1.546a358 358 0 0 0-1.816-2.366a1.5 1.5 0 0 1-.257-.43l.2-1.315Z\"/><path fill=\"url(#__DGPICON__SVGRHRPsqnF)\" d=\"m14.756 8.764l-.179 1.166l.432.373l.179-1.167Zm1.851 1.595l-1.119-.965l-.179 1.167l1.119.965Zm-.5 3.223l-1.2-.411l-.372 2.423l1.2.411Zm-1.526-.52l-.461-.162l-.372 2.423l.465.159Z\"/><path fill=\"url(#__DGPICON__SVGBtcXhdWx)\" d=\"M9.936 2.733c2.042-1.441 5.206-.715 7.065 1.8A6.17 6.17 0 0 1 18.27 9.1c-.219-.73-1.023-.427-1.664-.441a4.1 4.1 0 0 0-.763-3.207C14.6 3.778 12.41 3.1 11.07 4.094s-1.382 3.253-.143 4.929a3.68 3.68 0 0 0 3.69 1.742c.521.444 1 .871 1.507 1.329c-1.84 1.134-4.8.334-6.51-1.982c-1.86-2.512-1.93-5.789.322-7.379\"/><path fill=\"url(#__DGPICON__SVGarE9ubhv)\" d=\"M9.956 2.841c1.939-1.405 5.111-.606 6.892 1.8a6.6 6.6 0 0 1 1.38 4.159c-.293-.387-1.035-.264-1.466-.211a4.6 4.6 0 0 0-.823-3.272c-1.317-1.78-3.546-2.373-4.97-1.32s-1.442 3.27-.125 5.051a4.03 4.03 0 0 0 3.842 1.905c.4.35.79.715 1.185 1.073c-1.982 1.012-4.528.084-6.123-2.073c-1.782-2.408-1.897-5.587.208-7.112\"/><path fill=\"url(#__DGPICON__SVGyIQIicum)\" d=\"M10.1 2.918c1.855-1.345 4.971-.5 6.675 1.8a6.64 6.64 0 0 1 1.361 3.89a1.87 1.87 0 0 0-1.148-.126a4.56 4.56 0 0 0-.946-3.23c-1.394-1.885-3.6-2.472-5.1-1.357s-1.511 3.279-.171 5.2a4.08 4.08 0 0 0 3.976 1.973c.323.285.639.58.957.871c-1.939.959-4.394-.1-5.893-2.131C8.1 7.511 8.1 4.363 10.1 2.918\"/><path fill=\"url(#__DGPICON__SVGKb76ycsW)\" d=\"M9.684 3.412C8.6 4.969 8.825 7.5 10.3 9.494c1.413 1.911 3.466 2.885 5.249 2.443c-1.694.674-4.074-.233-5.554-2.235c-1.54-2.081-1.66-4.783-.311-6.29\"/><path fill=\"url(#__DGPICON__SVG8hmImb4h)\" d=\"M9.9 3.511c-.171.291.366.627.547.144a4.3 4.3 0 0 1 2.442-1.222A3.56 3.56 0 0 0 9.9 3.511m.077.506a.244.244 0 1 0 .211.273a.243.243 0 0 0-.213-.273Z\"/><path fill=\"url(#__DGPICON__SVGCEzC1cyq)\" d=\"M11.035 3.763c1.4-1.181 3.664-.647 5.163 1.132a4.72 4.72 0 0 1 1.2 3.542q-.204.021-.411.048a4.56 4.56 0 0 0-.946-3.23c-1.394-1.885-3.6-2.472-5.1-1.357q-.105.08-.2.167a3 3 0 0 1 .294-.302\"/>" },
		"file-type-log": { w: 32, h: 32, body: "<path fill=\"#00bd02\" d=\"M29.4 27.6H2.5V4.5h26.9Zm-25.9-1h24.9V5.5H3.5Z\"/><path fill=\"#00bd02\" d=\"M2.5 5.5h26.9v1.9H2.5zm8.833 4H19.5v1h-8.167zm0 2.583h12.5v1h-12.5zm0 2.667H21.95v1H11.333zm0 2.833H25.5v1H11.333zm0 2.917h9.834v1h-9.834zm.167 2.583h12.167v1H11.5zM5.5 9.5h4.333v1H5.5zm0 2.583h4.333v1H5.5z\"/><path fill=\"#00bd02\" d=\"M5.5 12.083h4.333v1H5.5zm0 2.584h4.333v1H5.5zm0 2.583h4.333v1H5.5zm0 3.25h4.333v1H5.5zm0 2.583h4.333v1H5.5z\"/>" },
		"file-type-lua": { w: 32, h: 32, body: "<path fill=\"gray\" d=\"m16.5 30l-.011-.321c.4-.014.8-.045 1.19-.094l.039.319c-.406.048-.818.08-1.218.096m-1.222-.011c-.4-.021-.814-.061-1.216-.118l.045-.318c.393.055.793.094 1.188.115Zm3.642-.289l-.067-.314c.387-.083.776-.184 1.155-.3l.094.307c-.388.118-.786.222-1.182.307m-6.063-.053q-.599-.137-1.177-.326l.1-.306c.377.122.764.23 1.15.319Zm8.4-.665l-.121-.3c.364-.148.728-.314 1.08-.493h.006l.145.286q-.553.28-1.114.507Zm-10.718-.088a14 14 0 0 1-1.1-.524l.15-.284c.35.186.713.358 1.078.512Zm12.893-1.021l-.17-.273c.337-.21.668-.437.984-.675l.193.257q-.494.367-1.011.691Zm-15.053-.122c-.341-.22-.676-.459-1-.708l.2-.253c.312.243.64.476.972.691Zm17-1.346l-.215-.239q.443-.4.851-.836l.235.219c-.278.297-.571.585-.872.851Zm-18.925-.153c-.3-.276-.585-.569-.856-.87l.239-.215c.265.294.547.58.836.85Zm20.587-1.632l-.253-.2c.244-.312.476-.639.692-.972l.27.175q-.333.516-.709.997M4.82 24.439a14 14 0 0 1-.692-1.007l.272-.17c.21.337.438.668.676.984Zm23.547-1.867l-.284-.151c.186-.35.358-.713.513-1.078l.3.125a15 15 0 0 1-.528 1.104Zm-24.841-.2l-.006-.012a13 13 0 0 1-.5-1.1l.3-.121c.147.362.312.724.491 1.074l.006.012Zm25.794-2.047l-.306-.1c.122-.377.23-.764.319-1.15l.313.072c-.091.396-.2.792-.326 1.178m-26.712-.218c-.12-.388-.223-.786-.308-1.182l.314-.067c.083.387.184.776.3 1.155Zm27.262-2.161l-.318-.045c.056-.393.094-.793.115-1.188l.321.017a14 14 0 0 1-.118 1.216M2.1 17.72c-.05-.4-.082-.812-.1-1.218l.321-.011c.014.4.046.8.094 1.19Zm27.582-2.2c-.014-.4-.045-.8-.093-1.19l.319-.039c.049.4.082.813.1 1.218ZM2.331 15.3l-.321-.02c.021-.405.061-.814.117-1.216l.318.045c-.055.391-.093.791-.114 1.191m27.057-2.144a14 14 0 0 0-.3-1.155l.312-.101c.119.388.223.786.307 1.183Zm-26.725-.222l-.313-.072q.137-.599.326-1.177l.306.1c-.123.376-.23.763-.319 1.149m26.026-2.062a13 13 0 0 0-.5-1.086l.286-.146c.185.363.355.736.507 1.111ZM3.4 10.665l-.3-.125c.158-.374.334-.745.524-1.1l.284.15c-.184.347-.356.71-.508 1.075m1.113-2.108l-.27-.174q.332-.513.707-1l.254.2q-.367.475-.691.974m1.464-1.881l-.235-.219c.276-.3.569-.585.87-.857l.215.239c-.294.261-.58.547-.85.837m1.77-1.6l-.193-.257c.323-.244.662-.477 1.007-.692l.17.272c-.337.215-.668.442-.984.68Zm15.705-.558l-.018-.012l.175-.27l.018.011Zm-1.047-.616a13 13 0 0 0-1.078-.512l.125-.3c.374.158.745.334 1.1.524ZM9.769 3.815l-.146-.286l.018-.009c.356-.181.724-.349 1.093-.5l.121.3c-.361.147-.72.311-1.068.488Zm10.44-.838a13 13 0 0 0-1.151-.317l.072-.313q.6.137 1.178.325Zm-8.229-.06l-.094-.307a14 14 0 0 1 1.182-.308l.067.314a14 14 0 0 0-1.155.301m5.9-.473a14 14 0 0 0-1.188-.113l.016-.321c.405.021.814.059 1.216.115Zm-3.572-.026l-.04-.319c.4-.05.812-.083 1.218-.1l.012.321c-.392.017-.793.049-1.186.098Z\"/><circle cx=\"16\" cy=\"15.998\" r=\"10.708\" fill=\"navy\"/><circle cx=\"20.435\" cy=\"11.562\" r=\"3.136\" fill=\"#fff\"/><circle cx=\"26.708\" cy=\"5.29\" r=\"3.137\" fill=\"navy\"/><path fill=\"#fff\" d=\"M13.1 21.352v-.79H9.629v-6.236h-.9v7.026zm4.816 0V16.3h-.8v2.785c0 1.031-.54 1.706-1.378 1.706A.95.95 0 0 1 14.7 19.8v-3.5h-.8v3.817c0 .838.626 1.378 1.609 1.378a1.86 1.86 0 0 0 1.687-.925v.781h.723m5.872-.018v-.607a.7.7 0 0 1-.173.019c-.279 0-.434-.145-.434-.4v-2.809c0-.9-.655-1.378-1.9-1.378c-1.224 0-1.976.472-2.024 1.638h.81c.067-.617.434-.9 1.185-.9c.723 0 1.128.27 1.128.752v.212c0 .337-.2.482-.838.559a5.8 5.8 0 0 0-1.619.308a1.33 1.33 0 0 0-.887 1.311c0 .916.636 1.455 1.658 1.455a2.36 2.36 0 0 0 1.715-.742a.855.855 0 0 0 .829.665a2 2 0 0 0 .549-.087m-1.407-1.725a1.366 1.366 0 0 1-1.513 1.185c-.626 0-.993-.222-.993-.771c0-.53.357-.761 1.214-.887a4 4 0 0 0 1.291-.279v.752\"/>" },
		"file-type-markdown": { w: 32, h: 32, body: "<path fill=\"none\" stroke=\"#755838\" d=\"M2.5 7.955h27v16.091h-27z\"/><path fill=\"#755838\" d=\"M5.909 20.636v-9.272h2.727l2.728 3.409l2.727-3.409h2.727v9.272h-2.727v-5.318l-2.727 3.409l-2.728-3.409v5.318zm17.046 0l-4.091-4.5h2.727v-4.772h2.727v4.772h2.727z\"/>" },
		"file-type-npm": { w: 32, h: 32, body: "<path fill=\"#c12127\" d=\"M2 2h28v28H2\"/><path fill=\"#fff\" d=\"M7.25 7.25h17.5v17.5h-3.5v-14H16v14H7.25\"/>" },
		"file-type-pdf2": { w: 32, h: 32, body: "<path fill=\"#909090\" d=\"m24.1 2.072l5.564 5.8v22.056H8.879V30h20.856V7.945z\"/><path fill=\"#f4f4f4\" d=\"M24.031 2H8.808v27.928h20.856V7.873z\"/><path fill=\"#7a7b7c\" d=\"M8.655 3.5h-6.39v6.827h20.1V3.5z\"/><path fill=\"#dd2025\" d=\"M22.472 10.211H2.395V3.379h20.077z\"/><path fill=\"#464648\" d=\"M9.052 4.534H7.745v4.8h1.028V7.715L9 7.728a2 2 0 0 0 .647-.117a1.4 1.4 0 0 0 .493-.291a1.2 1.2 0 0 0 .335-.454a2.1 2.1 0 0 0 .105-.908a2.2 2.2 0 0 0-.114-.644a1.17 1.17 0 0 0-.687-.65a2 2 0 0 0-.409-.104a2 2 0 0 0-.319-.026m-.189 2.294h-.089v-1.48h.193a.57.57 0 0 1 .459.181a.92.92 0 0 1 .183.558c0 .246 0 .469-.222.626a.94.94 0 0 1-.524.114m3.671-2.306c-.111 0-.219.008-.295.011L12 4.538h-.78v4.8h.918a2.7 2.7 0 0 0 1.028-.175a1.7 1.7 0 0 0 .68-.491a1.9 1.9 0 0 0 .373-.749a3.7 3.7 0 0 0 .114-.949a4.4 4.4 0 0 0-.087-1.127a1.8 1.8 0 0 0-.4-.733a1.6 1.6 0 0 0-.535-.4a2.4 2.4 0 0 0-.549-.178a1.3 1.3 0 0 0-.228-.017m-.182 3.937h-.1V5.392h.013a1.06 1.06 0 0 1 .6.107a1.2 1.2 0 0 1 .324.4a1.3 1.3 0 0 1 .142.526c.009.22 0 .4 0 .549a3 3 0 0 1-.033.513a1.8 1.8 0 0 1-.169.5a1.1 1.1 0 0 1-.363.36a.67.67 0 0 1-.416.106m5.08-3.915H15v4.8h1.028V7.434h1.3v-.892h-1.3V5.43h1.4v-.892\"/><path fill=\"#dd2025\" d=\"M21.781 20.255s3.188-.578 3.188.511s-1.975.646-3.188-.511m-2.357.083a7.5 7.5 0 0 0-1.473.489l.4-.9c.4-.9.815-2.127.815-2.127a14 14 0 0 0 1.658 2.252a13 13 0 0 0-1.4.288Zm-1.262-6.5c0-.949.307-1.208.546-1.208s.508.115.517.939a10.8 10.8 0 0 1-.517 2.434a4.4 4.4 0 0 1-.547-2.162Zm-4.649 10.516c-.978-.585 2.051-2.386 2.6-2.444c-.003.001-1.576 3.056-2.6 2.444M25.9 20.895c-.01-.1-.1-1.207-2.07-1.16a14 14 0 0 0-2.453.173a12.5 12.5 0 0 1-2.012-2.655a11.8 11.8 0 0 0 .623-3.1c-.029-1.2-.316-1.888-1.236-1.878s-1.054.815-.933 2.013a9.3 9.3 0 0 0 .665 2.338s-.425 1.323-.987 2.639s-.946 2.006-.946 2.006a9.6 9.6 0 0 0-2.725 1.4c-.824.767-1.159 1.356-.725 1.945c.374.508 1.683.623 2.853-.91a23 23 0 0 0 1.7-2.492s1.784-.489 2.339-.623s1.226-.24 1.226-.24s1.629 1.639 3.2 1.581s1.495-.939 1.485-1.035\"/><path fill=\"#909090\" d=\"M23.954 2.077V7.95h5.633z\"/><path fill=\"#f4f4f4\" d=\"M24.031 2v5.873h5.633z\"/><path fill=\"#fff\" d=\"M8.975 4.457H7.668v4.8H8.7V7.639l.228.013a2 2 0 0 0 .647-.117a1.4 1.4 0 0 0 .493-.291a1.2 1.2 0 0 0 .332-.454a2.1 2.1 0 0 0 .105-.908a2.2 2.2 0 0 0-.114-.644a1.17 1.17 0 0 0-.687-.65a2 2 0 0 0-.411-.105a2 2 0 0 0-.319-.026m-.189 2.294h-.089v-1.48h.194a.57.57 0 0 1 .459.181a.92.92 0 0 1 .183.558c0 .246 0 .469-.222.626a.94.94 0 0 1-.524.114m3.67-2.306c-.111 0-.219.008-.295.011l-.235.006h-.78v4.8h.918a2.7 2.7 0 0 0 1.028-.175a1.7 1.7 0 0 0 .68-.491a1.9 1.9 0 0 0 .373-.749a3.7 3.7 0 0 0 .114-.949a4.4 4.4 0 0 0-.087-1.127a1.8 1.8 0 0 0-.4-.733a1.6 1.6 0 0 0-.535-.4a2.4 2.4 0 0 0-.549-.178a1.3 1.3 0 0 0-.228-.017m-.182 3.937h-.1V5.315h.013a1.06 1.06 0 0 1 .6.107a1.2 1.2 0 0 1 .324.4a1.3 1.3 0 0 1 .142.526c.009.22 0 .4 0 .549a3 3 0 0 1-.033.513a1.8 1.8 0 0 1-.169.5a1.1 1.1 0 0 1-.363.36a.67.67 0 0 1-.416.106m5.077-3.915h-2.43v4.8h1.028V7.357h1.3v-.892h-1.3V5.353h1.4v-.892\"/>" },
		"file-type-php": { w: 32, h: 32, body: "<defs><radialGradient id=\"__DGPICON__SVGQRCVdbYF\" cx=\"-16.114\" cy=\"20.532\" r=\"18.384\" gradientTransform=\"translate(26.52 -9.307)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".5\" stop-color=\"#4c6b96\"/><stop offset=\"1\" stop-color=\"#231f20\"/></radialGradient></defs><ellipse cx=\"16\" cy=\"16\" fill=\"url(#__DGPICON__SVGQRCVdbYF)\" rx=\"14\" ry=\"7.365\"/><ellipse cx=\"16\" cy=\"16\" fill=\"#6280b6\" rx=\"13.453\" ry=\"6.818\"/><path fill=\"#fff\" d=\"m18.725 18.2l.667-3.434a1.75 1.75 0 0 0-.372-1.719a2.93 2.93 0 0 0-2-.525h-1.153l.331-1.7a.22.22 0 0 0-.215-.26h-1.6a.22.22 0 0 0-.215.177l-.709 3.646a2.05 2.05 0 0 0-.477-1.054a2.78 2.78 0 0 0-2.2-.807H7.7a.22.22 0 0 0-.215.177l-1.434 7.38a.22.22 0 0 0 .215.26h1.603a.22.22 0 0 0 .215-.177l.347-1.785h1.2a5.2 5.2 0 0 0 1.568-.2a3.1 3.1 0 0 0 1.15-.689a3.5 3.5 0 0 0 .68-.844l-.287 1.475a.22.22 0 0 0 .215.26h1.6a.22.22 0 0 0 .215-.177l.787-4.051h1.094c.466 0 .6.093.64.133s.1.165.025.569l-.635 3.265a.22.22 0 0 0 .215.26h1.62a.22.22 0 0 0 .207-.18m-7.395-2.834a1.75 1.75 0 0 1-.561 1.092a2.17 2.17 0 0 1-1.315.321h-.712l.515-2.651h.921c.677 0 .949.145 1.059.266a1.18 1.18 0 0 1 .093.972m14.216-2.034a2.78 2.78 0 0 0-2.2-.807h-3.091a.22.22 0 0 0-.215.177l-1.434 7.38a.22.22 0 0 0 .215.26h1.608a.22.22 0 0 0 .215-.177l.347-1.785h1.2a5.2 5.2 0 0 0 1.568-.2a3.1 3.1 0 0 0 1.15-.689a3.43 3.43 0 0 0 1.076-1.927a2.51 2.51 0 0 0-.439-2.232m-1.667 2.034a1.75 1.75 0 0 1-.561 1.092a2.17 2.17 0 0 1-1.318.32h-.71l.515-2.651h.921c.677 0 .949.145 1.059.266a1.18 1.18 0 0 1 .094.973\"/><path fill=\"#000004\" d=\"M10.178 13.908a1.65 1.65 0 0 1 1.221.338a1.34 1.34 0 0 1 .145 1.161a1.95 1.95 0 0 1-.642 1.223a2.36 2.36 0 0 1-1.448.37h-.978l.6-3.089Zm-3.917 6.216h1.608l.381-1.962h1.377a5 5 0 0 0 1.5-.191a2.84 2.84 0 0 0 1.07-.642a3.2 3.2 0 0 0 1.01-1.808a2.3 2.3 0 0 0-.385-2.044a2.57 2.57 0 0 0-2.035-.732H7.7Zm8.126-9.342h1.6l-.387 1.962h1.421a2.77 2.77 0 0 1 1.85.468a1.55 1.55 0 0 1 .305 1.516l-.667 3.434H16.89l.635-3.265a.89.89 0 0 0-.08-.76a1.12 1.12 0 0 0-.8-.2H15.37l-.822 4.228h-1.6Zm8.34 3.126a1.65 1.65 0 0 1 1.221.338a1.34 1.34 0 0 1 .145 1.161a1.95 1.95 0 0 1-.642 1.223A2.36 2.36 0 0 1 22 17h-.978l.6-3.089Zm-3.917 6.216h1.608l.381-1.962h1.377a5 5 0 0 0 1.5-.191a2.84 2.84 0 0 0 1.07-.642a3.2 3.2 0 0 0 1.01-1.808a2.3 2.3 0 0 0-.385-2.044a2.57 2.57 0 0 0-2.035-.732h-3.092Z\"/>" },
		"file-type-python": { w: 32, h: 32, body: "<defs><linearGradient id=\"__DGPICON__SVGg4rxgcri\" x1=\"-133.268\" x2=\"-133.198\" y1=\"-202.91\" y2=\"-202.84\" gradientTransform=\"matrix(189.38 0 0 189.81 25243.061 38519.17)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#387eb8\"/><stop offset=\"1\" stop-color=\"#366994\"/></linearGradient><linearGradient id=\"__DGPICON__SVG5ouQmWbV\" x1=\"-133.575\" x2=\"-133.495\" y1=\"-203.203\" y2=\"-203.133\" gradientTransform=\"matrix(189.38 0 0 189.81 25309.061 38583.42)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#ffe052\"/><stop offset=\"1\" stop-color=\"#ffc331\"/></linearGradient></defs><path fill=\"url(#__DGPICON__SVGg4rxgcri)\" d=\"M15.885 2.1c-7.1 0-6.651 3.07-6.651 3.07v3.19h6.752v1H6.545S2 8.8 2 16.005s4.013 6.912 4.013 6.912H8.33v-3.361s-.13-4.013 3.9-4.013h6.762s3.772.06 3.772-3.652V5.8s.572-3.712-6.842-3.712Zm-3.732 2.137a1.214 1.214 0 1 1-1.183 1.244v-.02a1.214 1.214 0 0 1 1.214-1.214Z\"/><path fill=\"url(#__DGPICON__SVG5ouQmWbV)\" d=\"M16.085 29.91c7.1 0 6.651-3.08 6.651-3.08v-3.18h-6.751v-1h9.47S30 23.158 30 15.995s-4.013-6.912-4.013-6.912H23.64V12.4s.13 4.013-3.9 4.013h-6.765S9.2 16.356 9.2 20.068V26.2s-.572 3.712 6.842 3.712h.04Zm3.732-2.147A1.214 1.214 0 1 1 21 26.519v.03a1.214 1.214 0 0 1-1.214 1.214z\"/>" },
		"file-type-r": { w: 32, h: 32, body: "<defs><linearGradient id=\"__DGPICON__SVGKqV9jdVi\" x1=\"-134.811\" x2=\"-134.772\" y1=\"-103.284\" y2=\"-103.323\" gradientTransform=\"matrix(721.094 0 0 -482.937 97213.595 -49874.512)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#cbced0\"/><stop offset=\"1\" stop-color=\"#84838b\"/></linearGradient><linearGradient id=\"__DGPICON__SVG5aLaoevq\" x1=\"-135.378\" x2=\"-135.339\" y1=\"-102.985\" y2=\"-103.024\" gradientTransform=\"matrix(398 0 0 -406.124 53893 -41812.836)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#276dc3\"/><stop offset=\"1\" stop-color=\"#165caa\"/></linearGradient></defs><path fill=\"url(#__DGPICON__SVGKqV9jdVi)\" d=\"M16 23.956c-7.732 0-14-4.2-14-9.376S8.268 5.2 16 5.2s14 4.2 14 9.38s-6.268 9.376-14 9.376M18.143 8.87C12.266 8.87 7.5 11.74 7.5 15.28s4.764 6.41 10.641 6.41s10.214-1.962 10.214-6.41s-4.335-6.41-10.212-6.41\"/><path fill=\"url(#__DGPICON__SVG5aLaoevq)\" d=\"M23.321 19.726a11 11 0 0 1 1.34.5a2.6 2.6 0 0 1 .68.485a1.8 1.8 0 0 1 .311.447l3.339 5.63h-5.4l-2.524-4.74a6 6 0 0 0-.835-1.145a.88.88 0 0 0-.641-.291h-1.28v6.173h-4.776V11.026h9.591s4.374.074 4.374 4.235s-4.179 4.465-4.179 4.465m-2.077-5.28h-2.891v2.681h2.893a1.323 1.323 0 0 0 1.34-1.364a1.247 1.247 0 0 0-1.342-1.316Z\"/>" },
		"file-type-ruby": { w: 32, h: 32, body: "<defs><linearGradient id=\"__DGPICON__SVGiqgdicjk\" x1=\"-235.957\" x2=\"-235.986\" y1=\"-308.579\" y2=\"-308.527\" gradientTransform=\"matrix(202.935 0 0 -202.78 47910.461 -62541.16)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fb7655\"/><stop offset=\".41\" stop-color=\"#e42b1e\"/><stop offset=\".99\" stop-color=\"#900\"/><stop offset=\"1\" stop-color=\"#900\"/></linearGradient><linearGradient id=\"__DGPICON__SVGF9aq9cWt\" x1=\"-235.571\" x2=\"-235.697\" y1=\"-309.087\" y2=\"-309.041\" gradientTransform=\"matrix(60.308 0 0 -111.778 14236.351 -34525.395)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#871101\"/><stop offset=\".99\" stop-color=\"#911209\"/><stop offset=\"1\" stop-color=\"#911209\"/></linearGradient><linearGradient id=\"__DGPICON__SVG0HSePCnb\" x1=\"-235.896\" x2=\"-235.937\" y1=\"-313.362\" y2=\"-313.129\" gradientTransform=\"matrix(188.32 0 0 -21.986 44447.302 -6856.882)\" href=\"#__DGPICON__SVGF9aq9cWt\"/><linearGradient id=\"__DGPICON__SVGvb2glb6k\" x1=\"-233.515\" x2=\"-233.497\" y1=\"-309.082\" y2=\"-309.161\" gradientTransform=\"matrix(65.222 0 0 -97.1 15237.802 -29991.814)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".23\" stop-color=\"#e57252\"/><stop offset=\".46\" stop-color=\"#de3b20\"/><stop offset=\".99\" stop-color=\"#a60003\"/><stop offset=\"1\" stop-color=\"#a60003\"/></linearGradient><linearGradient id=\"__DGPICON__SVG6loDUcxZ\" x1=\"-235.314\" x2=\"-235.31\" y1=\"-309.534\" y2=\"-309.607\" gradientTransform=\"matrix(105.32 0 0 -106.825 24798.925 -33053.152)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".23\" stop-color=\"#e4714e\"/><stop offset=\".56\" stop-color=\"#be1a0d\"/><stop offset=\".99\" stop-color=\"#a80d00\"/><stop offset=\"1\" stop-color=\"#a80d00\"/></linearGradient><linearGradient id=\"__DGPICON__SVG6FPKXbvK\" x1=\"-235.882\" x2=\"-235.869\" y1=\"-311.851\" y2=\"-311.935\" gradientTransform=\"matrix(94.321 0 0 -66.418 22271.499 -20707.004)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".18\" stop-color=\"#e46342\"/><stop offset=\".4\" stop-color=\"#c82410\"/><stop offset=\".99\" stop-color=\"#a80d00\"/><stop offset=\"1\" stop-color=\"#a80d00\"/></linearGradient><linearGradient id=\"__DGPICON__SVGLCWrsbYP\" x1=\"-235.412\" x2=\"-235.333\" y1=\"-321.074\" y2=\"-320.958\" gradientTransform=\"matrix(70.767 0 0 -24.301 16678.116 -7798.647)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".54\" stop-color=\"#c81f11\"/><stop offset=\".99\" stop-color=\"#bf0905\"/><stop offset=\"1\" stop-color=\"#bf0905\"/></linearGradient><linearGradient id=\"__DGPICON__SVGf5jZBbJL\" x1=\"-223.821\" x2=\"-223.796\" y1=\"-310.116\" y2=\"-310.18\" gradientTransform=\"matrix(18.177 0 0 -72.645 4071.017 -22510.233)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".31\" stop-color=\"#de4024\"/><stop offset=\".99\" stop-color=\"#bf190b\"/><stop offset=\"1\" stop-color=\"#bf190b\"/></linearGradient><linearGradient id=\"__DGPICON__SVGQfUwFbKt\" x1=\"-235.561\" x2=\"-235.424\" y1=\"-309.258\" y2=\"-309.116\" gradientTransform=\"matrix(158.162 0 0 -157.937 37256.313 -48819.382)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#bd0012\"/><stop offset=\".07\" stop-color=\"#fff\"/><stop offset=\".17\" stop-color=\"#fff\"/><stop offset=\".27\" stop-color=\"#c82f1c\"/><stop offset=\".33\" stop-color=\"#820c01\"/><stop offset=\".46\" stop-color=\"#a31601\"/><stop offset=\".72\" stop-color=\"#b31301\"/><stop offset=\".99\" stop-color=\"#e82609\"/><stop offset=\"1\" stop-color=\"#e82609\"/></linearGradient><linearGradient id=\"__DGPICON__SVGSsKSoh4f\" x1=\"-235.424\" x2=\"-235.476\" y1=\"-309.143\" y2=\"-309.126\" gradientTransform=\"matrix(127.074 0 0 -97.409 29932.229 -30086.947)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#8c0c01\"/><stop offset=\".54\" stop-color=\"#990c00\"/><stop offset=\".99\" stop-color=\"#a80d0e\"/><stop offset=\"1\" stop-color=\"#a80d0e\"/></linearGradient><linearGradient id=\"__DGPICON__SVG9U0cHUGc\" x1=\"-235.839\" x2=\"-235.901\" y1=\"-309.604\" y2=\"-309.555\" gradientTransform=\"matrix(94.011 0 0 -105.603 22198.743 -32676.856)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#7e110b\"/><stop offset=\".99\" stop-color=\"#9e0c00\"/><stop offset=\"1\" stop-color=\"#9e0c00\"/></linearGradient><linearGradient id=\"__DGPICON__SVGdb3on5po\" x1=\"-235.854\" x2=\"-235.891\" y1=\"-311.24\" y2=\"-311.202\" gradientTransform=\"matrix(79.702 0 0 -81.791 18827.397 -25447.905)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#79130d\"/><stop offset=\".99\" stop-color=\"#9e120b\"/><stop offset=\"1\" stop-color=\"#9e120b\"/></linearGradient><linearGradient id=\"__DGPICON__SVGkA2IRbug\" x1=\"-231.241\" x2=\"-231.299\" y1=\"-309.435\" y2=\"-309.337\" gradientTransform=\"matrix(40.137 0 0 -81.143 9286.998 -25078.589)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#8b2114\"/><stop offset=\".43\" stop-color=\"#9e100a\"/><stop offset=\".99\" stop-color=\"#b3100c\"/><stop offset=\"1\" stop-color=\"#b3100c\"/></linearGradient><linearGradient id=\"__DGPICON__SVGLvLZ24gI\" x1=\"-235.898\" x2=\"-235.831\" y1=\"-317.466\" y2=\"-317.537\" gradientTransform=\"matrix(78.099 0 0 -32.624 18447.361 -10353.553)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#b31000\"/><stop offset=\".44\" stop-color=\"#910f08\"/><stop offset=\".99\" stop-color=\"#791c12\"/><stop offset=\"1\" stop-color=\"#791c12\"/></linearGradient><radialGradient id=\"__DGPICON__SVGfvaUndTF\" cx=\"-235.882\" cy=\"-312.543\" r=\".076\" gradientTransform=\"matrix(93.113 0 0 -48.655 21986.073 -15193.61)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#a80d00\"/><stop offset=\".99\" stop-color=\"#7e0e08\"/><stop offset=\"1\" stop-color=\"#7e0e08\"/></radialGradient><radialGradient id=\"__DGPICON__SVGv1rGLeXK\" cx=\"-235.282\" cy=\"-309.704\" r=\".097\" gradientTransform=\"matrix(97.434 0 0 -75.848 22937.057 -23467.84)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#a30c00\"/><stop offset=\".99\" stop-color=\"#800e08\"/><stop offset=\"1\" stop-color=\"#800e08\"/></radialGradient></defs><path fill=\"url(#__DGPICON__SVGiqgdicjk)\" d=\"M23.693 20.469L7.707 29.961l20.7-1.4L30 7.685Z\"/><path fill=\"url(#__DGPICON__SVGF9aq9cWt)\" d=\"m28.44 28.542l-1.779-12.279l-4.846 6.4Z\"/><path fill=\"url(#__DGPICON__SVG0HSePCnb)\" d=\"M28.464 28.542L15.43 27.519l-7.654 2.415Z\"/><path fill=\"url(#__DGPICON__SVGvb2glb6k)\" d=\"M7.794 29.937L11.05 19.27L3.885 20.8Z\"/><path fill=\"url(#__DGPICON__SVG6loDUcxZ)\" d=\"m21.813 22.7l-3-11.735L10.243 19Z\"/><path fill=\"url(#__DGPICON__SVG6FPKXbvK)\" d=\"m29.32 11.127l-8.1-6.619l-2.257 7.3Z\"/><path fill=\"url(#__DGPICON__SVGLCWrsbYP)\" d=\"m25.53 2.148l-4.767 2.634l-3.007-2.67Z\"/><path fill=\"url(#__DGPICON__SVGf5jZBbJL)\" d=\"m2 24.38l2-3.642L2.382 16.4Z\"/><path fill=\"#fff\" d=\"m2.274 16.263l1.626 4.61l7.062-1.584l8.062-7.489L21.3 4.569l-3.583-2.53l-6.091 2.28C9.706 6.1 5.982 9.635 5.848 9.7s-2.459 4.464-3.574 6.562Z\"/><path fill=\"url(#__DGPICON__SVGQfUwFbKt)\" d=\"M7.981 7.981C12.14 3.858 17.5 1.421 19.559 3.5s-.124 7.121-4.283 11.244s-9.455 6.69-11.511 4.614s.057-7.258 4.216-11.377\"/><path fill=\"url(#__DGPICON__SVGSsKSoh4f)\" d=\"m7.794 29.933l3.231-10.7l10.729 3.447c-3.879 3.638-8.194 6.713-13.96 7.254Z\"/><path fill=\"url(#__DGPICON__SVG9U0cHUGc)\" d=\"m19.038 11.774l2.754 10.91c3.24-3.407 6.149-7.07 7.573-11.6z\"/><path fill=\"url(#__DGPICON__SVGdb3on5po)\" d=\"M29.337 11.139c1.1-3.327 1.357-8.1-3.841-8.985l-4.265 2.355z\"/><path fill=\"#9e1209\" d=\"M2 24.332c.153 5.49 4.114 5.572 5.8 5.62l-3.9-9.1z\"/><path fill=\"url(#__DGPICON__SVGfvaUndTF)\" d=\"M19.053 11.791c2.49 1.531 7.509 4.6 7.61 4.661a17.6 17.6 0 0 0 2.619-5.343z\"/><path fill=\"url(#__DGPICON__SVGv1rGLeXK)\" d=\"m11.021 19.232l4.319 8.332a28 28 0 0 0 6.385-4.88l-10.7-3.452Z\"/><path fill=\"url(#__DGPICON__SVGkA2IRbug)\" d=\"m3.887 20.861l-.612 7.287c1.155 1.577 2.743 1.714 4.409 1.591c-1.205-3-3.614-9-3.8-8.878Z\"/><path fill=\"url(#__DGPICON__SVGLvLZ24gI)\" d=\"m21.206 4.528l8.58 1.2c-.458-1.94-1.864-3.192-4.261-3.584l-4.319 2.38Z\"/>" },
		"file-type-rust": { w: 32, h: 32, body: "<defs><radialGradient id=\"__DGPICON__SVGZmFlvcVj\" cx=\"-492.035\" cy=\"-883.37\" r=\"13.998\" gradientTransform=\"matrix(.866 -.5 -.3 -.52 177.106 -689.033)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#7d7d7d\"/><stop offset=\".267\" stop-color=\"#7e7c7a\"/><stop offset=\".45\" stop-color=\"#817871\"/><stop offset=\".608\" stop-color=\"#867162\"/><stop offset=\".753\" stop-color=\"#8d684c\"/><stop offset=\".886\" stop-color=\"#965c30\"/><stop offset=\"1\" stop-color=\"#a04f12\"/></radialGradient></defs><path fill=\"url(#__DGPICON__SVGZmFlvcVj)\" d=\"M15.124 5.3a.832.832 0 1 1 .832.832a.83.83 0 0 1-.832-.832M5.2 12.834a.832.832 0 1 1 .832.832a.83.83 0 0 1-.832-.832m19.856.039a.832.832 0 1 1 .832.832a.83.83 0 0 1-.832-.832m-17.451 1.14a.76.76 0 0 0 .386-1l-.369-.835h1.452v6.545h-2.93a10.3 10.3 0 0 1-.332-3.911Zm6.074.161v-1.929h3.458c.179 0 1.261.206 1.261 1.016c0 .672-.83.913-1.513.913ZM8.958 24.561a.832.832 0 1 1 .832.832a.83.83 0 0 1-.832-.832m12.331.039a.832.832 0 1 1 .832.832a.83.83 0 0 1-.832-.832m.257-1.887a.76.76 0 0 0-.9.584l-.418 1.949a10.25 10.25 0 0 1-8.545-.041l-.417-1.949a.76.76 0 0 0-.9-.583l-1.721.37a10 10 0 0 1-.89-1.049h8.374c.095 0 .158-.017.158-.1v-2.966c0-.086-.063-.1-.158-.1h-2.45v-1.881h2.649a1.665 1.665 0 0 1 1.629 1.412c.105.413.336 1.757.494 2.187c.157.483.8 1.447 1.482 1.447h4.323a10 10 0 0 1-.949 1.1Zm4.65-7.821a10.3 10.3 0 0 1 .022 1.779h-1.051c-.105 0-.148.069-.148.172v.483c0 1.136-.641 1.384-1.2 1.447c-.535.06-1.128-.224-1.2-.551a3.62 3.62 0 0 0-1.671-2.808c1.03-.654 2.1-1.619 2.1-2.911A3.29 3.29 0 0 0 21.44 9.8a4.56 4.56 0 0 0-2.2-.724H8.367A10.25 10.25 0 0 1 14.1 5.84l1.282 1.344a.76.76 0 0 0 1.072.026l1.434-1.372a10.25 10.25 0 0 1 7.015 5l-.982 2.217a.76.76 0 0 0 .386 1Zm2.448.036l-.033-.343l1.011-.943a.42.42 0 0 0-.013-.595a.4.4 0 0 0-.121-.081l-1.288-.483l-.1-.334l.806-1.12a.42.42 0 0 0-.13-.581a.4.4 0 0 0-.133-.055l-1.363-.222l-.164-.306l.573-1.257a.42.42 0 0 0-.236-.544a.4.4 0 0 0-.146-.029l-1.383.048l-.224-.264l.318-1.347a.42.42 0 0 0-.343-.487a.4.4 0 0 0-.144 0l-1.348.315l-.266-.219l.049-1.381a.42.42 0 0 0-.431-.411a.4.4 0 0 0-.141.028l-1.257.573l-.306-.164l-.222-1.363a.42.42 0 0 0-.5-.318a.4.4 0 0 0-.133.055l-1.121.806l-.333-.1l-.483-1.293a.42.42 0 0 0-.555-.215a.4.4 0 0 0-.12.08l-.946 1.012l-.343-.033l-.728-1.177a.42.42 0 0 0-.688 0l-.728 1.177l-.343.033l-.943-1.012a.42.42 0 0 0-.595.015a.4.4 0 0 0-.08.12L12.483 3.8l-.333.1l-1.12-.8a.42.42 0 0 0-.581.13a.4.4 0 0 0-.055.133l-.222 1.363l-.306.164l-1.258-.573a.42.42 0 0 0-.544.239a.4.4 0 0 0-.028.144l.048 1.383l-.266.217l-1.347-.316a.42.42 0 0 0-.487.343a.4.4 0 0 0 0 .144L6.3 7.819l-.218.265L4.7 8.036a.422.422 0 0 0-.383.573l.573 1.257l-.164.306l-1.363.222a.42.42 0 0 0-.318.5a.4.4 0 0 0 .055.133l.806 1.12l-.1.334l-1.293.483a.42.42 0 0 0-.215.555a.4.4 0 0 0 .081.121l1.011.943l-.033.343l-1.177.728a.42.42 0 0 0 0 .688l1.177.728l.033.343l-1.011.943a.42.42 0 0 0 .015.595a.4.4 0 0 0 .119.08l1.293.483l.1.334l-.806 1.124a.42.42 0 0 0 .131.581a.4.4 0 0 0 .133.055l1.363.222l.164.307l-.573 1.257a.42.42 0 0 0 .24.545a.4.4 0 0 0 .143.028l1.383-.048l.219.266l-.317 1.348a.42.42 0 0 0 .341.486a.4.4 0 0 0 .146 0l1.345-.319l.266.218l-.049 1.382a.42.42 0 0 0 .429.41a.4.4 0 0 0 .143-.028l1.257-.573l.306.164l.222 1.362a.42.42 0 0 0 .5.319a.4.4 0 0 0 .133-.055l1.12-.807l.334.1l.483 1.292a.42.42 0 0 0 .556.214a.4.4 0 0 0 .119-.08l.943-1.011l.343.034l.728 1.177a.42.42 0 0 0 .588.1a.4.4 0 0 0 .1-.1l.728-1.177l.343-.034l.943 1.011a.42.42 0 0 0 .595-.015a.4.4 0 0 0 .08-.119l.483-1.292l.334-.1l1.12.807a.42.42 0 0 0 .581-.131a.4.4 0 0 0 .055-.133l.222-1.362l.306-.164l1.257.573a.42.42 0 0 0 .544-.239a.4.4 0 0 0 .028-.143l-.048-1.384l.265-.218l1.347.317a.42.42 0 0 0 .487-.34a.5.5 0 0 0 0-.146l-.309-1.346l.218-.266l1.383.048a.42.42 0 0 0 .41-.431a.4.4 0 0 0-.028-.142l-.573-1.257l.164-.307l1.363-.222a.42.42 0 0 0 .319-.5a.4.4 0 0 0-.056-.135l-.806-1.12l.1-.334l1.293-.483a.42.42 0 0 0 .215-.554a.4.4 0 0 0-.081-.121l-1.011-.943l.033-.343l1.177-.728a.42.42 0 0 0 0-.688Z\"/>" },
		"file-type-scala": { w: 32, h: 32, body: "<defs><linearGradient id=\"__DGPICON__SVGxuZ1Vd8S\" x1=\"-134.907\" x2=\"-134.896\" y1=\"204.572\" y2=\"204.572\" gradientTransform=\"matrix(1538 0 0 -961.25 207495 196661)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#e62d2a\"/><stop offset=\".6\" stop-color=\"#df3f3d\"/><stop offset=\".8\" stop-color=\"#df3f3d\"/><stop offset=\"1\" stop-color=\"#e62d2a\"/></linearGradient><linearGradient id=\"__DGPICON__SVGSywV0BWL\" x1=\"-134.907\" x2=\"-134.896\" y1=\"203.781\" y2=\"203.781\" gradientTransform=\"matrix(1538 0 0 -961.25 207495 195892)\" href=\"#__DGPICON__SVGxuZ1Vd8S\"/><linearGradient id=\"__DGPICON__SVGpRg1QdBw\" x1=\"-134.907\" x2=\"-134.896\" y1=\"205.363\" y2=\"205.363\" gradientTransform=\"matrix(1538 0 0 -961.25 207495 197430)\" href=\"#__DGPICON__SVGxuZ1Vd8S\"/></defs><path fill=\"#7f0c1d\" d=\"M7.384 19.231v2.154c0 .363 7.833.971 12.937 2.154c2.465-.571 4.295-1.277 4.295-2.154v-2.154c0-.877-1.83-1.582-4.295-2.154c-5.1 1.183-12.937 1.791-12.937 2.154m0-8.616v2.154c0 .363 7.833.971 12.937 2.154c2.465-.571 4.295-1.277 4.295-2.154v-2.154c0-.877-1.83-1.582-4.295-2.154c-5.1 1.183-12.937 1.791-12.937 2.154\"/><path fill=\"url(#__DGPICON__SVGxuZ1Vd8S)\" d=\"M7.384 14.923v6.462c0-.538 17.232-1.615 17.232-4.308v-6.462c0 2.692-17.232 3.769-17.232 4.308\"/><path fill=\"url(#__DGPICON__SVGSywV0BWL)\" d=\"M7.384 6.308v6.462c0-.538 17.232-1.615 17.232-4.308V2c0 2.692-17.232 3.769-17.232 4.308\"/><path fill=\"url(#__DGPICON__SVGpRg1QdBw)\" d=\"M7.384 23.538V30c0-.538 17.232-1.615 17.232-4.308v-6.461c0 2.692-17.232 3.769-17.232 4.308\"/>" },
		"file-type-shell": { w: 32, h: 32, body: "<path fill=\"#d9b400\" d=\"M29.4 27.6H2.5V4.5h26.9Zm-25.9-1h24.9V5.5H3.5Z\"/><path fill=\"#d9b400\" d=\"m6.077 19.316l-.555-.832l4.844-3.229l-4.887-4.071l.641-.768l5.915 4.928zM12.7 18.2h7.8v1h-7.8zM2.5 5.5h26.9v1.9H2.5z\"/>" },
		"file-type-sql": { w: 32, h: 32, body: "<path fill=\"#ffda44\" d=\"M8.562 15.256A21.2 21.2 0 0 0 16 16.449a21.2 21.2 0 0 0 7.438-1.194c1.864-.727 2.525-1.535 2.525-2V9.7a10.4 10.4 0 0 1-2.084 1.076A22.3 22.3 0 0 1 16 12.078a22.4 22.4 0 0 1-7.879-1.3A10.3 10.3 0 0 1 6.037 9.7v3.55c0 .474.663 1.278 2.525 2.006m0 6.705a15.6 15.6 0 0 0 2.6.741a25 25 0 0 0 4.838.453a25 25 0 0 0 4.838-.452a15.6 15.6 0 0 0 2.6-.741c1.864-.727 2.525-1.535 2.525-2v-3.39a10.7 10.7 0 0 1-1.692.825A23.5 23.5 0 0 1 16 18.74a23.5 23.5 0 0 1-8.271-1.348a11 11 0 0 1-1.692-.825v3.393c0 .466.663 1.271 2.525 2.001M16 30c5.5 0 9.963-1.744 9.963-3.894v-2.837a10.5 10.5 0 0 1-1.535.762l-.157.063A23.5 23.5 0 0 1 16 25.445a23.4 23.4 0 0 1-8.271-1.351l-.157-.063a10.5 10.5 0 0 1-1.535-.762v2.837C6.037 28.256 10.5 30 16 30\"/><ellipse cx=\"16\" cy=\"5.894\" fill=\"#ffda44\" rx=\"9.963\" ry=\"3.894\"/>" },
		"file-type-svelte": { w: 32, h: 32, body: "<path fill=\"#ff3e00\" d=\"M26.47 5.7a8.973 8.973 0 0 0-11.793-2.454L7.96 7.4a7.46 7.46 0 0 0-3.481 5.009a7.7 7.7 0 0 0 .8 5.058a7.4 7.4 0 0 0-1.151 2.8a7.8 7.8 0 0 0 1.4 6.028a8.977 8.977 0 0 0 11.794 2.458L24.04 24.6a7.47 7.47 0 0 0 3.481-5.009a7.67 7.67 0 0 0-.8-5.062a7.35 7.35 0 0 0 1.152-2.8A7.8 7.8 0 0 0 26.47 5.7\"/><path fill=\"#fff\" d=\"M14.022 26.64A5.41 5.41 0 0 1 8.3 24.581a4.68 4.68 0 0 1-.848-3.625a4 4 0 0 1 .159-.61l.127-.375l.344.238a8.8 8.8 0 0 0 2.628 1.274l.245.073l-.025.237a1.44 1.44 0 0 0 .271.968a1.63 1.63 0 0 0 1.743.636a1.5 1.5 0 0 0 .411-.175l6.7-4.154a1.37 1.37 0 0 0 .633-.909a1.4 1.4 0 0 0-.244-1.091a1.63 1.63 0 0 0-1.726-.622a1.5 1.5 0 0 0-.413.176l-2.572 1.584a5 5 0 0 1-1.364.582a5.415 5.415 0 0 1-5.727-2.06a4.68 4.68 0 0 1-.831-3.628A4.5 4.5 0 0 1 9.9 10.09l6.708-4.154a5 5 0 0 1 1.364-.581A5.41 5.41 0 0 1 23.7 7.414a4.68 4.68 0 0 1 .848 3.625a4 4 0 0 1-.159.61l-.127.375l-.344-.237a8.7 8.7 0 0 0-2.628-1.274l-.245-.074l.025-.237a1.44 1.44 0 0 0-.272-.968a1.63 1.63 0 0 0-1.725-.622a1.5 1.5 0 0 0-.411.176l-6.722 4.14a1.35 1.35 0 0 0-.631.908a1.4 1.4 0 0 0 .244 1.092a1.63 1.63 0 0 0 1.726.621a1.5 1.5 0 0 0 .413-.175l2.562-1.585a4.9 4.9 0 0 1 1.364-.581a5.42 5.42 0 0 1 5.728 2.059a4.68 4.68 0 0 1 .843 3.625a4.5 4.5 0 0 1-2.089 3.013l-6.707 4.154a4.9 4.9 0 0 1-1.364.581\"/>" },
		"file-type-swift": { w: 32, h: 32, body: "<defs><linearGradient id=\"__DGPICON__SVGkG5neddW\" x1=\"-134.494\" x2=\"-134.497\" y1=\"-171.82\" y2=\"-171.89\" gradientTransform=\"matrix(240 0 0 -205.6 32295 -35312.585)\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#f88535\"/><stop offset=\"1\" stop-color=\"#fd2221\"/></linearGradient></defs><path fill=\"url(#__DGPICON__SVGkG5neddW)\" d=\"M19.422 4.007s6.217 3.554 7.844 9.2c1.466 5.1.292 7.534.292 7.534a8.9 8.9 0 0 1 1.742 2.8a4.83 4.83 0 0 1 .29 4.453s-.1-2.08-3.2-2.511c-2.841-.4-3.874 2.366-9.3 2.232A18.43 18.43 0 0 1 2 19.354C4.651 20.8 8.124 23.045 12.449 22.7s5.228-1.674 5.228-1.674A67 67 0 0 1 4.891 7.643c3.4 2.845 11.822 8.507 11.626 8.363A76 76 0 0 1 8.092 6.24s12.636 10.389 13.653 10.323c.418-.861 2.579-5.318-2.324-12.557Z\"/>" },
		"file-type-text": { w: 32, h: 32, body: "<path fill=\"#c2c2c2\" d=\"M22.038 2H6.375a1.755 1.755 0 0 0-1.75 1.75v24.5A1.755 1.755 0 0 0 6.375 30h19.25a1.755 1.755 0 0 0 1.75-1.75V6.856Zm.525 2.844l1.663 1.531h-1.663ZM6.375 28.25V3.75h14.438v4.375h4.813V28.25Z\"/><path fill=\"#829ec2\" d=\"M8.125 15.097h13.076v1.75H8.125zm0 9.342h9.762v1.75H8.125zm0-4.676h15.75v1.75H8.125zm0-9.533h15.75v1.75H8.125z\"/>" },
		"file-type-toml": { w: 32, h: 32, body: "<path fill=\"#7f7f7f\" d=\"M22.76 6.83v3.25h-5v15.09h-3.5V10.08h-5V6.83Z\"/><path fill=\"#bfbfbf\" d=\"M2 2h6.2v3.09H5.34v21.8H8.2V30H2Zm28 28h-6.2v-3.09h2.86V5.11H23.8V2H30Z\"/>" },
		"file-type-typescript": { w: 32, h: 32, body: "<path fill=\"#007acc\" d=\"M23.827 8.243a4.4 4.4 0 0 1 2.223 1.281a6 6 0 0 1 .852 1.143c.011.045-1.534 1.083-2.471 1.662c-.034.023-.169-.124-.322-.35a2.01 2.01 0 0 0-1.67-1c-1.077-.074-1.771.49-1.766 1.433a1.3 1.3 0 0 0 .153.666c.237.49.677.784 2.059 1.383c2.544 1.095 3.636 1.817 4.31 2.843a5.16 5.16 0 0 1 .416 4.333a4.76 4.76 0 0 1-3.932 2.815a11 11 0 0 1-2.708-.028a6.53 6.53 0 0 1-3.616-1.884a6.3 6.3 0 0 1-.926-1.371a3 3 0 0 1 .327-.208c.158-.09.756-.434 1.32-.761l1.024-.6l.214.312a4.8 4.8 0 0 0 1.35 1.292a3.3 3.3 0 0 0 3.458-.175a1.545 1.545 0 0 0 .2-1.974c-.276-.395-.84-.727-2.443-1.422a8.8 8.8 0 0 1-3.349-2.055a4.7 4.7 0 0 1-.976-1.777a7.1 7.1 0 0 1-.062-2.268a4.33 4.33 0 0 1 3.644-3.374a9 9 0 0 1 2.691.084m-8.343 1.483l.011 1.454h-4.63v13.148H7.6V11.183H2.97V9.755a14 14 0 0 1 .04-1.466c.017-.023 2.832-.034 6.245-.028l6.211.017Z\"/>" },
		"file-type-video": { w: 32, h: 32, body: "<path fill=\"#e75749\" d=\"M4.5 2.375A2.56 2.56 0 0 1 5.861 2h20.366a2.545 2.545 0 0 1 2.423 1.951a3.4 3.4 0 0 1 .072.862v11.176h-1.573a2 2 0 0 0-.22.022a5 5 0 0 0-.581-.011c-.3.007-.61-.014-.914.014a2.3 2.3 0 0 0-.4-.02h-4.739c-.2 0-.392.008-.587-.01l.1-.065l-6.353-3.813v3.889c-2.213-.005-4.427 0-6.64 0a2 2 0 0 0-.251.021c-.212-.032-.427-.016-.642-.016c-.284.006-.57-.015-.853.015a2 2 0 0 0-.253-.022H3.275c.006-3.635 0-7.27 0-10.9a4.8 4.8 0 0 1 .071-1.131A2.54 2.54 0 0 1 4.5 2.375m.54 2.188a.64.64 0 0 0-.489.606v1.316a.64.64 0 0 0 .627.6h1.309a.64.64 0 0 0 .6-.608c.005-.426 0-.853 0-1.279a.64.64 0 0 0-.329-.575a.7.7 0 0 0-.358-.078H5.264a1 1 0 0 0-.224.018m20.341 0a.64.64 0 0 0-.474.607v1.306a.64.64 0 0 0 .6.608c.436.005.872 0 1.308 0a.64.64 0 0 0 .627-.606c.006-.438 0-.876 0-1.314a.64.64 0 0 0-.594-.621c-.348-.009-.7 0-1.045 0a2 2 0 0 0-.422.024ZM5.042 8.38a.64.64 0 0 0-.452.4a1.1 1.1 0 0 0-.041.386v1.135a.637.637 0 0 0 .6.6c.4.008.795 0 1.192 0a.8.8 0 0 0 .395-.065a.64.64 0 0 0 .36-.574V8.983a.64.64 0 0 0-.6-.624c-.338-.008-.677 0-1.016 0a2.4 2.4 0 0 0-.438.021m20.338 0a.64.64 0 0 0-.433.4a1.1 1.1 0 0 0-.041.387v1.131a.64.64 0 0 0 .608.607c.406.006.812 0 1.218 0a.74.74 0 0 0 .38-.078a.64.64 0 0 0 .335-.558V8.985a.637.637 0 0 0-.593-.622c-.349-.009-.7 0-1.047 0a2 2 0 0 0-.428.022ZM5.041 12.2a.64.64 0 0 0-.491.608c0 .438-.005.877 0 1.315a.64.64 0 0 0 .627.6h1.3a.64.64 0 0 0 .608-.607v-1.307a.64.64 0 0 0-.605-.626c-.348-.007-.7 0-1.045 0a2 2 0 0 0-.394.017m20.335.006a.64.64 0 0 0-.43.394a1.1 1.1 0 0 0-.041.386v1.131a.64.64 0 0 0 .607.608c.435.005.87 0 1.306 0a.64.64 0 0 0 .628-.605c.006-.438 0-.876 0-1.313a.637.637 0 0 0-.592-.622c-.349-.01-.7 0-1.046 0a2 2 0 0 0-.431.015Z\"/><path fill=\"#fff\" d=\"M13.458 12.1q3.176 1.908 6.353 3.813l-.1.065q-3.127 1.872-6.251 3.748V15.99q-.003-1.941-.002-3.89\"/><path fill=\"#c0392b\" d=\"M3.275 15.988h1.541a2 2 0 0 1 .253.022a.65.65 0 0 0-.409.273a.9.9 0 0 0-.111.518v1.045a.686.686 0 0 0 .685.689h1.192a.68.68 0 0 0 .657-.569c.008-.447 0-.9 0-1.343a.63.63 0 0 0-.521-.613a2 2 0 0 1 .251-.021h6.64v3.736q3.127-1.871 6.251-3.748c.2.018.391.007.587.01h4.741a2.3 2.3 0 0 1 .4.02a.64.64 0 0 0-.475.385a1 1 0 0 0-.045.407v1.014a.677.677 0 0 0 .691.719h1.16a.684.684 0 0 0 .686-.658v-.984a1.07 1.07 0 0 0-.1-.589a.64.64 0 0 0-.42-.292a2 2 0 0 1 .22-.022h1.573c.011 1.721 0 3.443 0 5.165v6.293a2.57 2.57 0 0 1-.612 1.651a2.54 2.54 0 0 1-1.563.868a8 8 0 0 1-.981.033H6.724a9 9 0 0 1-1.368-.048a2.56 2.56 0 0 1-2-1.846a2.8 2.8 0 0 1-.09-.746V16.891c.007-.3-.002-.602.009-.903m1.795 3.843a.6.6 0 0 0-.386.234a.76.76 0 0 0-.134.464v1.162a.685.685 0 0 0 .686.658h1.283a.687.687 0 0 0 .568-.716v-1.191a.62.62 0 0 0-.2-.458a.7.7 0 0 0-.487-.17H5.264a1 1 0 0 0-.194.017m20.366 0a.62.62 0 0 0-.522.58v1.222a.676.676 0 0 0 .69.718c.428 0 .857.005 1.285 0a.7.7 0 0 0 .562-.684v-1.013a.9.9 0 0 0-.123-.568a.66.66 0 0 0-.532-.267h-.954a2.3 2.3 0 0 0-.406.011ZM5.071 23.648a.6.6 0 0 0-.4.249a.77.77 0 0 0-.124.448v1.132a.7.7 0 0 0 .6.688h1.376a.687.687 0 0 0 .567-.717v-1.189a.62.62 0 0 0-.2-.459a.7.7 0 0 0-.484-.17H5.265a1 1 0 0 0-.194.018m20.362 0a.62.62 0 0 0-.492.427a1 1 0 0 0-.029.33V25.6a.68.68 0 0 0 .656.567h1.193a.69.69 0 0 0 .686-.719v-1.164a.66.66 0 0 0-.286-.545a1.46 1.46 0 0 0-.787-.11c-.312.01-.629-.02-.94.018Z\"/>" },
		"file-type-vue": { w: 32, h: 32, body: "<path fill=\"#41b883\" d=\"M24.4 3.925H30l-14 24.15L2 3.925h10.71l3.29 5.6l3.22-5.6Z\"/><path fill=\"#41b883\" d=\"m2 3.925l14 24.15l14-24.15h-5.6L16 18.415L7.53 3.925Z\"/><path fill=\"#35495e\" d=\"M7.53 3.925L16 18.485l8.4-14.56h-5.18L16 9.525l-3.29-5.6Z\"/>" },
		"file-type-xml": { w: 32, h: 32, body: "<path fill=\"#f1662a\" d=\"m20.42 21.157l2.211 2.211L30 16l-7.369-7.369l-2.211 2.212L25.58 16Zm-8.84-10.314L9.369 8.631L2 16l7.369 7.369l2.211-2.211L6.42 16Zm5.831-3.166l1.6.437l-4.42 16.209l-1.6-.437z\"/>" },
		"file-type-yaml": { w: 32, h: 32, body: "<path fill=\"#ffe885\" d=\"M2 12.218c.755 0 1.51-.008 2.264 0l.053.038l2.761 2.758c.891-.906 1.8-1.794 2.7-2.7c.053-.052.11-.113.192-.1h1.823a1.4 1.4 0 0 1 .353.019c-.7.67-1.377 1.369-2.069 2.05L5.545 18.8c-.331.324-.648.663-.989.975c-.754.022-1.511.007-2.266.007c1.223-1.209 2.431-2.433 3.658-3.637c-1.321-1.304-2.63-2.62-3.948-3.927m10.7 0h1.839v7.566c-.611 0-1.222.012-1.832-.008v-4.994c-1.6 1.607-3.209 3.2-4.811 4.8c-.089.08-.166.217-.305.194c-.824-.006-1.649 0-2.474 0Q8.916 16 12.7 12.218m2.258.002c.47-.009.939 0 1.409 0c.836.853 1.69 1.689 2.536 2.532q1.268-1.267 2.539-2.532h1.4q-.008 3.784 0 7.567c-.471 0-.943.006-1.414 0q.008-2.387 0-4.773c-.844.843-1.676 1.7-2.526 2.536c-.856-.835-1.687-1.695-2.532-2.541c0 1.594-.006 3.188.006 4.781c-.472 0-.943.005-1.415 0q-.003-3.79-.003-7.57m8.301-.003c.472 0 .944-.007 1.416 0q-.007 3.083 0 6.166h3.782c.063.006.144-.012.191.045c.448.454.907.9 1.353 1.354q-3.371.007-6.741 0q.007-3.782-.001-7.565\"/>" },
		"file-type-zip": { w: 32, h: 32, body: "<defs><linearGradient id=\"__DGPICON__SVGXr4mrHrF\" x1=\"17.65\" x2=\"21.099\" y1=\"26.056\" y2=\"26.056\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"#4d4d4d\"/><stop offset=\".5\" stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#4d4d4d\"/></linearGradient><linearGradient id=\"__DGPICON__SVG5oyStdai\" x1=\"17.65\" x2=\"21.099\" y1=\"23.756\" y2=\"23.756\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVG9QsNwcZU\" x1=\"17.65\" x2=\"21.099\" y1=\"21.456\" y2=\"21.456\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVG1kIgneZE\" x1=\"17.65\" x2=\"21.099\" y1=\"19.156\" y2=\"19.156\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGp2oQjdFa\" x1=\"17.65\" x2=\"21.099\" y1=\"16.857\" y2=\"16.857\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGAFV8AN5B\" x1=\"17.65\" x2=\"21.099\" y1=\"14.557\" y2=\"14.557\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGRkU6lbfc\" x1=\"17.65\" x2=\"21.099\" y1=\"12.257\" y2=\"12.257\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGWUBOGcFP\" x1=\"17.65\" x2=\"21.099\" y1=\"9.957\" y2=\"9.957\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGFcdVfdXh\" x1=\"17.65\" x2=\"21.099\" y1=\"7.657\" y2=\"7.657\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGLioYKc8j\" x1=\"16.237\" x2=\"19.686\" y1=\"27.217\" y2=\"27.217\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGIx7REdei\" x1=\"16.237\" x2=\"19.686\" y1=\"24.918\" y2=\"24.918\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGownHpeLf\" x1=\"16.237\" x2=\"19.686\" y1=\"22.618\" y2=\"22.618\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGZ4gzmcVN\" x1=\"16.237\" x2=\"19.686\" y1=\"20.318\" y2=\"20.318\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGhAblbd0u\" x1=\"16.237\" x2=\"19.686\" y1=\"18.018\" y2=\"18.018\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGBzD5PbgA\" x1=\"17.65\" x2=\"21.099\" y1=\"28.356\" y2=\"28.356\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGcXb6lbYS\" x1=\"16.237\" x2=\"19.686\" y1=\"15.718\" y2=\"15.718\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGKF6nobvx\" x1=\"16.237\" x2=\"19.686\" y1=\"13.419\" y2=\"13.419\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGrU8zSORM\" x1=\"16.237\" x2=\"19.686\" y1=\"11.119\" y2=\"11.119\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGuFw9gbIu\" x1=\"16.237\" x2=\"19.686\" y1=\"8.819\" y2=\"8.819\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGXh7zWblD\" x1=\"16.237\" x2=\"19.686\" y1=\"29.514\" y2=\"29.514\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGmzaoUw6y\" x1=\"16.985\" x2=\"20.446\" y1=\"11.196\" y2=\"11.196\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGkZYaOeHC\" x1=\"18.096\" x2=\"19.336\" y1=\"5.329\" y2=\"5.329\" href=\"#__DGPICON__SVGXr4mrHrF\"/><linearGradient id=\"__DGPICON__SVGVKO9QdOI\" x1=\"16.029\" x2=\"21.403\" y1=\"5.591\" y2=\"5.591\" href=\"#__DGPICON__SVGXr4mrHrF\"/></defs><path fill=\"#c09553\" d=\"M27.667 27.667V17.333L23 15V2H4.333v28h23.334Zm-4.667 0v-9.111l2.333 1.222v7.889Z\"/><path fill=\"url(#__DGPICON__SVGXr4mrHrF)\" d=\"M17.65 25.559h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVG5oyStdai)\" d=\"M17.65 23.26h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVG9QsNwcZU)\" d=\"M17.65 20.96h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVG1kIgneZE)\" d=\"M17.65 18.66h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGp2oQjdFa)\" d=\"M17.65 16.36h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGAFV8AN5B)\" d=\"M17.65 14.06h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGRkU6lbfc)\" d=\"M17.65 11.76h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGWUBOGcFP)\" d=\"M17.65 9.461h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGFcdVfdXh)\" d=\"M17.65 7.161h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGLioYKc8j)\" d=\"M16.237 26.721h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGIx7REdei)\" d=\"M16.237 24.421h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGownHpeLf)\" d=\"M16.237 22.121h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGZ4gzmcVN)\" d=\"M16.237 19.821h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGhAblbd0u)\" d=\"M16.237 17.522h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGBzD5PbgA)\" d=\"M17.65 27.859h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGcXb6lbYS)\" d=\"M16.237 15.222h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGKF6nobvx)\" d=\"M16.237 12.922h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGrU8zSORM)\" d=\"M16.237 10.622h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGuFw9gbIu)\" d=\"M16.237 8.322h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGXh7zWblD)\" d=\"M16.237 29.018h3.45v.993h-3.45z\"/><path fill=\"url(#__DGPICON__SVGmzaoUw6y)\" d=\"M20.1 5.911a.554.554 0 0 0-.548-.53h-.009v.557h.092l.206 2.514h-2.252l.211-2.514h.094v-.557h-.044a.55.55 0 0 0-.547.53l-.314 10.569a.513.513 0 0 0 .515.531h2.432a.51.51 0 0 0 .513-.531Zm-1.384 10.5a1.171 1.171 0 1 1 1.171-1.171a1.17 1.17 0 0 1-1.171 1.168Z\"/><path fill=\"url(#__DGPICON__SVGkZYaOeHC)\" d=\"M18.096 3.802h1.24v3.054h-1.24z\"/><path fill=\"url(#__DGPICON__SVGVKO9QdOI)\" d=\"M21.4 4.56a2.55 2.55 0 0 0-2.549-2.549h-.276a2.55 2.55 0 0 0-2.436 3.3v.006a8 8 0 0 1 .261 2.561a1.8 1.8 0 0 0 .641 1.271l.109-3.441a.593.593 0 0 1 .6-.551h.135v-1.57h1.653v1.57h.1a.6.6 0 0 1 .605.551l.121 3.462a1.8 1.8 0 0 0 .666-1.292V7.72a7.7 7.7 0 0 1 .236-2.359a2.5 2.5 0 0 0 .134-.801\"/>" }
		};
		// Our type key → artwork key. filebrowser.js owns extension/filename → key.
		const FILE_ICON_KEY = {
			ts: "file-type-typescript",
			js: "file-type-js",
			py: "file-type-python",
			rs: "file-type-rust",
			go: "file-type-go",
			java: "file-type-java",
			c: "file-type-c",
			cpp: "file-type-cpp",
			cs: "file-type-csharp",
			kt: "file-type-kotlin",
			swift: "file-type-swift",
			rb: "file-type-ruby",
			php: "file-type-php",
			lua: "file-type-lua",
			dart: "file-type-dartlang",
			r: "file-type-r",
			scala: "file-type-scala",
			sh: "file-type-shell",
			vue: "file-type-vue",
			svelte: "file-type-svelte",
			graphql: "file-type-graphql",
			cmake: "file-type-cmake",
			sql: "file-type-sql",
			md: "file-type-markdown",
			txt: "file-type-text",
			log: "file-type-log",
			json: "file-type-json",
			yml: "file-type-yaml",
			toml: "file-type-toml",
			ini: "file-type-ini",
			xml: "file-type-xml",
			xls: "file-type-excel",
			csv: "file-type-excel",
			pdf: "file-type-pdf2",
			zip: "file-type-zip",
			img: "file-type-image",
			aud: "file-type-audio",
			vid: "file-type-video",
			font: "file-type-font",
			html: "file-type-html",
			css: "file-type-css",
			docker: "file-type-docker",
			env: "file-type-dotenv",
			git: "file-type-git",
			lic: "file-type-license",
			lock: "file-type-npm",
			fallback: "default-file"
		};
		const FILE_ICON_TOKEN = "__DGPICON__";
		// One component per DISTINCT artwork, cached forever: call sites render
		// inside row components, and a fresh component identity per call would
		// remount the <svg> (re-parsing its dangerouslySetInnerHTML body and
		// regenerating the useId) on every re-render — per keystroke while the
		// file search box filters. useId stays per-mounted-instance, so caching
		// the component keeps every instance's id stable across re-renders.
		const FILE_ICON_CACHE = new Map();
		/**
		 * Render one file-type icon.
		 * @param key - type key from filebrowser.js (unknown keys fall back to the generic file art).
		 * @returns component taking { size, className, style }; stable per artwork key.
		 */
		function fileIconFor(key) {
			const artKey = FILE_ICON_KEY[key] ?? FILE_ICON_KEY.fallback;
			const cached = FILE_ICON_CACHE.get(artKey);
			if (cached) return cached;
			const art = FILE_ICON_ART[artKey];
			const Icon = ({ size = 16, className, style }) => {
				// useId is collision-free per mounted instance. Its format changed
				// between React majors (':' in v18), and while any id is legal HTML,
				// url(#…) fragment references are safest on a URL-safe charset —
				// strip everything else so the substitution survives host upgrades.
				const unique = `${useId().replace(/[^A-Za-z0-9_-]/g, "")}i`;
				const body = art.body.includes(FILE_ICON_TOKEN) ? art.body.split(FILE_ICON_TOKEN).join(unique) : art.body;
				return h("svg", {
					width: size, height: size, viewBox: `0 0 ${art.w} ${art.h}`,
					xmlns: "http://www.w3.org/2000/svg", className, style, "aria-hidden": "true",
					dangerouslySetInnerHTML: { __html: body }
				});
			};
			FILE_ICON_CACHE.set(artKey, Icon);
			return Icon;
		}
		//#endregion

		//#region store
		// ── service bridges, filled by apply() ─────────────────────────────────
		let sessionsService = null;
		let workspacesService = null;

		// DSH 0.2 moved navigation out of sessions.list.current. The official
		// workspace UI identifies the main conversation by its ownership count.
		function currentSessionIdOf(snapshot) {
			const main = Object.values(snapshot?.byId ?? {}).filter((row) => (row?.retainedBy?.mainView ?? 0) > 0);
			if (main.length > 0) return main.length === 1 ? main[0].id : undefined;
			return snapshot?.current;
		}
		function workspaceCwdOf(snapshot, workspaces, sessionId = currentSessionIdOf(snapshot)) {
			const items = Array.isArray(workspaces?.items) ? workspaces.items : [];
			if (sessionId !== undefined && sessionId !== null) {
				const cwd = snapshot?.byId?.[sessionId]?.cwd;
				if (typeof cwd === "string" && cwd.trim() !== "") return cwd;
				return items.find((w) => w?.sessionIds?.includes(sessionId))?.path || "";
			}
			// During a 0.2 handoff both generations may briefly be retained.
			// Never guess an unrelated workspace when selection is ambiguous.
			if (Object.values(snapshot?.byId ?? {}).some((row) => (row?.retainedBy?.mainView ?? 0) > 0)) return "";
			if (workspaces?.phase !== "ready") return "";
			const valid = items.filter((w) => typeof w?.path === "string" && w.path.trim() !== "");
			// Legacy hero had no selected session. Preserve its first-row fallback;
			// modern hosts without a main view are safe only with one workspace.
			if (Object.prototype.hasOwnProperty.call(snapshot ?? {}, "current") || valid.length === 1) return valid[0]?.path ?? "";
			return "";
		}

		// ── modal open state shared by trigger and overlay ───────────────────────
		const overlayStore = {
			open: false,
			listeners: new Set(),
			set(open) {
				if (this.open === open) return;
				this.open = open;
				for (const fn of this.listeners) fn();
			},
			subscribe(fn) {
				this.listeners.add(fn);
				return () => this.listeners.delete(fn);
			},
			get() {
				return this.open;
			}
		};
		const subscribeOverlay = (fn) => overlayStore.subscribe(fn);
		const getOverlay = () => overlayStore.get();

		// ── suspend (temporarily hide) state, shared by trigger + overlay ────────
		// Suspending keeps every bit of panel state and slides it out of the
		// viewport, leaving a top-bar handle to hover back in. While suspended
		// the header trigger button hides (the handle is the only entry point).
		const hiddenStore = {
			hidden: false,
			listeners: new Set(),
			set(hidden) {
				if (this.hidden === hidden) return;
				this.hidden = hidden;
				for (const fn of this.listeners) fn();
			},
			subscribe(fn) {
				this.listeners.add(fn);
				return () => this.listeners.delete(fn);
			},
			get() {
				return this.hidden;
			}
		};
		const subscribeHidden = (fn) => hiddenStore.subscribe(fn);
		const getHidden = () => hiddenStore.get();

		// ── external file-open request (from the openPath interception) ──────────
		// When the "open produced files in the panel" setting is on, the wrapped
		// workspaces.openPath routes FILE clicks here: {path, ts} wakes the file
		// tab and opens a preview of that absolute path. Directories are never
		// routed here (they keep the system "open in folder" behavior).
		// `ts` is a MONOTONIC COUNTER, not Date.now(): two clicks on the same
		// file within one millisecond would collide on a wall-clock stamp and
		// the consumer's dedup guard would silently drop the second open.
		let openReqSeq = 0;
		const openReqStore = {
			req: null,
			listeners: new Set(),
			request(path) {
				openReqSeq += 1;
				this.req = { path, ts: openReqSeq };
				for (const fn of this.listeners) fn();
			},
			// Closing the panel must forget any pending open request: reopening
			// must start clean instead of replaying the last produced-file click.
			clear() {
				if (this.req === null) return;
				this.req = null;
				for (const fn of this.listeners) fn();
			},
			subscribe(fn) {
				this.listeners.add(fn);
				return () => this.listeners.delete(fn);
			},
			get() {
				return this.req;
			}
		};
		const subscribeOpenReq = (fn) => openReqStore.subscribe(fn);
		const getOpenReq = () => openReqStore.get();

		// ── file → composer reference request (panel scope → session scope) ──────
		// The panel lives in the SHELL scope, but writing the composer draft needs
		// the session-scope input face: slot components mounted inside a session
		// receive `inputActions` (the documented programmatic draft write) and the
		// InputState projection. This store bridges the two — a row button records
		// {path, isDir} and the session-scope injector consumes it ONCE and
		// appends the `@path` mention. `ts` is a monotonic counter (not Date.now):
		// two clicks within the same millisecond must stay distinct, the same
		// reason openReqStore counts.
		let refReqSeq = 0;
		const refReqStore = {
			req: null,
			listeners: new Set(),
			request(path, isDir) {
				refReqSeq += 1;
				this.req = { path, isDir, ts: refReqSeq };
				for (const fn of this.listeners) fn();
			},
			// Take-and-clear in one step so two injectors (the dock and the header
			// slot are both registered) can never insert the same request twice.
			consume() {
				const req = this.req;
				this.req = null;
				return req;
			},
			clear() {
				if (this.req === null) return;
				this.req = null;
				for (const fn of this.listeners) fn();
			},
			subscribe(fn) {
				this.listeners.add(fn);
				return () => this.listeners.delete(fn);
			},
			get() {
				return this.req;
			}
		};
		const requestReference = (path, isDir) => refReqStore.request(path, isDir);
		const consumeRefReq = () => refReqStore.consume();
		const subscribeRefReq = (fn) => refReqStore.subscribe(fn);
		const clearRefReq = () => refReqStore.clear();

		// ── narrow-viewport (mobile) flag ────────────────────────────────────────
		// Single source of truth for the narrow-screen layout: evaluated once
		// from matchMedia and kept live through the change listener. CSS keys
		// off the data-narrow attribute this drives on .dgp-root, and render
		// logic reads this same store — never two independent media queries.
		// Breakpoint (定案 2026-09): ≤720px, or a touch device (no hover) up to
		// 1024px — narrow tablets take the drill-down layout because split
		// panes + pointer-drag gutters are mouse affordances.
		const narrowStore = {
			narrow: false,
			listeners: new Set(),
			set(v) {
				if (this.narrow === v) return;
				this.narrow = v;
				for (const fn of this.listeners) fn();
			},
			subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
			get() { return this.narrow; }
		};
		if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
			try {
				const mq = window.matchMedia("(max-width: 720px), ((hover: none) and (max-width: 1024px))");
				narrowStore.narrow = mq.matches === true;
				const onMq = (e) => narrowStore.set(e.matches === true);
				if (typeof mq.addEventListener === "function") mq.addEventListener("change", onMq);
				else if (typeof mq.addListener === "function") mq.addListener(onMq);   // legacy Safari
			} catch { /* matchMedia unavailable: desktop layout stays */ }
		}
		const subscribeNarrow = (fn) => narrowStore.subscribe(fn);
		const getNarrow = () => narrowStore.get();
		const useNarrow = () => useSyncExternalStore(subscribeNarrow, getNarrow);
		//#endregion

		//#region i18n
		// ── i18n: follow DSH locale (zh / en) ───────────────────────────────────
		// DSH's locale service (ctx.locale, inject "locale") keeps per-namespace
		// dictionaries ({zh, en} — bilingual balance enforced), exposes
		// bind(ns) → a STABLE t(key, params) with {name} placeholders, and a
		// uSES-safe LocaleFace (getSnapshot/subscribe, revision bumps on switch
		// or registration). We register one namespace, translate every visible
		// string through the module t(), and re-render on locale switches via
		// useT() — uSES inside each component, so React.memo children re-render
		// too (the hook's store update bypasses props comparison). Non-React
		// code (rpc errors, runOp labels) stores translation KEYS in state and
		// renders them through t() later, so language switches stay consistent.
		const LOCALE_NS = "files-git";

		const zh = {
			// common
			"common.loading": "加载中…",
			"common.emptyDir": "（空目录）",
			"common.close": "关闭",
			"common.back": "返回",
			"common.cancel": "取消",
			"common.ok": "确定",
			"common.retry": "重试",
			"common.clear": "清除",
			"common.history": "历史",
			"common.refresh": "刷新",
			"common.openDir": "打开目录",
			"common.cleanAll": "清空",
			"common.viewAll": "查看全部",
			"common.doubleClick": "双击预览",
			"common.expandCollapse": "{path}\n点击展开 / 收起",
			"common.items": "{count} 项",
			// trigger capsule
			"trigger.title": "文件与 Git 操作（当前工作区）",
			"trigger.label": "文件与变更",
			"trigger.resumeLabel": "展开文件与变更面板",
			"trigger.resumeTitle": "点击或按回车恢复面板，当前内容会保留",
			// panel shell
			"panel.title": "文件与变更",
			"panel.suspend": "挂起并保留当前状态；鼠标移到顶部露出区域即可展开，移出面板后会自动挂起",
			"panel.renderErr": "面板渲染出错：{msg}（点击重试；若持续出现请重启 dsh 进程后刷新页面）",
			"panel.restore": "还原窗口",
			"panel.maximize": "全屏（四周留边）",
			"panel.close": "关闭（清空面板状态）",
			"panel.loadingSession": "正在加载会话…",
			"panel.noWorkspace": "暂无当前工作区：新建或选择一个工作区后，文件面板会自动指向该工作区目录。",
			"panel.aria": "文件面板",
			// tabs
			"tab.files": "文件",
			"tab.settings": "设置",
			// file browser
			"file.badgeConflict": "冲突",
			"file.badgeUntracked": "未跟踪",
			"file.badgeStagedMod": "暂存+修改",
			"file.badgeStaged": "已暂存",
			"file.badgeModified": "已修改",
			"file.ignoredHint": "该路径已被 .gitignore 忽略",
			"file.searchAll": "搜索整个工作区的文件（含子目录）…",
			"file.searchDir": "搜索当前目录…",
			"file.recent": "最近搜索",
			"file.noHistory": "暂无搜索历史（输入关键词会自动记录）",
			"file.results": "搜索结果（{count}）· 整个工作区",
			"file.colName": "名称",
			"file.colTime": "修改时间",
			"file.colSize": "大小",
			"file.morePath": "更早的目录",
			"file.noMatch": "（无匹配文件）",
			"file.openFolder": "在文件资源管理器中打开当前目录",
			"file.openFolderShort": "打开当前目录",
			"git.changedFiles": "变更文件",
			"git.chooseFileHint": "选择左侧文件查看差异",
			"gv.forceAction": "强制推送…",
			"panel.navigation": "页面与面板操作",
			"file.openDirRow": "打开目录",
			"file.openDirRowTitle": "在文件资源管理器中打开所在目录",
			"file.actionsTitle": "文件操作",
			"file.copyPath": "复制路径",
			"file.copyPathTitle": "复制绝对路径到剪贴板",
			"file.copyName": "复制名称",
			"file.copyNameTitle": "复制文件名到剪贴板",
			"file.copied": "已复制",
			"file.truncatedNote": "\n…（文件超过 512KB，仅显示前 512KB）",
			"file.binary": "二进制文件，无法预览",
			"file.cantPreview": "无法在面板内预览该文件（可能已被删除或不可读）：{path}",
			"file.openSystem": "在系统应用中打开",
			"file.gutter": "拖动调整左右宽度，双击恢复默认",
			// reference into the composer (inserts an @path mention)
			"file.reference": "引用到输入框",
			"file.referenceHint": "在输入框插入 @ 引用，让 Agent 直接定位此条目",
			"file.referenceDirHint": "在输入框插入 @ 引用（目录，末尾带 /）",
			// delete (row menu + multi-select)
			"file.delete": "删除",
			"file.deleteHint": "从磁盘删除此文件",
			"file.deleteDirHint": "从磁盘删除此目录及其全部内容",
			"file.deleteSel": "删除所选",
			"file.deleteTitle": "删除 {name}？",
			"file.deleteTitleMany": "删除选中的 {count} 项？",
			"file.deleteMsg": "文件将从磁盘移除，无法撤销。",
			"file.deleteMsgDir": "目录及其全部内容将从磁盘移除，无法撤销。",
			"file.deleteMsgMany": "所选条目将从磁盘移除（目录连同其全部内容），无法撤销。",
			"file.deleting": "正在删除 {name}…",
			"file.deleteFail": "删除失败：{msg}",
			// upload / download / batch export
			"file.download": "下载",
			"file.downloadTitle": "下载文件到本机（浏览器默认下载目录）",
			"file.downloading": "正在下载 {name}…",
			"file.downloadFailRow": "下载失败：{msg}",
			"file.loadFailed": "目录加载失败",
			"file.downloadZip": "下载为 ZIP",
			"file.downloadZipTitle": "把整个目录打包为 ZIP 下载",
			"file.upload": "上传",
			"file.uploadTitle": "上传文件到当前目录",
			"file.uploading": "上传 {name}（{pct}%）",
			"file.uploadFailRow": "上传失败：{msg}",
			"file.overwriteTitle": "文件已存在",
			"file.overwriteMsg": "当前目录已存在 {name}，覆盖它？",
			"file.overwrite": "覆盖",
			"file.exporting": "正在打包 {count} 项…",
			"file.exportFailRow": "导出失败：{msg}",
			"file.multi": "多选",
			"file.multiTitle": "进入多选模式：勾选文件或目录后批量导出 ZIP",
			"file.selectedCount": "已选 {count} 项",
			"file.exportSel": "导出 ZIP",
			// preview actions
			"pv.preview": "预览",
			"file.directoryActions": "目录操作",
			"gv.repoActions": "仓库操作",
			"git.selectionActions": "选择操作",
			"pv.source": "源码",
			"pv.copyContent": "复制内容",
			"pv.copyContentTitle": "复制当前文件内容",
			"pv.copyContentTruncatedTitle": "文件超过 512KB，仅复制已加载的预览内容",
			"pv.copyFailed": "复制失败",
			"pv.edit": "编辑",
			"pv.save": "保存",
			"pv.saving": "保存中…",
			"pv.openEditor": "在编辑器中打开",
			"pv.closePreview": "关闭预览",
			"pv.editHint": "在面板内编辑此文件",
			"pv.editTruncated": "文件超过 512KB，仅显示前 512KB，编辑将丢失其余内容",
			"pv.loadingEditor": "正在加载编辑器…",
			"pv.loadingPreview": "正在准备预览…",
			"pv.renderHighlight": "正在渲染语法高亮…",
			"pv.renderMd": "正在渲染 Markdown（{pct}%）…大文档会分块渐进显示",
			"pv.editFail": "编辑器加载失败（需要网络）：{msg}",
			"pv.modeAria": "预览方式",
			"pv.mediaLoading": "正在加载媒体文件…",
			"pv.mediaFail": "媒体文件加载失败：{msg}",
			"pv.openBrowser": "在浏览器打开",
			"pv.openBrowserTitle": "在浏览器新标签页中打开（图片 / PDF 为内存副本，随面板关闭失效）",
			// git change list
			"git.changes": "变更（{count}）",
			"git.conflicts": "冲突（{count}）",
			"git.staged": "已暂存（{count}）",
			"git.unstaged": "未暂存（{count}）",
			"git.untracked": "未跟踪（{count}）",
			"git.clean": "工作区干净",
			"git.flagStaged": "已暂存",
			"git.flagUnstaged": "未暂存",
			"git.flagUntracked": "未跟踪",
			"git.stage": "暂存",
			"git.unstage": "取消暂存",
			"git.track": "跟踪",
			"git.untrack": "取消跟踪",
			"git.ignore": "忽略",
			"git.allDiff": "查看全部差异",
			"git.selectAll": "全选",
			"git.deselectAll": "取消全选",
			"git.back": "返回",
			"git.actStage": "git add：暂存 {path} 下全部未暂存文件",
			"git.actUnstage": "git restore --staged：取消暂存 {path} 下全部文件",
			"git.actUntrack": "git rm --cached -r：取消跟踪 {path} 下全部文件（保留磁盘文件）",
			"git.actTrack": "git add：跟踪 {path} 下全部未跟踪文件",
			"git.actIgnore": "把 {path} 追加到 .gitignore，忽略其下所有未跟踪变更",
			"git.trackFile": "git add：将该文件加入跟踪清单",
			"git.ignoreFile": "追加到 .gitignore",
			// diff pane
			"diff.title": "差异：{label}",
			"diff.allUnstaged": "全部变更（未暂存）",
			"diff.allStaged": "全部变更（已暂存）",
			"diff.stagedSuffix": "（已暂存）",
			"diff.noContent": "（无差异内容 — 二进制文件）",
			"diff.empty": "（无差异内容）",
			"diff.truncatedRows": "…（差异过大，仅显示前 {count} 行）",
			"diff.truncatedText": "…（内容过长，已截断）",
			// commit
			"commit.placeholder": "提交信息（必填）",
			"commit.ctrlEnter": "Ctrl+Enter 提交全部",
			"commit.sel": "提交选中",
			"commit.all": "提交全部",
			"commit.committing": "提交中…",
			"commit.done": "操作完成",
			"commit.msgRequired": "请输入提交信息",
			"commit.noneSelected": "未选择任何文件（或勾选“提交全部”）",
			"commit.title": "提交 {hash}",
			"commit.filesHint": "{count} 个文件 · 点击左侧文件查看对应 diff",
			"commit.files": "变更文件（{count}）",
			"commit.noFiles": "（无文件变更）",
			"commit.noFile": "（无变更文件）",
			// history
			"hist.title": "提交历史",
			"hist.recent": "最近 {count} 条提交 · 点击展开",
			"hist.expand": "展开",
			"hist.collapse": "收起",
			"hist.loadMore": "加载更多（{count}）",
			"hist.rowTitle": "点击查看该提交的变更文件；右键或行尾菜单按钮打开提交操作",
			"hist.menuTitle": "提交操作（回滚 / 重置到此）",
			"hist.view": "查看变更",
			"hist.revert": "回滚此提交 (revert)",
			"hist.resetSoft": "重置到此（保留更改）",
			"hist.resetHard": "重置到此（丢弃更改）",
			"hist.revertTitle": "回滚提交 {hash}",
			"hist.revertMsg": "git revert {hash}\n\n将创建一个新提交来撤销该提交的更改（保留历史）。\n提交内容：{subject}",
			"hist.revertConfirm": "创建回滚提交",
			"hist.resetSoftTitle": "重置到此提交（reset --soft {hash}）",
			"hist.resetSoftMsg": "将当前分支指向 {hash}，此提交之后的提交从历史移除，但全部更改保留在暂存区。\n\n提交内容：{subject}",
			"hist.resetSoftConfirm": "重置（保留更改）",
			"hist.resetHardTitle": "重置到此提交（reset --hard {hash}）",
			"hist.resetHardMsg": "将 HEAD、暂存区和工作区全部回退到 {hash}。\n\n此提交之后的提交以及所有未提交更改将永久丢失，无法恢复！\n提交内容：{subject}",
			"hist.resetHardConfirm": "我了解，丢弃更改",
			// branches
			"branch.current": "当前",
			"branch.remote": "远端",
			"branch.local": "本地",
			"branch.upstream": "上游：{name}",
			"branch.title": "分支：{name}",
			"branch.checkout": "检出",
			"branch.checkoutTitle": "git checkout：切换到该分支",
			"branch.currentTitle": "已在当前分支",
			"branch.merge": "合并入当前",
			"branch.mergeTitle": "git merge：将该分支合并到当前分支",
			"branch.mergeCurrent": "不能合并当前分支",
			"branch.new": "新建分支",
			"branch.newTitle": "从该分支新建分支（checkout -b）",
			"branch.update": "更新",
			"branch.updateTitle": "git fetch + fast-forward：将本地分支快进到远端最新",
			"branch.remoteNoUpdate": "远端分支无需更新",
			"branch.rename": "重命名",
			"branch.renameTitle": "git branch -m：重命名分支",
			"branch.remoteNoRename": "远端分支不能重命名",
			"branch.newName": "新分支名称",
			"branch.newRename": "新名称",
			"branch.arrowTitle": "展开分支列表（本地 {l} · 远端 {r}）",
			"branch.popTitle": "分支（本地 {l} · 远端 {r}）",
			"branch.search": "搜索分支…",
			"branch.noMatch": "无匹配分支",
			// git action bar
			"gv.pull": "拉取",
			"gv.pullBusy": "拉取中…",
			"gv.push": "推送",
			"gv.pushBusy": "推送中…",
			"gv.fetch": "获取",
			"gv.fetchBusy": "获取中…",
			"gv.rebase": "变基",
			"gv.force": "强推",
			"gv.rebaseTitle": "拉取时使用 git pull --rebase：把当前分支的本地提交“重放”到远端最新提交之上，保持提交历史线性（需配合强推推送）",
			"gv.forceTitle": "推送时使用 git push --force-with-lease：强制覆盖远端历史（危险！仅当本地已变基/改写历史且确认远端无人提交时使用）",
			"gv.pullTitle": "git pull = fetch + merge：拉取远端最新并合并到当前分支",
			"gv.pushTitle": "git push：将本地提交上传到远端",
			"gv.fetchTitle": "git fetch：只下载远端最新提交到本地引用（origin/*），不改动工作区、不合并。用于先查看远端进展",
			"gv.forceTitle2": "强制推送确认",
			"gv.forceMsg": "即将执行 git push --force-with-lease，强制覆盖远端{upstream}的历史。\n\n仅当你已变基/改写本地历史、且确认远端没有其他人提交时才能这么做。此操作可能丢失远端提交！",
			"gv.forceUpstream": "（上游 {name}）",
			"gv.forceConfirm": "我了解，强制推送",
			"gv.busy": "执行中：{op}…",
			"gv.ahead": "待推送 {count} 个提交",
			"gv.behind": "待拉取 {count} 个更新",
			"gv.noIdentity": "未配置 user.name/user.email",
			"gv.repoInfo": "仓库信息",
			"gv.upstreamLabel": "上游分支",
			"gv.remoteLabel": "远程地址",
			"gv.identityLabel": "提交身份",
			"gv.conflicts": "{count} 个冲突",
			"gv.opRunning": "{label}中…",
			"gv.opSuccess": "{label}成功",
			"gv.opFailed": "{label}失败",
			"gv.opClose": "关闭本次操作输出",
			"gv.opCloseAria": "关闭输出",
			// settings
			"set.title": "面板设置",
			"set.editorGroup": "编辑器主题",
			"set.themeHint": "按主题家族选择，自动跟随面板明暗切换对应的浅色或深色样式。",
			"set.themeAuto": "跟随面板（VS Code）",
			"set.themeFamilyVsCode": "VS Code",
			"set.themeFamilyHighContrast": "高对比",
			"set.themeFamilyGithub": "GitHub",
			"set.themeFamilyOne": "One",
			"set.themeFamilyDracula": "Dracula",
			"set.themeFamilyMonokai": "Monokai",
			"set.themeFamilyNord": "Nord",
			"set.themeFamilySolarized": "Solarized",
			"set.themeFamilyGruvbox": "Gruvbox",
			"set.themeFamilyAyu": "Ayu",
			"set.themeFamilyMaterial": "Material",
			"set.themeFamilyTokyoNight": "Tokyo Night",
			"set.themeFamilyCatppuccin": "Catppuccin",
			"set.themeVs": "VS Code Light",
			"set.themeVsDark": "VS Code Dark+",
			"set.themeHcLight": "浅色（高对比）",
			"set.themeHcBlack": "深色（高对比）",
			"set.themeGithubLight": "GitHub Light",
			"set.themeGithubDark": "GitHub Dark",
			"set.themeOneLight": "One Light",
			"set.themeOneDark": "One Dark",
			"set.themeDracula": "Dracula",
			"set.themeDraculaLight": "Dracula Light",
			"set.themeMonokai": "Monokai",
			"set.themeMonokaiLight": "Monokai Light",
			"set.themeNord": "Nord",
			"set.themeNordLight": "Nord Light",
			"set.themeSolarizedLight": "Solarized Light",
			"set.themeSolarizedDark": "Solarized Dark",
			"set.themeGruvboxLight": "Gruvbox Light",
			"set.themeGruvboxDark": "Gruvbox Dark",
			"set.themeAyuLight": "Ayu Light",
			"set.themeAyuDark": "Ayu Dark",
			"set.themeMaterialLight": "Material Light",
			"set.themeMaterialDark": "Material Dark",
			"set.themeTokyoNight": "Tokyo Night",
			"set.themeTokyoNightDay": "Tokyo Night Day",
			"set.themeCatppuccinLatte": "Catppuccin Latte",
			"set.themeCatppuccinMocha": "Catppuccin Mocha",
			"set.uiFont": "面板界面字体",
			"set.uiSize": "UI 字号",
			"set.uiSizeHint": "10–20 px，默认 13 px；立即应用于面板文字与列表。",
			"set.previewSize": "预览字号",
			"set.previewSizeHint": "8–24 px，默认 12 px；用于文本、代码、Markdown 及 Git 差异。",
			"set.sizeSample": "预览示例 Aa 0123 · const fontSize = 12;",
			"set.fontHint": "字体未安装时会自动回退到字体栈中的下一项。",
			"set.fontUiSystem": "跟随系统",
			"set.fontUiInter": "Inter",
			"set.fontUiSegoe": "Segoe UI",
			"set.fontUiNoto": "Noto Sans SC",
			"set.fontUiYahei": "微软雅黑",
			"set.codeFont": "代码等宽字体",
			"set.codeFontHint": "应用于代码预览、Git 差异和路径等宽文本；优先使用本机已安装字体。",
			"set.fontCodeSystem": "跟随系统",
			"set.fontCodeCascadia": "Cascadia Code",
			"set.fontCodeCascadiaMono": "Cascadia Mono",
			"set.fontCodeConsolas": "Consolas",
			"set.fontCodeCourier": "Courier New",
			"set.defaultOpen": "面板打开默认全屏",
			"set.maximized": "默认全屏",
			"set.normal": "非全屏",
			"set.applyHint": "选择后立即应用于当前窗口，并作为下次打开面板的默认状态。",
			"set.click": "点击产物文件时",
			"set.panelPreview": "用本面板预览",
			"set.systemOpen": "交给 DSH 默认行为",
			"set.previewHint": "选「用本面板预览」时，点击对话里产生的文件（产物 chip / 文件提及 / 工具文件链接）会用本面板展开并预览；选「交给 DSH 默认行为」时不做任何拦截，由 DSH 自行处理（右侧栏预览或系统打开）。目录与「在文件夹中显示」始终走系统。",
			// status letters
			"letter.M": "修改",
			"letter.A": "新增",
			"letter.D": "删除",
			"letter.R": "重命名",
			"letter.C": "复制",
			"letter.U": "冲突",
			"letter.?": "未跟踪",
			"letter.!": "忽略",
			// rpc
			"rpc.badResponse": "dsh-files-git: 响应格式错误",
			"rpc.failed": "操作失败",
			"rpc.timeout": "接口 {method} 超时：{ms}ms 内无响应（服务端可能仍在执行）",
			"rpc.netError": "下载 {name} 时网络中断，文件可能不完整",
			// editor (CodeMirror lazy loading — Monaco replaced CM years ago;
			// these keys are kept only for translator-reference continuity)
			"editor.loadFailed": "无法加载 {spec}",
			// operation labels (runOp busy/op state stores these KEYS)
			"op.refresh": "刷新",
			"op.diff": "读取差异",
			"op.read": "读取文件",
			"op.commitRead": "读取提交",
			"op.commitAll": "提交全部",
			"op.commitSel": "提交选中",
			"op.checkoutNew": "新建分支",
			"op.checkout": "检出",
			"op.merge": "合并",
			"op.update": "更新分支",
			"op.rename": "重命名",
			"op.stage": "暂存",
			"op.unstage": "取消暂存",
			"op.untrack": "取消跟踪",
			"op.ignore": "忽略",
			"op.pull": "拉取",
			"op.push": "推送",
			"op.fetch": "获取",
			"op.revert": "回滚提交",
			"op.reset": "重置"
		};

		const en = {
			// common
			"common.loading": "Loading…",
			"common.emptyDir": "(empty)",
			"common.close": "Close",
			"common.back": "Back",
			"common.cancel": "Cancel",
			"common.ok": "OK",
			"common.retry": "Retry",
			"common.clear": "Clear",
			"common.history": "History",
			"common.refresh": "Refresh",
			"common.openDir": "Open folder",
			"common.cleanAll": "Clear all",
			"common.viewAll": "View all",
			"common.doubleClick": "Double-click to preview",
			"common.expandCollapse": "{path}\nClick to expand / collapse",
			"common.items": "{count} items",
			// trigger capsule
			"trigger.title": "Files & Git (current workspace)",
			"trigger.label": "Files & Changes",
			"trigger.resumeLabel": "Restore Files & Changes panel",
			"trigger.resumeTitle": "Click or press Enter to restore the panel; your current state is preserved",
			// panel shell
			"panel.title": "Files & Changes",
			"panel.suspend": "Suspend and keep the current state; hover the exposed top edge to restore, and the panel auto-suspends when the pointer leaves",
			"panel.renderErr": "Panel render error: {msg} (click retry; if it persists, restart the dsh process and refresh)",
			"panel.restore": "Restore window",
			"panel.maximize": "Maximize (with margins)",
			"panel.close": "Close (clears panel state)",
			"panel.loadingSession": "Loading session…",
			"panel.noWorkspace": "No active workspace: create or select one and the file panel will point at its directory.",
			"panel.aria": "File Panel",
			// tabs
			"tab.files": "Files",
			"tab.settings": "Settings",
			// file browser
			"file.badgeConflict": "Conflict",
			"file.badgeUntracked": "Untracked",
			"file.badgeStagedMod": "Staged+modified",
			"file.badgeStaged": "Staged",
			"file.badgeModified": "Modified",
			"file.ignoredHint": "Ignored via .gitignore",
			"file.searchAll": "Search all workspace files…",
			"file.searchDir": "Search current directory…",
			"file.recent": "Recent searches",
			"file.noHistory": "No search history (terms are saved automatically)",
			"file.results": "Search results ({count}) · whole workspace",
			"file.colName": "Name",
			"file.colTime": "Modified",
			"file.colSize": "Size",
			"file.morePath": "Earlier folders",
			"file.noMatch": "(no matching files)",
			"file.openFolder": "Open current directory in file explorer",
			"file.openFolderShort": "Open current directory",
			"git.changedFiles": "Changed files",
			"git.chooseFileHint": "Select a file to view its diff",
			"gv.forceAction": "Force push…",
			"panel.navigation": "Pages and panel actions",
			"file.openDirRow": "Open folder",
			"file.openDirRowTitle": "Open containing folder in file explorer",
			"file.actionsTitle": "File actions",
			"file.copyPath": "Copy path",
			"file.copyPathTitle": "Copy absolute path to clipboard",
			"file.copyName": "Copy name",
			"file.copyNameTitle": "Copy file name to clipboard",
			"file.copied": "Copied",
			"file.truncatedNote": "\n…(file >512KB, first 512KB shown)",
			"file.binary": "Binary file, cannot preview",
			"file.cantPreview": "Cannot preview this file in the panel (deleted or unreadable?): {path}",
			"file.openSystem": "Open in system app",
			"file.gutter": "Drag to resize, double-click to reset",
			// reference into the composer (inserts an @path mention)
			"file.reference": "Reference in input",
			"file.referenceHint": "Insert an @ reference into the input so the agent locates this entry",
			"file.referenceDirHint": "Insert an @ reference into the input (directory, trailing /)",
			// delete (row menu + multi-select)
			"file.delete": "Delete",
			"file.deleteHint": "Delete this file from disk",
			"file.deleteDirHint": "Delete this directory and everything in it from disk",
			"file.deleteSel": "Delete selected",
			"file.deleteTitle": "Delete {name}?",
			"file.deleteTitleMany": "Delete the {count} selected entries?",
			"file.deleteMsg": "The file is removed from disk. This cannot be undone.",
			"file.deleteMsgDir": "The directory and everything in it is removed from disk. This cannot be undone.",
			"file.deleteMsgMany": "The selected entries (directories include their entire contents) are removed from disk. This cannot be undone.",
			"file.deleting": "Deleting {name}…",
			"file.deleteFail": "Delete failed: {msg}",
			// upload / download / batch export
			"file.download": "Download",
			"file.downloadTitle": "Download this file via the browser",
			"file.downloading": "Downloading {name}…",
			"file.downloadFailRow": "Download failed: {msg}",
			"file.loadFailed": "Failed to load this directory",
			"file.downloadZip": "Download as ZIP",
			"file.downloadZipTitle": "Pack the whole folder into a ZIP and download",
			"file.upload": "Upload",
			"file.uploadTitle": "Upload files to the current directory",
			"file.uploading": "Uploading {name} ({pct}%)",
			"file.uploadFailRow": "Upload failed: {msg}",
			"file.overwriteTitle": "File already exists",
			"file.overwriteMsg": "{name} already exists in this folder. Overwrite it?",
			"file.overwrite": "Overwrite",
			"file.exporting": "Packing {count} item(s)…",
			"file.exportFailRow": "Export failed: {msg}",
			"file.multi": "Multi-select",
			"file.multiTitle": "Enter multi-select mode: check files or folders, then export them as ZIP",
			"file.selectedCount": "{count} selected",
			"file.exportSel": "Export ZIP",
			// preview actions
			"pv.preview": "Preview",
			"file.directoryActions": "Directory actions",
			"gv.repoActions": "Repository actions",
			"git.selectionActions": "Selection actions",
			"pv.source": "Source",
			"pv.copyContent": "Copy content",
			"pv.copyContentTitle": "Copy the current file contents",
			"pv.copyContentTruncatedTitle": "File exceeds 512 KB; only the loaded preview is copied",
			"pv.copyFailed": "Copy failed",
			"pv.edit": "Edit",
			"pv.save": "Save",
			"pv.saving": "Saving…",
			"pv.openEditor": "Open in editor",
			"pv.closePreview": "Close preview",
			"pv.editHint": "Edit this file in the panel",
			"pv.editTruncated": "File >512KB, only first 512KB shown; editing will drop the rest",
			"pv.loadingEditor": "Loading editor…",
			"pv.loadingPreview": "Preparing preview…",
			"pv.renderHighlight": "Rendering syntax highlight…",
			"pv.renderMd": "Rendering Markdown ({pct}%)… large documents stream in progressively",
			"pv.editFail": "Editor load failed (network required): {msg}",
			"pv.modeAria": "Preview mode",
			"pv.mediaLoading": "Loading media…",
			"pv.mediaFail": "Failed to load media: {msg}",
			"pv.openBrowser": "Open in browser",
			"pv.openBrowserTitle": "Open in a new browser tab (image/PDF open an in-memory copy tied to this panel)",
			// git change list
			"git.changes": "Changes ({count})",
			"git.conflicts": "Conflicts ({count})",
			"git.staged": "Staged ({count})",
			"git.unstaged": "Unstaged ({count})",
			"git.untracked": "Untracked ({count})",
			"git.clean": "Working tree clean",
			"git.flagStaged": "Staged",
			"git.flagUnstaged": "Unstaged",
			"git.flagUntracked": "Untracked",
			"git.stage": "Stage",
			"git.unstage": "Unstage",
			"git.track": "Track",
			"git.untrack": "Untrack",
			"git.ignore": "Ignore",
			"git.allDiff": "View full diff",
			"git.selectAll": "Select all",
			"git.deselectAll": "Deselect all",
			"git.back": "Back",
			"git.actStage": "git add: stage all unstaged files under {path}",
			"git.actUnstage": "git restore --staged: unstage all files under {path}",
			"git.actUntrack": "git rm --cached -r: untrack all files under {path} (keep files on disk)",
			"git.actTrack": "git add: track all untracked files under {path}",
			"git.actIgnore": "Append {path} to .gitignore to ignore all untracked changes under it",
			"git.trackFile": "git add: add this file to tracking",
			"git.ignoreFile": "Append to .gitignore",
			// diff pane
			"diff.title": "Diff: {label}",
			"diff.allUnstaged": "All changes (unstaged)",
			"diff.allStaged": "All changes (staged)",
			"diff.stagedSuffix": " (staged)",
			"diff.noContent": "(no diff content — binary file)",
			"diff.empty": "(no diff content)",
			"diff.truncatedRows": "…(diff too large, first {count} rows shown)",
			"diff.truncatedText": "…(content too long, truncated)",
			// commit
			"commit.placeholder": "Commit message (required)",
			"commit.ctrlEnter": "Ctrl+Enter commits all",
			"commit.sel": "Commit selected",
			"commit.all": "Commit all",
			"commit.committing": "Committing…",
			"commit.done": "Done",
			"commit.msgRequired": "Enter a commit message",
			"commit.noneSelected": "No files selected (or check “commit all”)",
			"commit.title": "Commit {hash}",
			"commit.filesHint": "{count} files · click a file to see its diff",
			"commit.files": "Changed files ({count})",
			"commit.noFiles": "(no file changes)",
			"commit.noFile": "(no changed file)",
			// history
			"hist.title": "Commit history",
			"hist.recent": "Latest {count} commits · click to expand",
			"hist.expand": "Expand",
			"hist.collapse": "Collapse",
			"hist.loadMore": "Load more ({count})",
			"hist.rowTitle": "Click to view changed files; right-click or use the row menu button for commit actions",
			"hist.menuTitle": "Commit actions (revert / reset here)",
			"hist.view": "View changes",
			"hist.revert": "Revert this commit",
			"hist.resetSoft": "Reset here (keep changes)",
			"hist.resetHard": "Reset here (discard changes)",
			"hist.revertTitle": "Revert commit {hash}",
			"hist.revertMsg": "git revert {hash}\n\nCreates a new commit that undoes this commit's changes (history preserved).\nSubject: {subject}",
			"hist.revertConfirm": "Create revert commit",
			"hist.resetSoftTitle": "Reset to this commit (reset --soft {hash})",
			"hist.resetSoftMsg": "Points the current branch at {hash}; later commits leave history but all changes stay staged.\n\nSubject: {subject}",
			"hist.resetSoftConfirm": "Reset (keep changes)",
			"hist.resetHardTitle": "Reset to this commit (reset --hard {hash})",
			"hist.resetHardMsg": "Moves HEAD, index and working tree back to {hash}.\n\nAll later commits and uncommitted changes are permanently lost!\nSubject: {subject}",
			"hist.resetHardConfirm": "I understand, discard changes",
			// branches
			"branch.current": "Current",
			"branch.remote": "Remote",
			"branch.local": "Local",
			"branch.upstream": "upstream: {name}",
			"branch.title": "Branch: {name}",
			"branch.checkout": "Checkout",
			"branch.checkoutTitle": "git checkout: switch to this branch",
			"branch.currentTitle": "Already on this branch",
			"branch.merge": "Merge into current",
			"branch.mergeTitle": "git merge: merge this branch into the current one",
			"branch.mergeCurrent": "Cannot merge current branch",
			"branch.new": "New branch",
			"branch.newTitle": "Create a branch from this one (checkout -b)",
			"branch.update": "Update",
			"branch.updateTitle": "git fetch + fast-forward: fast-forward local branch to latest remote",
			"branch.remoteNoUpdate": "Remote branches need no update",
			"branch.rename": "Rename",
			"branch.renameTitle": "git branch -m: rename branch",
			"branch.remoteNoRename": "Cannot rename remote branch",
			"branch.newName": "New branch name",
			"branch.newRename": "New name",
			"branch.arrowTitle": "Expand branch list ({l} local · {r} remote)",
			"branch.popTitle": "Branches ({l} local · {r} remote)",
			"branch.search": "Search branches…",
			"branch.noMatch": "No matching branches",
			// git action bar
			"gv.pull": "Pull",
			"gv.pullBusy": "Pulling…",
			"gv.push": "Push",
			"gv.pushBusy": "Pushing…",
			"gv.fetch": "Fetch",
			"gv.fetchBusy": "Fetching…",
			"gv.rebase": "Rebase",
			"gv.force": "Force push",
			"gv.rebaseTitle": "Use git pull --rebase: replay local commits on top of the latest remote, keeping history linear (needs force-push)",
			"gv.forceTitle": "Use git push --force-with-lease: force-overwrite remote history (dangerous! only after rebasing/rewriting history and confirming nobody else pushed)",
			"gv.pullTitle": "git pull = fetch + merge: pull latest remote and merge into current branch",
			"gv.pushTitle": "git push: upload local commits to remote",
			"gv.fetchTitle": "git fetch: only download latest remote commits to local refs (origin/*) — no working-tree or merge changes. Use to inspect remote progress first",
			"gv.forceTitle2": "Confirm force push",
			"gv.forceMsg": "About to run git push --force-with-lease, force-overwriting the remote{upstream} history.\n\nOnly do this after rebasing/rewriting local history and confirming nobody else pushed. This can lose remote commits!",
			"gv.forceUpstream": " ({name})",
			"gv.forceConfirm": "I understand, force push",
			"gv.busy": "Running: {op}…",
			"gv.ahead": "{count} commits to push",
			"gv.behind": "{count} updates to pull",
			"gv.noIdentity": "user.name/user.email not configured",
			"gv.repoInfo": "Repository info",
			"gv.upstreamLabel": "Upstream",
			"gv.remoteLabel": "Remote URL",
			"gv.identityLabel": "Commit identity",
			"gv.conflicts": "{count} conflicts",
			"gv.opRunning": "{label}…",
			"gv.opSuccess": "{label} succeeded",
			"gv.opFailed": "{label} failed",
			"gv.opClose": "Close this operation output",
			"gv.opCloseAria": "Close output",
			// settings
			"set.title": "Panel settings",
			"set.editorGroup": "Editor theme",
			"set.themeHint": "Choose a theme family; its light or dark variant follows the panel appearance automatically.",
			"set.themeAuto": "Follow panel (VS Code)",
			"set.themeFamilyVsCode": "VS Code",
			"set.themeFamilyHighContrast": "High contrast",
			"set.themeFamilyGithub": "GitHub",
			"set.themeFamilyOne": "One",
			"set.themeFamilyDracula": "Dracula",
			"set.themeFamilyMonokai": "Monokai",
			"set.themeFamilyNord": "Nord",
			"set.themeFamilySolarized": "Solarized",
			"set.themeFamilyGruvbox": "Gruvbox",
			"set.themeFamilyAyu": "Ayu",
			"set.themeFamilyMaterial": "Material",
			"set.themeFamilyTokyoNight": "Tokyo Night",
			"set.themeFamilyCatppuccin": "Catppuccin",
			"set.themeVs": "VS Code Light",
			"set.themeVsDark": "VS Code Dark+",
			"set.themeHcLight": "Light (high contrast)",
			"set.themeHcBlack": "Dark (high contrast)",
			"set.themeGithubLight": "GitHub Light",
			"set.themeGithubDark": "GitHub Dark",
			"set.themeOneLight": "One Light",
			"set.themeOneDark": "One Dark",
			"set.themeDracula": "Dracula",
			"set.themeDraculaLight": "Dracula Light",
			"set.themeMonokai": "Monokai",
			"set.themeMonokaiLight": "Monokai Light",
			"set.themeNord": "Nord",
			"set.themeNordLight": "Nord Light",
			"set.themeSolarizedLight": "Solarized Light",
			"set.themeSolarizedDark": "Solarized Dark",
			"set.themeGruvboxLight": "Gruvbox Light",
			"set.themeGruvboxDark": "Gruvbox Dark",
			"set.themeAyuLight": "Ayu Light",
			"set.themeAyuDark": "Ayu Dark",
			"set.themeMaterialLight": "Material Light",
			"set.themeMaterialDark": "Material Dark",
			"set.themeTokyoNight": "Tokyo Night",
			"set.themeTokyoNightDay": "Tokyo Night Day",
			"set.themeCatppuccinLatte": "Catppuccin Latte",
			"set.themeCatppuccinMocha": "Catppuccin Mocha",
			"set.uiFont": "Panel interface font",
			"set.uiSize": "UI font size",
			"set.uiSizeHint": "10–20 px, default 13 px; applies to panel text and lists immediately.",
			"set.previewSize": "Preview font size",
			"set.previewSizeHint": "8–24 px, default 12 px; applies to text, code, Markdown, and Git diffs.",
			"set.sizeSample": "Preview sample Aa 0123 · const fontSize = 12;",
			"set.fontHint": "If a font is unavailable, the next font in its stack is used.",
			"set.fontUiSystem": "System default",
			"set.fontUiInter": "Inter",
			"set.fontUiSegoe": "Segoe UI",
			"set.fontUiNoto": "Noto Sans SC",
			"set.fontUiYahei": "Microsoft YaHei",
			"set.codeFont": "Code monospace font",
			"set.codeFontHint": "Applies to code previews, Git diffs, and monospaced paths; uses installed local fonts when available.",
			"set.fontCodeSystem": "System default",
			"set.fontCodeCascadia": "Cascadia Code",
			"set.fontCodeCascadiaMono": "Cascadia Mono",
			"set.fontCodeConsolas": "Consolas",
			"set.fontCodeCourier": "Courier New",
			"set.defaultOpen": "Panel opens maximized by default",
			"set.maximized": "Maximized by default",
			"set.normal": "Normal",
			"set.applyHint": "Applies immediately and becomes the default for next time.",
			"set.click": "When clicking produced files",
			"set.panelPreview": "Preview in this panel",
			"set.systemOpen": "Let DSH decide",
			"set.previewHint": "With “Preview in this panel”, produced files / file mentions / tool file links open in this panel. With “Let DSH decide”, nothing is intercepted and DSH handles the click itself (right sidebar preview or system open). Directories and “show in folder” always use the system.",
			// status letters
			"letter.M": "Modified",
			"letter.A": "Added",
			"letter.D": "Deleted",
			"letter.R": "Renamed",
			"letter.C": "Copied",
			"letter.U": "Conflict",
			"letter.?": "Untracked",
			"letter.!": "Ignored",
			// rpc
			"rpc.badResponse": "dsh-files-git: invalid response format",
			"rpc.failed": "Operation failed",
			"rpc.timeout": "RPC {method} timed out: no response within {ms}ms (the server may still be running)",
			"rpc.netError": "Network interrupted while downloading {name}; the file may be incomplete",
			// editor (CodeMirror lazy loading)
			"editor.loadFailed": "Failed to load {spec}",
			// operation labels (runOp busy/op state stores these KEYS)
			"op.refresh": "Refresh",
			"op.diff": "Reading diff",
			"op.read": "Reading file",
			"op.commitRead": "Reading commit",
			"op.commitAll": "Commit all",
			"op.commitSel": "Commit selected",
			"op.checkoutNew": "New branch",
			"op.checkout": "Checkout",
			"op.merge": "Merge",
			"op.update": "Update branch",
			"op.rename": "Rename",
			"op.stage": "Stage",
			"op.unstage": "Unstage",
			"op.untrack": "Untrack",
			"op.ignore": "Ignore",
			"op.pull": "Pull",
			"op.push": "Push",
			"op.fetch": "Fetch",
			"op.revert": "Revert commit",
			"op.reset": "Reset"
		};

		let localeFace = null;
		// Fallback snapshot for useT before the locale service registers: a
		// STABLE module-level object — getSnapshot must return a cached value,
		// a fresh `{...}` literal per call is a new identity every time and
		// drives useSyncExternalStore into an infinite re-render loop.
		const FALLBACK_SNAPSHOT = { active: "zh", revision: 0 };
		function installLocale(locale) {
			localeFace = locale;
			return locale.register(LOCALE_NS, { zh, en });
		}
		function t(key, params) {
			if (localeFace) return localeFace.bind(LOCALE_NS)(key, params);
			return (zh[key] ?? key);
		}
		function useT() {
			useSyncExternalStore(
				(cb) => (localeFace ? localeFace.subscribe(cb) : () => {}),
				() => (localeFace ? localeFace.getSnapshot() : FALLBACK_SNAPSHOT)
			);
			return t;
		}
		//#endregion

		//#region utils
		// ── RPC (standard client-request envelope, plain fetch) ──────────────────
		// Two request classes so a slow remote never starves the panel and a
		// retried mutation can never run twice:
		//  - reads (list/read/status/…)  : timeout + NO blind retry (only
		//    transport-level failures retry once)
		//  - mutations (commit/push/…)    : long timeout, NO retry — the first
		//    attempt may already have executed server-side; auto-retrying could
		//    commit/pull twice, so only the user may re-trigger those.
		// Read limit is 20s: the handlers themselves finish in <1s, but the DSH
		// main process can park EVERY response (even static 404s) behind a
		// saturated event loop for seconds at a time — 10s produced frequent
		// false timeouts during exactly those windows.
		const RPC_READ_TIMEOUT_MS = 20000;
		const RPC_MUTATION_TIMEOUT_MS = 300000;
		const MUTATION_METHODS = new Set([
			"commit", "push", "pull", "fetch", "checkout", "merge", "update",
			"rename", "revert", "reset", "stage", "unstage", "untrack",
			"gitignore", "write", "exportZip", "openDirectory", "openFile", "session/openWorkspacePath"
		]);
		// ── request id (secure-context-safe) ─────────────────────────────────────
		// crypto.randomUUID() only exists in SECURE contexts (https / localhost).
		// Over LAN (http://192.168.x.x:3080) it is undefined, so EVERY RPC threw
		// "crypto.randomUUID is not a function" (the same failure class as DSH's
		// own model-settings page on LAN). crypto.getRandomValues, however, IS
		// available in insecure contexts — build an RFC4122 v4 uuid from it; the
		// timestamp fallback only covers engines without either API.
		const rpcIdOf = () => {
			if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
				try { return crypto.randomUUID(); } catch { /* fall through */ }
			}
			if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
				const b = crypto.getRandomValues(new Uint8Array(16));
				b[6] = (b[6] & 0x0f) | 0x40;   // version 4
				b[8] = (b[8] & 0x3f) | 0x80;   // variant 10x
				const hex = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
				return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
			}
			return `rpc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
		};

		async function rpc(base, method, payload, _attempt = 0) {
			const mutation = MUTATION_METHODS.has(method);
			const timeoutMs = mutation ? RPC_MUTATION_TIMEOUT_MS : RPC_READ_TIMEOUT_MS;
			const started = Date.now();
			let res;
			try {
				res = await fetch(`/${base}/${method}`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ type: "client-request", rpcId: rpcIdOf(), method, payload: payload ?? {} }),
					signal: AbortSignal.timeout(timeoutMs)
				});
			} catch (err) {
				// TimeoutError: the server-side command may STILL be running — a
				// blind retry stacks a second git process on top of the first,
				// which is how isolated timeouts avalanche into "接口全是超时".
				// Only transport-level failures (server down, connection reset)
				// are safe to retry once. Timeouts surface as a readable error
				// instead of Chrome's cryptic "signal timed out".
				if (err?.name === "TimeoutError") {
					console.warn(`[files-git] ${method} TIMEOUT after ${Date.now() - started}ms (limit ${timeoutMs}ms)`);
					throw new Error(t("rpc.timeout", { method, ms: timeoutMs }));
				}
				if (!mutation && _attempt < 1) {
					console.warn(`[files-git] ${method} transport error, retrying once:`, err?.message ?? err);
					await new Promise((r) => setTimeout(r, 300));
					return rpc(base, method, payload, _attempt + 1);
				}
				console.warn(`[files-git] ${method} FAILED after ${Date.now() - started}ms:`, err?.message ?? err);
				throw err;
			}
			const ms = Date.now() - started;
			if (ms >= 800) console.debug(`[files-git] ${method} slow: ${ms}ms`);
			let data;
			try {
				if (!res.ok) throw new Error(`dsh-files-git: transport HTTP ${res.status}`);
				data = await res.json();
			} catch (err) {
				// A body that fails to arrive intact (JSON parse over a truncated
				// stream) is a TRANSPORT failure, not a git error: reads may retry
				// once, mutations stay final (the request may have executed).
				// HTTP-status errors stay final for both, as before.
				if (err instanceof SyntaxError && !mutation && _attempt < 1) {
					console.warn(`[files-git] ${method} truncated response body, retrying once`);
					await new Promise((r) => setTimeout(r, 300));
					return rpc(base, method, payload, _attempt + 1);
				}
				throw err;
			}
			if (!data || data.type !== "server-response") throw new Error(t("rpc.badResponse"));
			if (!data.result.ok) {
				const err = new Error(data.result.error?.message ?? t("rpc.failed"));
				err.code = data.result.error?.code;
				throw err;
			}
			return data.result.value;
		}
		// ── direct-to-sidecar transport (Phase 2) ────────────────────────────────
		// Bootstrap: the loopback-fenced DSH channel hands us the sidecar's
		// port+token once ("service-info"); afterwards reads/mutations hit
		// http://127.0.0.1:<port>/git/* directly and never touch the DSH main
		// process. Failure rules mirror the proxy's no-blind-retry semantics:
		//  - result errors (git-error envelopes)        → final, no fallback
		//  - timeouts (request may have executed)       → final, no fallback
		//  - mutation transport failure (may have run)  → final, no fallback
		//  - read transport failure                     → one proxy fallback
		// Any transport failure invalidates the cached service info; the next
		// call re-bootstraps (service restart / idle exit / rotation).
		let svcInfo = null;
		let svcInfoPromise = null;
		let svcInfoFailedAt = 0;
		const BOOTSTRAP_RETRY_MS = 30000;
		// Direct-connect eligibility: the sidecar lives on the SERVER's
		// loopback. When the panel page is NOT served from a loopback origin
		// (SSH tunnel / port-forward to a deployed DSH), "127.0.0.1" would
		// dial the BROWSER's own machine — where nothing listens. Worse,
		// mutation transport failures are deliberately final (the request may
		// have executed), so remote pages would see hard mutation errors.
		// Non-loopback origins therefore skip direct mode entirely and stay
		// on the fenced /git-api proxy: an SSH tunnel satisfies the server's
		// loopback fence (the TCP peer is the server's own sshd), so every
		// operation works through it. Status falls back to polling (no SSE
		// on the proxy path) — same as the pre-Phase-2 behavior.
		const DIRECT_ELIGIBLE = ["127.0.0.1", "localhost", "[::1]", "::1"].includes(globalThis.location?.hostname ?? "");
		function bootstrapServiceInfo({ force = false } = {}) {
			if (!DIRECT_ELIGIBLE) return Promise.resolve(null);
			if (svcInfo) return Promise.resolve(svcInfo);
			// Negative cache: while the sidecar is down, every svcInfo-less
			// call would otherwise fire a fresh service-info attempt (the
			// single-flight only covers the in-flight window). Retrying at
			// most once per 30s keeps the 5s polling from doubling its load;
			// `force` bypasses it for paths that know the old info is stale
			// (e.g. a just-received 401).
			if (!force && svcInfoFailedAt !== 0 && Date.now() - svcInfoFailedAt < BOOTSTRAP_RETRY_MS) {
				return Promise.resolve(null);
			}
			if (!svcInfoPromise) {
				svcInfoPromise = rpc("git-api", "service-info", {})
					.then((v) => { svcInfo = v; svcInfoFailedAt = 0; return v; })
					.catch(() => { svcInfoFailedAt = Date.now(); return null; })
					.finally(() => { svcInfoPromise = null; });
			}
			return svcInfoPromise;
		}
		// No eager warm-up here on purpose: bootstrapping spawns the sidecar,
		// and that must only happen once the panel is actually used — the
		// first RPC proxies (and kicks the bootstrap), later ones go direct.

		async function directRpc(method, payload, info) {
			const mutation = MUTATION_METHODS.has(method);
			const timeoutMs = mutation ? RPC_MUTATION_TIMEOUT_MS : RPC_READ_TIMEOUT_MS;
			const started = Date.now();
			let res;
			try {
				res = await fetch(`http://127.0.0.1:${info.port}/git/${encodeURIComponent(method)}`, {
					method: "POST",
					headers: { "content-type": "application/json", authorization: `Bearer ${info.token}` },
					body: JSON.stringify(payload ?? {}),
					mode: "cors",
					signal: AbortSignal.timeout(timeoutMs)
				});
			} catch (err) {
				const ms = Date.now() - started;
				if (err?.name === "TimeoutError") {
					console.warn(`[files-git] ${method} TIMEOUT after ${ms}ms (limit ${timeoutMs}ms)`);
					const e = new Error(t("rpc.timeout", { method, ms: timeoutMs }));
					e.rpcTimeout = true;
					throw e;
				}
				console.warn(`[files-git] ${method} direct transport error:`, err?.message ?? err);
				throw err;
			}
			const ms = Date.now() - started;
			if (ms >= 800) console.debug(`[files-git] ${method} slow: ${ms}ms`);
			if (!res.ok) {
				// Surface the service's own reason when it sent one (the bare
				// "direct HTTP 401" hid "unauthorized" etc.).
				const reason = await res.json().catch(() => null);
				const err = new Error(`dsh-files-git: direct HTTP ${res.status}${reason?.error ? `（${reason.error}）` : ""}`);
				// 401/403 = the token was rejected BEFORE anything executed —
				// provably safe to re-bootstrap and re-send once (rpcSmart).
				if (res.status === 401 || res.status === 403) err.rpcAuth = true;
				throw err;
			}
			const data = await res.json();
			// Service answers with the bare RpcResult (no DSH envelope).
			if (!data || typeof data.ok !== "boolean") throw new Error(t("rpc.badResponse"));
			if (!data.ok) {
				const e = new Error(data.error?.message ?? t("rpc.failed"));
				e.code = data.error?.code;
				e.rpcResult = true;
				throw e;
			}
			return data.value;
		}

		async function rpcSmart(method, payload) {
			const mutation = MUTATION_METHODS.has(method);
			if (svcInfo) {
				try {
					return await directRpc(method, payload, svcInfo);
				} catch (err) {
					if (err?.rpcResult) throw err;               // real git/path error: final
					if (err?.rpcTimeout || err?.name === "TimeoutError") throw err; // may have executed
					if (err?.rpcAuth) {
						// 401/403: rejected at the token gate, BEFORE any git ran.
						// Re-bootstrap (force past the negative cache) and retry
						// exactly once; without this, the first mutation after
						// every sidecar rotation failed with a raw 401.
						const staleToken = svcInfo?.token;
						svcInfo = null;
						const fresh = await bootstrapServiceInfo({ force: true });
						if (fresh && fresh.token !== staleToken) {
							try {
								return await directRpc(method, payload, fresh);
							} catch (retryErr) {
								if (retryErr?.rpcResult) throw retryErr;
								svcInfo = null;
								if (mutation) throw retryErr;
								// read-class failure → proxy fallback below
							}
						} else if (mutation) {
							throw err; // no fresher info: a mutation must not re-run blindly
						}
						// reads fall through to the proxy path
						return rpc("git-api", method, payload);
					}
					svcInfo = null;                              // stale bootstrap info
					if (mutation) throw err;                     // may have executed: never re-run
					// read-class transport failure → safe proxy fallback below
				}
			} else {
				void bootstrapServiceInfo(); // warm for the NEXT call; this one proxies
			}
			return rpc("git-api", method, payload);
		}

		// In-flight dedup: identical concurrent git-api calls share ONE request.
		// This collapses duplicate list/status/read round-trips (double loads,
		// poll races, any re-entrant caller) into a single fetch. Entries are
		// removed on settle — the map is bounded by the in-flight set.
		const gitRpcInFlight = new Map();

		// gitRpc now picks the fastest healthy transport; the in-flight dedup
		// stays transport-agnostic so duplicate calls share ONE request.
		const gitRpc = (method, payload) => {
			const key = `${method}\u0000${JSON.stringify(payload ?? {})}`;
			const existing = gitRpcInFlight.get(key);
			if (existing) return existing;
			const promise = rpcSmart(method, payload ?? {}).finally(() => {
				if (gitRpcInFlight.get(key) === promise) gitRpcInFlight.delete(key);
			});
			gitRpcInFlight.set(key, promise);
			return promise;
		};

		// SSE status subscription (direct mode). Resolves to null when direct
		// mode is unavailable → the caller keeps its polling fallback; else to
		// { close(), done } — done resolves when the stream ends for any
		// reason other than close(), so the caller can revert to polling.
		async function subscribeStatus(repo, onData) {
			const info = svcInfo ?? await bootstrapServiceInfo();
			if (!info) return null;
			const controller = new AbortController();
			// Handshake watchdog: a silently-dropped connection (server gone,
			// middlebox) would otherwise leave this fetch unsettled forever
			// and stall the polling upgrade. Only the handshake is bounded —
			// the stream itself must run free (it can live for hours).
			const handshake = setTimeout(() => controller.abort(), 15000);
			let res;
			try {
				res = await fetch(`http://127.0.0.1:${info.port}/events?repo=${encodeURIComponent(repo)}`, {
					headers: { authorization: `Bearer ${info.token}` },
					mode: "cors",
					signal: controller.signal
				});
			} catch {
				// Direct connect failed: drop the stale bootstrap so the next
				// RPC re-establishes instead of waiting for a poll to notice.
				svcInfo = null;
				return null;
			} finally {
				clearTimeout(handshake);
			}
			if (!res.ok || !res.body) {
				try { controller.abort(); } catch { /* already */ }
				return null;
			}
			let closedByUs = false;
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			const pump = (async () => {
				let buffer = "";
				const processBuffer = () => {
					// Tolerate CRLF framing (SSE spec allows both) even though
					// our own server always emits LF.
					let m;
					while ((m = /\r?\n\r?\n/.exec(buffer)) !== null) {
						const frame = buffer.slice(0, m.index);
						buffer = buffer.slice(m.index + m[0].length);
						const dataLine = frame.split(/\r?\n/).find((l) => l.startsWith("data:"));
						if (!dataLine) continue; // comment / heartbeat frame
						try { onData(JSON.parse(dataLine.slice(5).trim())); } catch { /* malformed frame */ }
					}
				};
				try {
					for (;;) {
						const { done, value } = await reader.read();
						if (done) break;
						buffer += decoder.decode(value, { stream: true });
						processBuffer();
					}
					decoder.decode(); // final flush of the multi-byte decoder state
					processBuffer();
				} catch { /* aborted or network drop */ }
			})();
			return {
				close: () => { closedByUs = true; try { controller.abort(); } catch { /* already */ } },
				done: pump.then(() => { return closedByUs ? "closed" : "ended"; })
			};
		}

		// ── raw file channel (upload / download / export) ──────────────────────
		// Byte streams ride dedicated routes on the sidecar (/files/*), reached
		// through one of two transports:
		//  - direct:  http://127.0.0.1:<port>/files/* + Bearer (loopback pages
		//    only — skips the DSH hop entirely), or
		//  - proxy:   same-origin /git-api-files/* — a raw route the host half
		//    registers on the DSH webServer (same requestRejection fence as the
		//    RPC channel), which PIPES bytes to the sidecar with backpressure.
		//    No base64, no body buffering → no size caps, remote (LAN/SSH
		//    tunnel) pages included.
		// Transfers deliberately take NO 20s read timeout (a slow multi-GB
		// transfer is healthy); only transport errors end them. A 502/503 from
		// the proxy (respawned sidecar, request never processed) is retried
		// once with a FRESH request — the proxy never replays a half-consumed
		// upload body itself.
		const RAW_RETRY = new Set([502, 503]);
		// Both transports carry the SAME base shape — the /files segment is
		// part of the base: direct hits the sidecar's /files/* routes, the
		// proxy maps /git-api-files/<route> onto them. (The two shapes must
		// NOT be mixed: /git-api-files/files/<route> 404s in the host route.)
		async function filesTransport() {
			const info = svcInfo ?? await bootstrapServiceInfo();
			return info
				? { base: `http://127.0.0.1:${info.port}/files`, token: info.token }
				: { base: "/git-api-files", token: null };
		}
		const filesUrl = (base, route, params) => {
			const qs = new URLSearchParams(params ?? {}).toString();
			return `${base}/${route}${qs ? `?${qs}` : ""}`;
		};
		const rawErrorMessage = (data, status) => (data?.error?.message || data?.message || `HTTP ${status}`);

		/** Kick the browser's save flow for an in-memory blob. */
		function triggerDownload(blob, name) {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = name || "download";
			document.body.appendChild(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(url), 30000);
		}

		/**
		 * Save one fetch Response to disk. Payloads over the threshold stream
		 * through the File System Access API where available — a multi-GB blob
		 * would otherwise materialize entirely in tab memory. Smaller payloads
		 * keep the silent anchor download (identical UX to before). Picker
		 * failures degrade gracefully: dismissal/abort cancel silently, an
		 * expired activation window (SecurityError — e.g. a long exportZip RPC
		 * ate the 5s user-activation budget) or an unsupported FS falls back
		 * to the in-memory path.
		 */
		const STREAM_SAVE_THRESHOLD = 512 * 1024 * 1024;
		async function saveResponse(res, name, signal) {
			const len = Number(res.headers.get("content-length") ?? 0);
			if (len > STREAM_SAVE_THRESHOLD && typeof window?.showSaveFilePicker === "function") {
				// Stage 1 — picker + writable creation: failures here (user
				// dismissed, SecurityError, unsupported) still have an intact
				// body, so the in-memory fallback below is a real option.
				let writable;
				try {
					const handle = await window.showSaveFilePicker({ suggestedName: name });
					writable = await handle.createWritable();
				} catch (err) {
					if (err?.name === "AbortError") throw err;   // user dismissed: silent
					if (signal?.aborted) throw new DOMException("aborted", "AbortError");
					// SecurityError / unsupported / quota → in-memory fallback
					writable = null;
				}
				if (writable) {
					// Stage 2 — the transfer itself: a failure here has already
					// consumed/locked the body (res.blob() would reject with a
					// bare TypeError per the fetch spec), so surface a readable
					// network error instead of attempting the impossible.
					try {
						await res.body.pipeTo(writable, { signal });
						return { size: len };
					} catch (err) {
						if (err?.name === "AbortError") throw err;
						if (signal?.aborted) throw new DOMException("aborted", "AbortError");
						throw new Error(t("rpc.netError", { name }) || `下载 ${name} 时网络中断`);
					}
				}
			}
			const blob = await res.blob();
			triggerDownload(blob, name);
			return { size: blob.size };
		}

		/**
		 * Stream one file (workspace-relative or abs) to a browser download.
		 * @returns {Promise<{size: number}>}
		 */
		async function downloadFile({ repo, path, abs, name, signal }) {
			const params = { repo };
			if (abs) params.abs = abs;
			else params.path = path ?? "";
			let lastError = null;
			for (let attempt = 0; attempt < 2; attempt++) {
				// Resolve the transport PER attempt: a direct attempt against a
				// dead sidecar (idle exit / rotation) must clear the stale
				// bootstrap and let the retry re-resolve (usually onto the
				// proxy transport) — same self-healing the RPC layer applies.
				let res;
				const { base, token } = await filesTransport();
				try {
					res = await fetch(filesUrl(base, "download", params), {
						headers: token ? { authorization: `Bearer ${token}` } : {},
						mode: "cors",
						cache: "no-store",
						signal
					});
				} catch (error) {
					if (error?.name === "AbortError") throw error;
					if (token) svcInfo = null;
					lastError = error;
					continue;
				}
				if (RAW_RETRY.has(res.status) && attempt === 0) { lastError = new Error(`HTTP ${res.status}`); continue; }
				if (!res.ok) {
					const data = await res.json().catch(() => null);
					throw new Error(rawErrorMessage(data, res.status));
				}
				return await saveResponse(res, name, signal);
			}
			throw lastError ?? new Error("download failed");
		}

		/**
		 * Upload one File via XHR (fetch has no upload progress). Resolves to
		 * the sidecar's { size, path } value. `signalRef` (a ref object)
		 * receives a cancel() closure so the caller can abort mid-flight.
		 */
		function uploadFileOnce({ repo, dirRel, file, overwrite, onProgress, signalRef }) {
			return new Promise((resolve, reject) => {
				let settled = false;
				const done = (fn, v) => { if (!settled) { settled = true; fn(v); } };
				void (async () => {
					try {
						const { base, token } = await filesTransport();
						const params = { repo, path: dirRel ? `${dirRel}/${file.name}` : file.name };
						if (overwrite) params.overwrite = "1";
						const xhr = new XMLHttpRequest();
						if (signalRef) signalRef.current = () => xhr.abort();
						xhr.open("POST", filesUrl(base, "upload", params), true);
						if (token) xhr.setRequestHeader("authorization", `Bearer ${token}`);
						xhr.setRequestHeader("content-type", "application/octet-stream");
						xhr.upload.onprogress = (e) => {
							if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
						};
						xhr.onload = () => {
							let data = null;
							try { data = JSON.parse(xhr.responseText); } catch { /* non-JSON */ }
							if (xhr.status === 200 && data?.ok) done(resolve, data.value);
							else if (RAW_RETRY.has(xhr.status)) done(reject, new Error(`__RETRY__${xhr.status}`));
							else done(reject, new Error(data?.error?.message ?? `HTTP ${xhr.status}`));
						};
						xhr.onerror = () => {
						// Network-level failure on a direct attempt usually means
						// the sidecar went away — drop the stale bootstrap so the
						// next transport resolution re-establishes (or proxies).
						if (token) svcInfo = null;
						done(reject, new Error("network error"));
					};
						xhr.onabort = () => done(reject, new Error("aborted"));
						xhr.send(file);
					} catch (error) { done(reject, error); }
				})();
			});
		}
		async function uploadFile(args) {
			try {
				return await uploadFileOnce(args);
			} catch (error) {
				if (!String(error?.message ?? "").startsWith("__RETRY__")) throw error;
				return uploadFileOnce(args);
			}
		}

		/**
		 * Build a zip of `paths` on the sidecar (exportZip RPC) and stream it
		 * into a browser download. Resolves to the exportZip value.
		 */
		async function exportZipDownload({ repo, paths, name, signal }) {
			const value = await gitRpc("exportZip", { repo, paths, name });
			// The sidecar build itself has no abort plumbing (bounded by the
			// export caps); honoring the signal here at least stops the user-
			// visible half — no download pops for a cancelled export.
			if (signal?.aborted) throw new DOMException("aborted", "AbortError");
			let lastError = null;
			for (let attempt = 0; attempt < 2; attempt++) {
				let res;
				const { base, token } = await filesTransport();
				try {
					res = await fetch(filesUrl(base, "export", { id: value.exportId }), {
						headers: token ? { authorization: `Bearer ${token}` } : {},
						mode: "cors",
						cache: "no-store",
						signal
					});
				} catch (error) {
					if (error?.name === "AbortError") throw error;
					lastError = error;
					continue;
				}
				if (RAW_RETRY.has(res.status) && attempt === 0) { lastError = new Error(`HTTP ${res.status}`); continue; }
				if (!res.ok) {
					const data = await res.json().catch(() => null);
					throw new Error(rawErrorMessage(data, res.status));
				}
				await saveResponse(res, value.name, signal);
				return value;
			}
			throw lastError ?? new Error("export download failed");
		}

		// ── panel default-size setting (localStorage; legacy key honored) ────────
		const SIZE_KEY = "dsh-files-git.defaultMaximized";
		const LEGACY_SIZE_KEY = "dsh-git-panel.defaultMaximized";
		const readDefaultMaximized = () => {
			try {
				const v = localStorage.getItem(SIZE_KEY);
				if (v !== null) return v !== "0";
				const old = localStorage.getItem(LEGACY_SIZE_KEY);
				if (old !== null) return old !== "0";
				return true;
			} catch { return true; }
		};
		const writeDefaultMaximized = (v) => {
			try { localStorage.setItem(SIZE_KEY, v ? "1" : "0"); } catch {}
		};

		// ── status letter → label (localized via the i18n dictionary) ───────────
		const LETTER_LABEL = { M: "letter.M", A: "letter.A", D: "letter.D", R: "letter.R", C: "letter.C", U: "letter.U", "?": "letter.?", "!": "letter.!" };
		const letterLabel = (ch) => t(LETTER_LABEL[ch] ?? ch);

		// ── UI atoms (className-based) ───────────────────────────────────────────
		// Context-menu placement shared by the git-log and file-row menus. The menu
		// opens to the RIGHT of the anchor (left edge at x) and is always kept
		// INSIDE THE PANEL — it must never float over the page background: near the
		// panel's right edge it right-anchors at x (data-flip → translateX(-100%))
		// and opens leftward, and x/y are clamped to the panel's box. MENU_W /
		// MENU_H are the menu's min-width / max expected height + chrome.
		// MENU_H covers the file-row menu's worst case (6 items ≈ 200px + chrome),
		// so anchoring near the panel's bottom edge clamps early enough to keep
		// the whole card inside.
		const MENU_W = 240, MENU_H = 220, MENU_EDGE = 8;
		function menuAt(x, y) {
			// The menu is portaled to .dgp-root (`position:fixed;inset:0`), so the
			// panel's viewport-relative rect maps 1:1 onto the menu's left/top.
			const panel = typeof document === "undefined" ? null : document.querySelector(".dgp-dialog");
			const box = panel ? panel.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
			const minX = box.left + MENU_EDGE, maxX = box.right - MENU_EDGE;
			const minY = box.top + MENU_EDGE, maxY = box.bottom - MENU_EDGE;
			const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
			const flip = x + MENU_W > maxX;
			return {
				// Flipped menus are right-anchored, so the menu ENDS at the anchor.
				x: flip ? clamp(x, minX + MENU_W, maxX) : clamp(x, minX, maxX - MENU_W),
				y: clamp(y, minY, maxY - MENU_H),
				flip
			};
		}
		const btn = (label, onClick, opts = {}) => {
			const handlers = {};
			if (onClick || opts.onClick) handlers.onClick = (e) => { if (opts.onClick) opts.onClick(e); if (onClick) onClick(e); };
			return h("button", { className: "dgp-btn" + (opts.className ? ` ${opts.className}` : ""), ...handlers, disabled: opts.disabled, title: opts.title, "data-variant": opts.variant || "default" }, opts.icon || null, label ? h("span", null, label) : null);
		};
		const chip = (text, tone) => h("span", { className: "dgp-chip", "data-tone": tone || undefined }, text);
		// Ghost action button — the single visual language for in-page operations
		// (replace raw text links): accent blue by default, "default" = neutral
		// grey, "error" = danger red; `active` highlights toggle pairs.
		const lbtn = (label, onClick, opts = {}) => h("button", {
			type: "button",
			className: "dgp-lbtn",
			"data-tone": opts.tone || "accent",
			"data-active": opts.active ? "true" : "false",
			"data-disabled": opts.disabled ? "true" : "false",
			// Icon-only buttons (label === null) still need an accessible name.
			"aria-label": opts.ariaLabel || (label ? undefined : opts.title),
			"data-icon-only": label == null && opts.icon ? "true" : undefined,
			title: opts.title,
			onClick: (e) => { e.preventDefault(); e.stopPropagation(); if (!opts.disabled && onClick) onClick(e); }
		}, opts.icon || null, label);
		const link = (text, onClick, muted) => h("button", { className: "dgp-link" + (muted ? " dgp-linkMuted" : ""), onClick: (e) => { e.preventDefault(); onClick(); } }, text);

		function fmtSize(bytes) {
			if (bytes == null) return "";
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
			if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
			return `${(bytes / 1073741824).toFixed(2)} GB`;
		}

		// Listing timestamp "YYYY-MM-DD HH:mm" (local time). Plain string math
		// (no Intl) keeps it cheap — a 4000-entry directory formats instantly.
		function fmtTime(ms) {
			if (ms == null) return "";
			const d = new Date(ms);
			const p = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
		}

		// ── `@file` reference mention (mirrors DSH's own grammar) ────────────────
		// DSH resolves `@<workspace-relative path>` references (its model guidance
		// says so verbatim: "@ are workspace paths the user explicitly referenced…
		// A trailing slash marks a directory"). The client bundle cannot `require`
		// DSH packages, so the documented grammar is reproduced here rather than
		// imported: `@path` normally, `@"path"` when the path contains whitespace
		// or a quote, and a trailing slash for directories. This is exactly the
		// token DSH's own `@` menu inserts, so the agent reads our insertion as a
		// first-class reference. Windows separators are normalized because the
		// mention is relative-path syntax, not a filesystem path.
		function fileMentionText(path, isDir) {
			const p = String(path ?? "").trim().replace(/\\/g, "/");
			if (p === "") return "";
			// A literal quote would make the quoted form ambiguous, and the official
			// grammar declines such a path (returns undefined) rather than emitting
			// a token the editor cannot round-trip: decline it the same way.
			if (p.includes('"')) return "";
			const body = isDir && !p.endsWith("/") ? `${p}/` : p;
			return /\s/.test(body) ? `@"${body}"` : `@${body}`;
		}

		// Append one mention to a draft with exactly one separating space.
		// Pure on purpose: the injector appends repeatedly (one click per file),
		// so the accumulate-not-replace rule is the part worth unit-testing
		// without a live DSH session.
		function appendMention(draft, mention) {
			const cur = String(draft ?? "");
			if (mention === "") return cur;
			if (cur === "") return mention;
			return /\s$/.test(cur) ? cur + mention : `${cur} ${mention}`;
		}
		//#endregion

		//#region triggers
		// ── Session-header trigger capsule (matches "Session log" styling) ──────
		function FileHeaderAction(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const compact = props?.wide === false; // sidebar collapsed rail: icon only
			const t = useT();
			// While suspended, hovering the exposed top edge restores the panel;
			// this capsule remains a clickable fallback so suspension cannot lock
			// the user out.
			const onTrigger = () => {
				if (getHidden()) { hiddenStore.set(false); return; }
				overlayStore.set(!open);
			};
			return h("button", {
				type: "button",
				className: "dgp-trigger" + (compact ? " dgp-triggerCompact" : ""),
				title: suspended ? t("trigger.resumeTitle") : t("trigger.title"),
				"aria-label": suspended ? t("trigger.resumeLabel") : t("trigger.label"),
				onClick: onTrigger,
				"data-active": (open || suspended) ? "true" : "false",
				"data-suspended": suspended ? "true" : undefined
			}, compact ? null : h("span", null, t("trigger.label")), h(IconFolderOpen, { size: 12 }));
		}

		// ── composer reference injector (session scope, headless) ────────────────
		// Renders nothing. It exists to OWN the session-scope input face that the
		// panel cannot reach: slot components mounted inside a session receive
		// `inputActions` (documented programmatic draft write) plus the InputZone
		// `input` projection (draft text). The panel lives in the SHELL scope, so
		// its row buttons hand the request to the store bridge and this component
		// performs the insert — the same cross-scope pattern the openPath
		// interception already uses.
		//
		// Registered in two session slots (dock + header utilities): whichever is
		// mounted consumes the request, and `consume()` is take-and-clear so a
		// request can never be applied twice. Missing props (older DSH build, or a
		// slot that does not carry the input face) degrade to a silent no-op
		// instead of throwing — the rest of the panel keeps working.
		function ReferenceInjector(props) {
			// The draft MUST be read live. `props.input` is a render-time SNAPSHOT of
			// the input state and the slot owner does not re-render on every draft
			// change, so reading it made the second click compose from the OLD text
			// and overwrite the first mention (reported: only one reference
			// survives). `useInput` is the store-subscription hook the runner pairs
			// with `inputActions` exactly for live reads; it re-renders us on each
			// draft change. The hook is always present on current builds; when it is
			// absent the conditional call is still stable for a mounted cell and we
			// fall back to our own last write (never to the stale snapshot first).
			const useInput = typeof props?.useInput === "function" ? props.useInput : null;
			const live = useInput ? useInput((s) => s?.draft ?? "") : null;
			const lastWrittenRef = useRef(null);
			const snapshot = props?.input?.draft ?? "";
			const draftRef = useRef("");
			draftRef.current = live ?? lastWrittenRef.current ?? snapshot;
			const actionsRef = useRef(null);
			actionsRef.current = props?.inputActions ?? null;
			useEffect(() => subscribeRefReq(() => {
				const req = consumeRefReq();
				const actions = actionsRef.current;
				if (!req || !actions || typeof actions.setDraft !== "function") return;
				const mention = fileMentionText(req.path, req.isDir);
				if (mention === "") return;
				const next = appendMention(draftRef.current, mention);
				if (next === draftRef.current) return;
				// Record our own write first: if the live read is unavailable on the
				// next click, accumulating from this value still keeps every mention.
				lastWrittenRef.current = next;
				actions.setDraft(next);
			}), []);
			return null;
		}

		// ── Shell phase (DSH 0.1.2 compatibility) ───────────────────────────────
		// Older dsh builds carried `composerPhase` on the session snapshot; the
		// 0.1.2 conversation shell removed that field and now derives the same
		// "blank | engaging | active" machine locally (its conversationPhase():
		// active while a turn is observable or the session is running, engaging
		// once a prompt has been attempted, blank otherwise). Mirror that
		// derivation from the fields that remain, keeping the legacy field as a
		// fallback so this trigger stays correct on both generations.
		function shellPhaseOf(session) {
			if (!session) return "blank";
			if (typeof session.composerPhase === "string") return session.composerPhase;
			if (session.running === true || (session.blank === false && session.awaitingFirstTurn === false)) return "active";
			return session.promptAttempted === true ? "engaging" : "blank";
		}

		// ── Blank-session trigger at the end of the composer leading controls ──
		// The host renders input.left after its built-in permission/plan controls
		// and before the trailing model/submit group, so the folder action remains
		// beside related input tools without entering the hero/pet overlay area.
		function InputLeftTrigger(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const blank = typeof props?.useSession === "function"
				? props.useSession((session) => session?.blank === true && shellPhaseOf(session) === "blank")
				: false;
			const t = useT();
			if (!blank) return null; // active sessions use the header button instead
			const onTrigger = () => {
				if (getHidden()) { hiddenStore.set(false); return; }
				overlayStore.set(!open);
			};
			return h("button", {
				type: "button",
				className: "dgp-trigger dgp-triggerCompact dgp-triggerGhost",
				title: suspended ? t("trigger.resumeTitle") : t("trigger.title"),
				"aria-label": suspended ? t("trigger.resumeLabel") : t("trigger.label"),
				onClick: onTrigger,
				"data-active": (open || suspended) ? "true" : "false",
				"data-suspended": suspended ? "true" : undefined
			}, h(IconFolderOpen, { size: 14 }));
		}
		//#endregion

		//#region hooks
		// ── git state hook ───────────────────────────────────────────────────────
		// Status signature: change-sensitive comparison key (paths + status
		// codes + counters) — lets both the RPC refresh and the SSE push skip
		// setState when nothing actually changed (no re-render storms).
		const statusSig = (st) => {
			const sig = (arr) => arr.map((e) => `${e.code}\u0000${e.path}`).join("\u0001");
			return [st.branch, st.upstream, st.ahead, st.behind, sig(st.staged), sig(st.unstaged), sig(st.untracked), sig(st.conflicts)].join("\u0002");
		};
		function useGit(cwd) {
			const [status, setStatus] = useState(null);
			// null = probing, true = git repo, false = plain directory (hide Git tab).
			const [isRepo, setIsRepo] = useState(null);
			const [log, setLog] = useState(null);
			const [gitConfig, setGitConfig] = useState(null);
			const [branches, setBranches] = useState(null);
			const [diff, setDiff] = useState(null);
			const [selected, setSelected] = useState({});
			const [rebase, setRebase] = useState(false);
			const [force, setForce] = useState(false);
			const [busy, setBusy] = useState(null);
			// Read-side busy lane: diff / show reads must NOT disable the whole
			// panel (a slow `git diff` on a large repo used to freeze every
			// button via `disabled: busy !== null`). Only mutations take the
			// global `busy`; reads surface as a hint in the Git op bar.
			const [readBusy, setReadBusy] = useState(null);
			const [error, setError] = useState(null);
			// Operation record shown under the action bar: {label, status: "running"|"success"|"error", detail}.
			// Appears on every operation, persists after it finishes (success or error),
			// and is dismissed only via the close button (next operation shows it again).
			const [op, setOp] = useState(null);
			const mounted = useRef(true);
			// Refresh serialization: at most ONE refresh in flight; requests that
			// arrive mid-refresh are coalesced into a single follow-up run. This
			// stops overlapping refreshes (5s poll vs manual vs post-op) from
			// stacking 4 git processes each into a spawn storm.
			const refreshingRef = useRef(false);
			const refreshQueued = useRef(false);
			// Slow-trio cache: log / config / branches almost never change on
			// their own, so the silent poll fetches ONLY status (1 git process
			// instead of 6-7 spawns per 5s). The trio refreshes on mount, on
			// manual / post-op refresh (full: true), and on a slow ~60s poll
			// cadence so terminal-side changes self-heal.
			const slowLoadedRef = useRef(false);
			const statusSigRef = useRef("");
			const fullSigRef = useRef("");
			useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

			// Drop selected paths that no longer exist in the change lists.
			const pruneSelection = (st) => {
				setSelected((prev) => {
					const known = new Set([...st.staged, ...st.unstaged, ...st.untracked, ...st.conflicts].map((e) => e.path));
					const next = {};
					for (const [p, on] of Object.entries(prev)) if (on && known.has(p)) next[p] = true;
					return next;
				});
			};

			const refresh = useCallback(async ({ quiet = false, full = false } = {}) => {
				if (refreshingRef.current) {
					if (!quiet) refreshQueued.current = true;   // manual requests always win a slot
					return false;
				}
				refreshingRef.current = true;
				if (!quiet) setBusy("op.refresh");
				setError(null);
				try {
					const needSlow = full || !slowLoadedRef.current;
					// Status is the heartbeat: it alone decides repo-ness and
					// failure semantics. The slow trio (log/config/branches)
					// degrades instead — one persistently failing endpoint
					// used to fail the WHOLE refresh every 5s (backoff to
					// 60s, stale everything) when the rest was perfectly
					// healthy.
					// Publish the critical change list before starting metadata work.
					// A slow history/config must not hold its first paint hostage.
					const st = await gitRpc("status", { repo: cwd });
					if (!mounted.current) return false;
					// 5s 轮询每次都 setState 会触发整棵面板树重渲染（几百行变更 +
					// 历史），结果没变时跳过（引用不变 → React 不重渲）。比对键只取
					// 变化敏感字段（路径/状态码/计数），见 statusSig。
					const sKey = statusSig(st);
					// Light poll (slow trio served from cache): compare status
					// only, and when nothing changed skip every setState — an
					// idle tick costs one `git status` and zero re-renders.
					if (sKey !== statusSigRef.current) {
						statusSigRef.current = sKey;
						setStatus(st);
						setIsRepo(true);
						pruneSelection(st);
					}
					if (!needSlow) return true;
					const [lgR, cfgR, brR] = await Promise.allSettled([
						gitRpc("log", { repo: cwd, count: 100 }),
						gitRpc("config", { repo: cwd }),
						gitRpc("branches", { repo: cwd })
					]);
					if (!mounted.current) return false;
					const trioOk = lgR.status === "fulfilled" && cfgR.status === "fulfilled" && brR.status === "fulfilled";
					if (!trioOk) {
						// Partial failure: keep the previously loaded slow
						// data untouched (no flicker to null), update status,
						// and let the ~60s full tick retry the trio. Polls stay
						// light either way.
						slowLoadedRef.current = true;
						return true;
					}
					const lg = lgR.value;
					const cfg = cfgR.value;
					const br = brR.value;
					slowLoadedRef.current = true;
					// Metadata is independent of the status lane. Compare all bounded
					// results so same-count branch renames/current flags stay visible.
					const key = JSON.stringify([lg, cfg, br]);
					if (key === fullSigRef.current) return true;
					fullSigRef.current = key;
					setLog(lg); setGitConfig(cfg); setBranches(br.branches);
					return true;
				} catch (err) {
					if (!mounted.current) return false;
					if (err && (err.code === "not-a-git-repo" || /不是 Git 仓库|not a git repository/i.test(String(err.message || "")))) { setIsRepo(false); setError(null); }
					else setError(err.message);
					return false;
				} finally {
					refreshingRef.current = false;
					if (mounted.current && !quiet) setBusy(null);
					if (refreshQueued.current && mounted.current) {
						refreshQueued.current = false;
						void refresh({ quiet: true, full: true });
					}
				}
			}, [cwd]);

			useEffect(() => { refresh({ quiet: true }); }, [refresh]);

			// runOp resolves to TRUE on success and FALSE on failure — callers
			// that own user input (commit message, file selection) must only
			// clear it on success, or a rejected commit silently destroys what
			// the user just typed.
			const runOp = useCallback(async (label, fn) => {
				setBusy(label); setError(null);
				setOp({ label, status: "running", detail: "" });
				try {
					const value = await fn();
					if (!mounted.current) return false;
					const detail = value && typeof value.output === "string" && value.output.trim() ? value.output : t("commit.done");
					setOp({ label, status: "success", detail });
					// Mutations change log/branches too (commit → new entry,
					// checkout → current branch), so post-op refresh is FULL.
					await refresh({ full: true });
					return true;
				} catch (err) {
					if (mounted.current) {
						setOp({ label, status: "error", detail: err.message });
						// A failed op may still have changed the working tree
						// (pull with conflicts, half-applied rebase): converge the
						// panel quietly instead of waiting for the next poll.
						void refresh({ quiet: true, full: true });
					}
					return false;
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [refresh]);

			// Push mode (Phase 2 direct): subscribe to the sidecar's SSE status
			// stream. While the stream is live the 5s poll stands down entirely
			// (only the ~60s slow self-heal remains); the stream ending for any
			// external reason (service restart / rotation / network) reverts to
			// polling AND re-arms a subscription attempt. Events carry the same
			// shape as the status RPC value, so applying one is the identical
			// signature-gated path.
			const [pushLive, setPushLive] = useState(false);
			const pushLiveRef = useRef(false);
			pushLiveRef.current = pushLive;
			useEffect(() => {
				if (!cwd) return undefined;
				let alive = true;
				let sub = null;
				let retryTimer = null;
				const applyMsg = (msg) => {
					if (!alive || !msg || msg.repo !== cwd) return;
					if (msg.error) {
						// Not-a-repo must still hide the Git tab; other git
						// errors surface through the regular refresh path.
						if (/not a git repo/i.test(String(msg.error?.message ?? msg.error))) { setIsRepo(false); setError(null); }
						return;
					}
					const sKey = statusSig(msg);
					if (sKey === statusSigRef.current) return;
					statusSigRef.current = sKey;
					setStatus(msg);
					setIsRepo(true);
					pruneSelection(msg);
				};
				// Retry cadence: an unavailable service (panel opened before the
				// sidecar came up) retries slowly; a stream that DIED retries
				// quickly — a rotation only needs a couple of seconds.
				const armRetry = (ms) => {
					if (!alive || retryTimer) return;
					retryTimer = setTimeout(() => {
						retryTimer = null;
						if (alive && !sub) start();
					}, ms);
				};
				const start = () => {
					subscribeStatus(cwd, applyMsg).then((s) => {
						if (!alive) { s?.close?.(); return; }
						if (!s) { setPushLive(false); armRetry(30000); return; }
						sub = s;
						setPushLive(true);
						s.done.then((why) => {
							if (!alive || sub !== s) return; // we closed it via cleanup / repo switch
							sub = null;
							setPushLive(false);
							if (why === "ended") {
								// External close (service restart / rotation /
								// network): polling covers correctness meanwhile.
								armRetry(5000);
							}
						});
					}).catch(() => {
						if (alive) { setPushLive(false); armRetry(30000); }
					});
				};
				start();
				return () => {
					alive = false;
					if (retryTimer) clearTimeout(retryTimer);
					if (sub) { const s = sub; sub = null; s.close(); }
				};
			}, [cwd]);

			// Silent periodic refresh: keeps the change list / file badges in sync
			// with external edits without flashing the busy state. Each tick only
			// fires when NOTHING else is refreshing (busy op, manual refresh, an
			// in-flight poll) and the next tick is scheduled AFTER the previous
			// refresh settles — no overlap by construction. Consecutive failures
			// back the interval off (5s → … → 60s) so a down host is not hammered
			// every 5 seconds; a successful refresh restores the 5s cadence.
			// While the push stream is live, light ticks are skipped entirely —
			// every 12th tick (~60s) still upgrades to a full refresh so log /
			// branches / config pick up terminal-side changes without user action.
			const busyRef = useRef(busy);
			busyRef.current = busy;
			useEffect(() => {
				let alive = true;
				let timer = null;
				const pollRef = { ms: 5000, failures: 0, ticks: 0 };
				const SLOW_EVERY = 12;
				const schedule = (ms) => { timer = setTimeout(tick, ms); };
				const tick = () => {
					if (!alive) return;
					// Skip while the tab is hidden OR the panel is suspended
					// (slid out of view): no point spawning git processes the
					// user cannot see — during a hang window that churn would
					// keep re-filling the host's RPC slots. The next tick after
					// re-expanding (<=5s) refreshes, so data is never stale
					// for long.
					if (document.visibilityState !== "visible" || getHidden() || busyRef.current !== null || refreshingRef.current) {
						schedule(pollRef.ms);
						return;
					}
					pollRef.ticks++;
					const wantFull = pollRef.ticks % SLOW_EVERY === 0;
					if (pushLiveRef.current && !wantFull) {
						schedule(pollRef.ms);
						return;
					}
					refresh({ quiet: true, full: wantFull }).then((ok) => {
						if (!alive) return;
						pollRef.failures = ok ? 0 : pollRef.failures + 1;
						pollRef.ms = ok ? 5000 : Math.min(60000, 5000 * Math.pow(2, pollRef.failures));
						schedule(pollRef.ms);
					});
				};
				schedule(pollRef.ms);
				return () => { alive = false; clearTimeout(timer); };
			}, [refresh]);

			const allPaths = useMemo(() => {
				if (!status) return [];
				return [...status.staged, ...status.unstaged, ...status.untracked, ...status.conflicts].map((e) => e.path);
			}, [status]);

			const togglePath = useCallback((path) => setSelected((p) => { const n = { ...p }; if (n[path]) delete n[path]; else n[path] = true; return n; }), []);
			const selectAll = useCallback(() => setSelected(Object.fromEntries(allPaths.map((p) => [p, true]))), [allPaths]);
			const clearAll = useCallback(() => setSelected({}), []);

			// Diff / show reads run in their own lane with a sequence guard:
			// the newest click always wins the pane even when an older request
			// settles later, and a slow read never blocks mutations (no global
			// busy → row buttons stay clickable while a diff loads).
			const diffSeqRef = useRef(0);
			const showDiff = useCallback(async (path, staged) => {
				const seq = ++diffSeqRef.current;
				setReadBusy("op.diff"); setError(null);
				try {
					const v = await gitRpc("diff", { repo: cwd, staged, path });
					if (!mounted.current || seq !== diffSeqRef.current) return;
					setDiff({ kind: "work", path, staged, text: v.text, truncated: v.truncated });
				} catch (err) {
					if (mounted.current && seq === diffSeqRef.current) setError(err.message);
				} finally {
					if (mounted.current && seq === diffSeqRef.current) setReadBusy(null);
				}
			}, [cwd]);

			// Untracked files have no `git diff` output — read the file and
			// render it as a brand-new-file diff (all lines added).
			const showNewFile = useCallback(async (path) => {
				const seq = ++diffSeqRef.current;
				setReadBusy("op.read"); setError(null);
				try {
					const v = await gitRpc("read", { repo: cwd, path });
					if (!mounted.current || seq !== diffSeqRef.current) return;
					let text = "";
					if (!v.binary) {
						const lines = (v.text || "").split("\n");
						if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop(); // trailing newline
						text = ["diff --git a/" + path + " b/" + path, "new file mode 100644", "--- /dev/null", "+++ b/" + path, "@@ -0,0 +1," + lines.length + " @@", ...lines.map((l) => "+" + l)].join("\n");
					}
					setDiff({ kind: "work", path, staged: false, text, truncated: v.truncated });
				} catch (err) {
					if (mounted.current && seq === diffSeqRef.current) setError(err.message);
				} finally {
					if (mounted.current && seq === diffSeqRef.current) setReadBusy(null);
				}
			}, [cwd]);

			// Commit detail view (replaces the work area): {hash, subject, files,
			// file, text, truncated, loadingFile}. Opening it fetches the commit's
			// changed-file list, then auto-loads the first file's patch.
			const [commitDetail, setCommitDetail] = useState(null);
			const commitSeqRef = useRef(0);
			const showCommit = useCallback(async (target, subject) => {
				const seq = ++commitSeqRef.current;
				setReadBusy("op.commitRead"); setError(null);
				try {
					const v = await gitRpc("show", { repo: cwd, target });
					if (!mounted.current || seq !== commitSeqRef.current) return;
					const files = Array.isArray(v.files) ? v.files : [];
					setCommitDetail({ hash: target, subject: subject || "", files, file: null, text: "", truncated: false, loadingFile: false });
					setDiff(null);
					if (files.length > 0) {
						const fv = await gitRpc("show", { repo: cwd, target, path: files[0].path });
						if (!mounted.current || seq !== commitSeqRef.current) return;
						setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, file: files[0].path, text: fv.text, truncated: fv.truncated, loadingFile: false } : cd);
					}
				} catch (err) {
					if (mounted.current && seq === commitSeqRef.current) setError(err.message);
				} finally {
					if (mounted.current && seq === commitSeqRef.current) setReadBusy(null);
				}
			}, [cwd]);
			const showCommitFile = useCallback(async (target, path) => {
				setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, file: path, loadingFile: true } : cd);
				try {
					const v = await gitRpc("show", { repo: cwd, target, path });
					if (!mounted.current) return;
					// Stale-guard (same contract as diffSeq/commitSeq): a newer
					// click may have replaced the selected file while this fetch
					// was in flight — only land the text if it is still current,
					// otherwise the slower OLD request would overwrite the newer
					// file's diff (label says B, content says A).
					setCommitDetail((cd) => cd && cd.hash === target && cd.file === path ? { ...cd, text: v.text, truncated: v.truncated, loadingFile: false } : cd);
				} catch (err) {
					if (mounted.current) { setError(err.message); setCommitDetail((cd) => cd && cd.hash === target && cd.file === path ? { ...cd, loadingFile: false } : cd); }
				}
			}, [cwd]);
			const closeCommitDetail = useCallback(() => setCommitDetail(null), []);

			// Commit with an explicit message: text/amend live in CommitBox's own
			// state so typing never re-renders the whole panel tree. Resolves to
			// TRUE only when the commit actually landed — the caller keeps the
			// message/selection on failure instead of wiping the user's input.
			const commitWith = useCallback(async (all, text, amendFlag) => {
				const msg = (text || "").trim();
				if (!msg) { setError(t("commit.msgRequired")); return false; }
				const paths = all ? null : Object.keys(selected).filter((p) => selected[p]);
				if (!all && paths.length === 0) { setError(t("commit.noneSelected")); return false; }
				const okDone = await runOp(all ? "op.commitAll" : "op.commitSel", () => gitRpc("commit", { repo: cwd, message: msg, all: all || undefined, paths: all ? undefined : paths, amend: amendFlag || undefined }));
				if (okDone) setSelected({});
				return okDone;
			}, [cwd, selected, runOp]);

			// ── branch operations ────────────────────────────────────────────────
			const checkoutBranch = useCallback((branch, opts = {}) => runOp(opts.create ? "op.checkoutNew" : "op.checkout", () => gitRpc("checkout", { repo: cwd, branch, create: opts.create || undefined, start: opts.start })), [cwd, runOp]);
			const mergeBranch = useCallback((branch) => runOp("op.merge", () => gitRpc("merge", { repo: cwd, branch })), [cwd, runOp]);
			const updateBranch = useCallback((branch) => runOp("op.update", () => gitRpc("update", { repo: cwd, branch })), [cwd, runOp]);
			const renameBranch = useCallback((branch, name) => runOp("op.rename", () => gitRpc("rename", { repo: cwd, branch, name })), [cwd, runOp]);

			// ── staging / untracking / ignore (file or directory path) ──────────
			const stagePath = useCallback((path) => runOp("op.stage", () => gitRpc("stage", { repo: cwd, path })), [cwd, runOp]);
			const unstagePath = useCallback((path) => runOp("op.unstage", () => gitRpc("unstage", { repo: cwd, path })), [cwd, runOp]);
			const untrackPath = useCallback((path) => runOp("op.untrack", () => gitRpc("untrack", { repo: cwd, path })), [cwd, runOp]);
			const ignorePath = useCallback((path) => runOp("op.ignore", () => gitRpc("gitignore", { repo: cwd, path })), [cwd, runOp]);

			// Stable object identity: the git object only changes when real data
			// changes, so memoized consumers (panel body / sub-views) skip
			// re-renders when unrelated global stores update.
			return useMemo(() => ({
				cwd, isRepo, status, log, gitConfig, branches, diff, setDiff, commitDetail, showCommit, showCommitFile, closeCommitDetail, selected, rebase, setRebase, force, setForce, busy, readBusy, error, setError, op, setOp, refresh, runOp, commitWith, showDiff, showNewFile, togglePath, selectAll, clearAll, allPaths, checkoutBranch, mergeBranch, updateBranch, renameBranch, stagePath, unstagePath, untrackPath, ignorePath
			}), [cwd, isRepo, status, log, gitConfig, branches, diff, commitDetail, showCommit, showCommitFile, closeCommitDetail, selected, rebase, force, busy, readBusy, error, op, refresh, runOp, commitWith, showDiff, showNewFile, togglePath, selectAll, clearAll, allPaths, checkoutBranch, mergeBranch, updateBranch, renameBranch, stagePath, unstagePath, untrackPath, ignorePath]);
		}
		//#endregion

		//#region diffutil
		// ── module-level diff helpers (pure, no closure deps) ──────────────────
		// Word-level LCS diff for one +/- line pair: returns segments
		// [{t:"same"|"del"|"add", s}] so the changed words stand out inside
		// the whole-line red/green background.
		const wordSegs = (oldLine, newLine) => {
			const toks = (l) => l.match(/\s+|\S+/g) || [l || " "];
			const a = toks(oldLine), b = toks(newLine);
			const n = a.length, m = b.length;
			if (n > 80 || m > 80) return null; // skip heavy diff on long lines
			const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
			for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
				dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
			const segs = [];
			let i = 0, j = 0;
			while (i < n && j < m) {
				if (a[i] === b[j]) { segs.push({ t: "same", s: a[i] }); i++; j++; }
				else if (dp[i + 1][j] >= dp[i][j + 1]) { segs.push({ t: "del", s: a[i] }); i++; }
				else { segs.push({ t: "add", s: b[j] }); j++; }
			}
			while (i < n) segs.push({ t: "del", s: a[i++] });
			while (j < m) segs.push({ t: "add", s: b[j++] });
			return segs;
		};

		// Parse `git diff` text into colored rows: hunk headers, +/-, file meta.
		// Also counts +/- lines (excluding file headers) and pairs adjacent
		// `-`/`+` lines inside a hunk for word-level highlighting.
		const diffRows = (text) => {
			if (!text) return { rows: [], added: 0, removed: 0 };
			const rows = [];
			let added = 0, removed = 0;
			let delBuf = [], addBuf = [];
			let paired = 0;
			// Each flush emits its own key namespace: the same `w-${k}` from
			// two different +/- buffers would collide as React sibling keys
			// (a multi-hunk diff flushes many times).
			let flushNo = 0;
			const flush = () => {
				const fno = flushNo++;
				const n = Math.min(delBuf.length, addBuf.length);
				for (let k = 0; k < n; k++) {
					const segs = paired < 1500 ? wordSegs(delBuf[k], addBuf[k]) : null;
					paired++;
					rows.push({ key: `w${fno}-${k}`, cls: "dgp-diffDel", text: delBuf[k], segs: segs ? segs.filter((sg) => sg.t !== "add") : null });
					rows.push({ key: `w${fno}+${k}`, cls: "dgp-diffAdd", text: addBuf[k], segs: segs ? segs.filter((sg) => sg.t !== "del") : null });
				}
				for (let k = n; k < delBuf.length; k++) rows.push({ key: `w${fno}d${k}`, cls: "dgp-diffDel", text: delBuf[k] });
				for (let k = n; k < addBuf.length; k++) rows.push({ key: `w${fno}a${k}`, cls: "dgp-diffAdd", text: addBuf[k] });
				delBuf = []; addBuf = [];
			};
			text.split("\n").forEach((line, i) => {
				if (line.startsWith("@@")) { flush(); rows.push({ key: i, cls: "dgp-diffHunk", text: line }); return; }
				if (line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ") || line.startsWith("new file") || line.startsWith("deleted file") || line.startsWith("Binary files")) { flush(); rows.push({ key: i, cls: "dgp-diffMeta", text: line }); return; }
				if (line.startsWith("+") && !line.startsWith("+++")) { added++; addBuf.push(line); return; }
				if (line.startsWith("-") && !line.startsWith("---")) { removed++; delBuf.push(line); return; }
				flush(); rows.push({ key: i, cls: "", text: line });
			});
			flush();
			return { rows, added, removed };
		};

		// Shared diff ROWS renderer (colored rows + word highlights +
		// truncation note, NO stats chips) — the legacy fallback rendered
		// inside the shared Monaco diff host, by work diff and commit files
		// alike. Stats chips are the caller's (they also show in Monaco mode).
		const diffRowsView = (parsed, truncated) => {
			const cut = parsed.rows.length > 5000;
			const rows = cut ? parsed.rows.slice(0, 5000) : parsed.rows;
			return h("div", { className: "dgp-diff" },
				rows.map((r) => h("div", { key: r.key, className: "dgp-diffLine" },
					h("span", { className: "dgp-diffSpan" + (r.cls ? " " + r.cls : "") },
						r.segs ? r.segs.map((sg, k) => h("span", { key: k, className: sg.t === "same" ? "dgp-diffWordSame" : sg.t === "add" ? "dgp-diffWordAdd" : "dgp-diffWordDel" }, sg.s)) : r.text
					)
				)),
				(truncated || cut) ? h("div", { className: "dgp-diffLine" }, h("span", { className: "dgp-diffSpan dgp-diffMeta" }, cut ? t("diff.truncatedRows", { count: 5000 }) : t("diff.truncatedText"))) : null
			);
		};
		//#endregion

		//#region ui
		// ── memoized sub-views (isolate re-renders from unrelated state) ────────
		let closeActiveToolbarMenu = null;
		// Portaling only the toolbar preserves each page's own state and editor
		// host. Undefined supports standalone component/fixture rendering.
		const inPanelHeader = (host, content) => host === undefined ? content : host ? portal(content, host) : null;
		function ToolbarMenu({ label, items, icon = IconEllipsis, info, className = "", text }) {
			const [position, setPosition] = useState(null);
			const triggerRef = useRef(null), menuRef = useRef(null);
			const menuId = useId();
			const hidden = useSyncExternalStore(subscribeHidden, getHidden);
			const close = useCallback((restore = false) => {
				setPosition(null);
				if (closeActiveToolbarMenu === close) closeActiveToolbarMenu = null;
				if (restore) triggerRef.current?.focus();
			}, []);
			useEffect(() => { if (hidden) close(); }, [hidden, close]);
			useEffect(() => () => { if (closeActiveToolbarMenu === close) closeActiveToolbarMenu = null; }, [close]);
			useEffect(() => {
				if (!position) return;
				menuRef.current?.querySelector("button:not(:disabled)")?.focus();
				const outside = (e) => { if (!menuRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) close(); };
				const escape = (e) => { if (e.key === "Escape") { e.preventDefault(); close(true); } };
				const reposition = () => close();
				document.addEventListener("mousedown", outside);
				document.addEventListener("keydown", escape);
				window.addEventListener("resize", reposition);
				return () => {
					document.removeEventListener("mousedown", outside);
					document.removeEventListener("keydown", escape);
					window.removeEventListener("resize", reposition);
				};
			}, [position, close]);
			const open = (e) => {
				e.preventDefault(); e.stopPropagation();
				if (position) { close(); return; }
				closeActiveToolbarMenu?.(); closeActiveToolbarMenu = close;
				const r = e.currentTarget.getBoundingClientRect();
				const box = document.querySelector(".dgp-dialog")?.getBoundingClientRect() ?? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
				const width = Math.max(0, Math.min(280, box.right - box.left - 16));
				const below = Math.max(0, box.bottom - r.bottom - 12);
				const above = Math.max(0, (r.top ?? r.bottom - 28) - box.top - 12);
				// Natural height: the viewport bounds the whole menu, never a
				// row-count estimate that clips large fonts or wrapped labels.
				const upwards = below < 160 && above > below;
				setPosition({ left: Math.max(box.left + 8, Math.min(r.right - width, box.right - width - 8)), ...(upwards ? { bottom: window.innerHeight - (r.top ?? r.bottom - 28) + 4 } : { top: r.bottom + 4 }), width, maxHeight: upwards ? above : below });
			};
			const keys = (e) => {
				if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
				e.preventDefault();
				const buttons = Array.from(menuRef.current?.querySelectorAll("button:not(:disabled)") ?? []);
				const at = buttons.indexOf(document.activeElement);
				const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (at + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
				buttons[next]?.focus();
			};
			return h(React.Fragment, null,
				h("button", { type: "button", ref: triggerRef, className: "dgp-toolbarMenuBtn " + (text ? "dgp-toolbarMenuText " : "") + className, title: label, "aria-label": label, "aria-haspopup": "menu", "aria-expanded": !!position, "aria-controls": position ? menuId : undefined, onClick: open, onKeyDown: (e) => { if (!position && (e.key === "ArrowDown" || e.key === "ArrowUp")) open(e); } }, icon ? h(icon, { size: 15 }) : null, text ? h(React.Fragment, null, h("span", null, text), h(IconChevronDown, { size: 12 })) : null),
				position ? portal(h("div", { id: menuId, ref: menuRef, className: "dgp-toolbarMenu", style: position, role: "menu", "aria-label": label, onKeyDown: keys },
					info ? h("div", { className: "dgp-toolbarMenuInfo" }, info) : null,
					items.filter(Boolean).map((item, index) => h("button", { key: item.key ?? index, type: "button", className: "dgp-logMenuItem", role: item.checked === undefined ? "menuitem" : "menuitemcheckbox", "aria-checked": item.checked, disabled: !!item.disabled, "data-danger": item.danger ? "true" : undefined, title: item.title, onClick: () => { close(true); item.run(); } },
						h("span", { className: "dgp-menuIcon", "aria-hidden": "true" }, item.icon ? h(item.icon, { size: 14 }) : null),
						h("span", { className: "dgp-menuLabel" }, item.label),
						h("span", { className: "dgp-menuCheck", "aria-hidden": "true" }, item.checked ? h(IconCheck, { size: 12 }) : null)))
				), document.querySelector(".dgp-root")) : null);
		}
		// Fixed-height rows match the existing file (32px) / change (30px)
		// layouts. Small lists render normally; large lists mount one viewport.
		function listWindow(count, rowHeight, top, height, overscan = 8) {
			const end = Math.min(count, Math.ceil((top + height) / rowHeight) + overscan);
			const start = Math.min(Math.max(0, end - 1), Math.max(0, Math.floor(top / rowHeight) - overscan));
			return { start, end };
		}
		function WindowedList({ items, rowHeight, renderItem, itemKey, className }) {
			const uiSize = useSyncExternalStore(subscribePanelFonts, getUiFontSize);
			rowHeight *= Math.max(1, uiSize / DEFAULT_UI_FONT_SIZE);
			const ref = useRef(null);
			const [view, setView] = useState({ top: 0, height: 600 });
			const virtual = items.length > 200;
			useEffect(() => {
				const el = ref.current;
				if (!el) return;
				const update = () => {
					const top = Math.min(el.scrollTop, Math.max(0, el.scrollHeight - el.clientHeight));
					setView((v) => v.top === top && v.height === el.clientHeight ? v : { top, height: el.clientHeight });
				};
				update();
				const observer = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
				observer?.observe(el);
				return () => observer?.disconnect();
			}, [items.length, rowHeight]);
			const { start, end } = virtual ? listWindow(items.length, rowHeight, view.top, view.height) : { start: 0, end: items.length };
			return h("div", { className, ref, onScroll: virtual ? (e) => setView({ top: e.currentTarget.scrollTop, height: e.currentTarget.clientHeight }) : undefined },
				virtual && start > 0 ? h("div", { "aria-hidden": "true", style: { height: start * rowHeight } }) : null,
				items.slice(start, end).map((item) => h("div", { key: itemKey(item), className: virtual ? "dgp-windowRow" : undefined, style: virtual ? { height: rowHeight, boxSizing: "border-box" } : undefined }, renderItem(item))),
				virtual && end < items.length ? h("div", { "aria-hidden": "true", style: { height: (items.length - end) * rowHeight } }) : null
			);
		}
		// One change-list row; memoized so toggling a checkbox / expanding a dir
		// only rebuilds the rows whose props actually changed.
		const ChangeRow = React.memo(function ChangeRow({ entry, stagedFlag, depth, checked, busy, conflict, onShowDiff, onShowNewFile, onTogglePath, onStage, onUnstage, onIgnore }) {
			const code = stagedFlag ? entry.code[0] : entry.code[1];
			const untracked = entry.code === "??";
			const busyOn = (label) => busy === label || busy === "op.refresh";
			const t = useT();
			const tone = conflict ? "error" : code === "A" ? "success" : code === "D" ? "error" : (code === "R" || code === "C") ? "warn" : undefined;
			// Directory context is already expressed by the tree above; the row
			// shows just the file name (full path stays in the tooltip).
			const fileName = entry.path.slice(entry.path.lastIndexOf("/") + 1);
			return h("div", { className: "dgp-row dgp-treeRow", "data-clickable": "true", "data-selected": checked ? "true" : "false", style: { paddingLeft: 6 + depth * 8, "--tree-guide-width": `${depth * 8}px` }, onClick: () => (untracked ? onShowNewFile(entry.path) : onShowDiff(entry.path, stagedFlag)) },
				// 12px spacer = chevron column of DirRow, so the checkbox lines up
			// with the folder icons above it instead of floating at row start.
			h("span", { style: { width: 12, flex: "none" } }),
				h("input", { type: "checkbox", className: "dgp-chk", checked, onChange: () => onTogglePath(entry.path), onClick: (e) => e.stopPropagation() }),
				h("span", { className: "dgp-badge", "data-tone": tone }, letterLabel(code)),
				h("span", { className: "dgp-rowPath", title: entry.path, style: { flex: "0 1 auto", color: conflict ? "var(--dsw-alias-state-error-primary)" : undefined } }, fileName),
				// Staging-state text only where it adds info: untracked rows drop
				// it — the ?? badge + 未跟踪 group title already say it twice.
				h("span", { className: "dgp-rowMeta" }, untracked ? null : stagedFlag ? t("git.flagStaged") : t("git.flagUnstaged")),
				h("span", { style: { flex: 1 } }),
				h("span", { className: "dgp-rowActions" },
					stagedFlag && !conflict ? lbtn(busyOn("op.unstage") ? "…" : t("git.unstage"), () => onUnstage(entry.path), { disabled: busy !== null }) : null,
					!stagedFlag && !untracked ? lbtn(busyOn("op.stage") ? "…" : t("git.stage"), () => onStage(entry.path), { disabled: busy !== null }) : null,
					!stagedFlag && untracked ? lbtn(busyOn("op.stage") ? "…" : t("git.track"), () => onStage(entry.path), { disabled: busy !== null, title: t("git.trackFile") }) : null,
					!stagedFlag && untracked ? lbtn(busyOn("op.ignore") ? "…" : t("git.ignore"), () => onIgnore(entry.path), { disabled: busy !== null, title: t("git.ignoreFile") }) : null
				)
			);
		}, (prev, next) =>
			// Compare by content, not by object identity: a status refresh creates
			// brand-new entry objects, but rows whose path/code didn't change must
			// NOT re-render (this is the hot path for 5s polling + refresh-all).
			prev.entry.path === next.entry.path && prev.entry.code === next.entry.code &&
			prev.stagedFlag === next.stagedFlag && prev.depth === next.depth &&
			prev.checked === next.checked && prev.busy === next.busy && prev.conflict === next.conflict &&
			prev.onShowDiff === next.onShowDiff && prev.onShowNewFile === next.onShowNewFile &&
			prev.onTogglePath === next.onTogglePath && prev.onStage === next.onStage &&
			prev.onUnstage === next.onUnstage && prev.onIgnore === next.onIgnore
		);
		const DirRow = React.memo(function DirRow({ name, count, depth, open, onToggleDir, dirKey, dirPath, onDirAction, actions, title }) {
			const t = useT();
			return h("div", { className: "dgp-row dgp-dirRow dgp-treeRow", "data-clickable": "true", "data-open": open ? "true" : "false", title, onClick: () => onToggleDir(dirKey), style: { paddingLeft: 6 + depth * 8, "--tree-guide-width": `${depth * 8}px` } },
				h(open ? IconChevronDown : IconChevronRight, { size: 12 }),
				h("span", { className: "dgp-rowPath", style: { fontWeight: 500 } }, name),
				h("span", { className: "dgp-rowMeta" }, t("common.items", { count })),
				actions && actions.length > 0 ? h("span", { className: "dgp-rowActions" }, actions.map((a) => lbtn(a.label, (e) => { e.stopPropagation(); onDirAction(a.kind, dirPath); }, { disabled: a.disabled, title: a.title }))) : null
			);
		}, (prev, next) => prev.name === next.name && prev.count === next.count && prev.depth === next.depth &&
			prev.open === next.open && prev.onToggleDir === next.onToggleDir && prev.dirKey === next.dirKey && prev.dirPath === next.dirPath &&
			prev.onDirAction === next.onDirAction && prev.title === next.title &&
			(prev.actions === next.actions || (!!prev.actions && !!next.actions && prev.actions.length === next.actions.length && prev.actions.every((a, i) =>
				a.kind === next.actions[i].kind && a.label === next.actions[i].label && a.disabled === next.actions[i].disabled && a.title === next.actions[i].title))));

		// Working-tree changes as a collapsible directory tree (one card).
		const ChangeList = React.memo(function ChangeList({ status, allPaths, selected, busy, onShowDiff, onShowNewFile, onTogglePath, onStage, onUnstage, onUntrack, onIgnore, onSelectAll, onClearAll }) {
			const s = status;
			const t = useT();
			const [openDirs, setOpenDirs] = useState(null); // null = all open; Set of "group|dirPath" = collapsed
			const toggleDir = useCallback((key) => {
				setOpenDirs((prev) => {
					const n = prev === null ? new Set() : new Set(prev);
					if (n.has(key)) n.delete(key); else n.add(key);
					return n.size === 0 ? null : n;
				});
			}, []);
			const dirOpen = (key) => openDirs === null || !openDirs.has(key);
			const runDirAction = useCallback((kind, dirPath) => {
				if (kind === "stage") onStage(dirPath);
				else if (kind === "unstage") onUnstage(dirPath);
				else if (kind === "untrack") onUntrack(dirPath);
				else if (kind === "ignore") onIgnore(dirPath);
			}, [onStage, onUnstage, onUntrack, onIgnore]);
			const buildTree = useCallback((entries) => {
				const root = { dirs: new Map(), files: [], count: 0 };
				for (const e of entries) {
					const parts = e.path.split("/");
					let node = root;
					node.count++;
					for (let d = 0; d < parts.length - 1; d++) {
						const seg = parts[d];
						if (!node.dirs.has(seg)) node.dirs.set(seg, { dirs: new Map(), files: [], count: 0 });
						node = node.dirs.get(seg);
						node.count++;
					}
					node.files.push(e);
				}
				return root;
			}, []);
			// Keep descendant file counts on each node while indexing. Recounting
			// recursively for every directory row multiplied work on deep trees.
			// Directory-level actions differ per group:
			//   staged   → unstage (restore --staged), untrack (rm --cached -r)
			//   unstaged → stage (add), untrack
			//   untracked→ track (add), ignore (.gitignore) — untracked has no untrack
			const dirActions = (groupKind, dirPath) => {
				const busyOn = (label) => busy === label || busy === "op.refresh";
				if (groupKind === "s") return [
					{ kind: "unstage", label: busyOn("op.unstage") ? "…" : t("git.unstage"), disabled: busy !== null, title: t("git.actUnstage", { path: dirPath }) },
					{ kind: "untrack", label: busyOn("op.untrack") ? "…" : t("git.untrack"), disabled: busy !== null, title: t("git.actUntrack", { path: dirPath }) }
				];
				if (groupKind === "t") return [
					{ kind: "stage", label: busyOn("op.stage") ? "…" : t("git.track"), disabled: busy !== null, title: t("git.actTrack", { path: dirPath }) },
					{ kind: "ignore", label: busyOn("op.ignore") ? "…" : t("git.ignore"), disabled: busy !== null, title: t("git.actIgnore", { path: dirPath }) }
				];
				return [
					{ kind: "stage", label: busyOn("op.stage") ? "…" : t("git.stage"), disabled: busy !== null, title: t("git.actStage", { path: dirPath }) },
					{ kind: "untrack", label: busyOn("op.untrack") ? "…" : t("git.untrack"), disabled: busy !== null, title: t("git.actUntrack", { path: dirPath }) }
				];
			};
			const flattenTree = (node, depth, groupKey, pathPrefix, groupKind, out) => {
				for (const [name, child] of node.dirs) {
					const dirPath = pathPrefix ? `${pathPrefix}/${name}` : name;
					const key = `${groupKey}|${dirPath}`;
					const open = dirOpen(key);
					out.push({ kind: "dir", key: `dir:${key}`, name, count: child.count, depth, open, dirKey: key, dirPath, groupKind });
					if (open) flattenTree(child, depth + 1, groupKey, dirPath, groupKind, out);
				}
				for (const f of node.files) {
					out.push({ kind: "file", key: `${groupKind}:${f.path}`, entry: f, depth, groupKind });
				}
				return out;
			};
			const conflictPaths = useMemo(() => new Set((s?.conflicts || []).map((entry) => entry.path)), [s?.conflicts]);
			// Tree structures only change when one of the visible change groups
			// changes. Row memoization then isolates unaffected files and folders.
			const trees = useMemo(() => ({
				staged: buildTree(s.staged),
				unstaged: buildTree(s.unstaged),
				untracked: buildTree(s.untracked)
			}), [s.staged, s.unstaged, s.untracked, buildTree]);
			const rows = useMemo(() => {
				const out = [];
				if (s.conflicts?.length) {
					out.push({ kind: "title", key: "conflicts", label: "git.conflicts", count: s.conflicts.length });
					for (const entry of s.conflicts) out.push({ kind: "conflict", key: `c:${entry.path}`, entry });
				}
				for (const [name, groupKind] of [["staged", "s"], ["unstaged", "u"], ["untracked", "t"]]) {
					if (!s[name].length) continue;
					out.push({ kind: "title", key: name, label: `git.${name}`, count: s[name].length });
					flattenTree(trees[name], 0, groupKind, "", groupKind, out);
				}
				return out;
			}, [trees, openDirs, s.conflicts]);
			const renderChange = (row) => {
				if (row.kind === "title") return h("div", { className: "dgp-sectionTitle", style: { minHeight: 22 } }, t(row.label, { count: row.count }));
				if (row.kind === "dir") return h(DirRow, { ...row, onToggleDir: toggleDir, onDirAction: runDirAction, actions: dirActions(row.groupKind, row.dirPath), title: t("common.expandCollapse", { path: row.dirPath }) });
				const entry = row.entry;
				if (row.kind === "conflict") return h("div", { className: "dgp-row", "data-clickable": "true", onClick: () => onShowDiff(entry.path, false) }, h("span", { className: "dgp-badge", "data-tone": "error" }, letterLabel(entry.code)), h("span", { className: "dgp-rowPath", style: { color: "var(--dsw-alias-state-error-primary)" } }, entry.path));
				return h(ChangeRow, { entry, stagedFlag: row.groupKind === "s", depth: row.depth, checked: !!selected[entry.path], busy, conflict: conflictPaths.has(entry.path), onShowDiff, onShowNewFile, onTogglePath, onStage, onUnstage, onIgnore });
			};
			const allChecked = allPaths.length > 0 && allPaths.every((p) => !!selected[p]);
			return h("div", { className: "dgp-changePanel dgp-gitGrow" },
				h("div", { className: "dgp-sectionHead dgp-changeHead dgp-contentHead" },
					h("input", { type: "checkbox", className: "dgp-chk", "aria-label": allChecked ? t("git.deselectAll") : t("git.selectAll"), checked: allChecked, disabled: allPaths.length === 0, onChange: () => allChecked ? onClearAll() : onSelectAll() }),
					h("div", { className: "dgp-sectionTitle" }, t("git.changedFiles")),
					h(ToolbarMenu, { label: t("git.selectionActions"), icon: IconListPen, items: [
						{ label: t("git.allDiff"), run: () => onShowDiff("", false) },
						{ label: allChecked ? t("git.deselectAll") : t("git.selectAll"), checked: allChecked, run: () => (allChecked ? onClearAll() : onSelectAll()) },
						{ label: t("common.clear"), run: onClearAll }
					] })
				),
				rows.length > 0 ? h(WindowedList, { items: rows, rowHeight: 30, renderItem: renderChange, itemKey: (row) => row.key, className: "dgp-gitScroll dgp-changeScroll" }) : h("div", { className: "dgp-empty" }, t("git.clean"))
			);
		});

		// Commit message input in the changes column: isolated state so
		// typing never touches the rest of the panel tree.
		const CommitBox = React.memo(function CommitBox({ busy, commitWith, hasRepo }) {
			const [msg, setMsg] = useState("");
			const busyOn = (label) => busy === label || busy === "op.refresh";
			const t = useT();
			const submit = async (all) => {
				if (busy !== null || !hasRepo) return;
				// Keep the message on failure: a rejected commit (hook refusal,
				// noneSelected, timeout) must not destroy what the user typed.
				const done = await commitWith(all, msg);
				if (done) setMsg("");
			};
			// The changes column owns the draft and commit actions.
			return h("div", { className: "dgp-commitInline" },
				h("input", { className: "dgp-commitInput", placeholder: t("commit.placeholder"), value: msg, onChange: (e) => setMsg(e.target.value), onKeyDown: (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submit(true); } }, title: t("commit.ctrlEnter") }),
				btn(busyOn("op.commitSel") ? t("commit.committing") : t("commit.sel"), () => submit(false), { disabled: busy !== null || !hasRepo }),
				btn(busyOn("op.commitAll") ? t("commit.committing") : t("commit.all"), () => submit(true), { disabled: busy !== null || !hasRepo, variant: "primary" })
			);
		});

		// Shared Monaco diff host: mounts the sidecar-hosted diff editor (with
		// the FIXED red/blue diff palette) once per element lifetime and swaps
		// models on text/path changes; falls back to the legacy row renderer
		// (`children`) when Monaco is unavailable (loader failure, non-loopback
		// page) or the unified text is not reconstructable. Used by the work
		// diff AND the commit-file diff, so both always look the same.
		// `fallback` is a RENDER FUNCTION, invoked only when the legacy rows
		// actually render — building up to 5000 row elements per pass would
		// otherwise run on every render even while Monaco shows, and defeat
		// the memo (function identity is irrelevant since it is not a dep).
		const MonacoDiffHost = React.memo(function MonacoDiffHost({ text, path, fallback: renderFallback, truncated }) {
			const hostRef = useRef(null);
			const edRef = useRef(null);
			const [fallback, setFallback] = useState(false);
			useEffect(() => {
				if (text.trim() === "") return undefined;
				let alive = true;
				let timer = null;
				let retried = false;
				const attempt = async () => {
					if (!alive || !hostRef.current) return;
					try {
						// A successful Monaco load stays cached for this page, but the
						// sidecar port can rotate between diff updates. Repoint worker
						// assets before reusing the editor so diff computation does not
						// silently fall back to uncolored text after a restart.
						await ensureMonaco();
						if (!alive) return;
						// Fast path: an already-mounted editor just swaps models.
						if (edRef.current) {
							if (edRef.current.update(text, path)) { setFallback(false); return; }
							edRef.current.dispose();          // unparseable now: replace
							edRef.current = null;
						}
						const inst = await mountMonacoDiff(hostRef.current, text, path);
						if (!alive) { inst?.dispose(); return; }
						if (!inst) { setFallback(true); return; }   // unparseable diff
						edRef.current = inst;
						setFallback(false);
					} catch {
						// loader/sidecar failure: retry once (the first attempt
						// often races the host element's layout), then give up to
						// the legacy renderer for THIS text. A later text re-runs
						// the whole attempt (the effect re-fires on [text, path]),
						// so a one-off failure no longer poisons the pane.
						if (!alive) return;
						if (!retried) { retried = true; timer = window.setTimeout(attempt, 60); }
						else {
							edRef.current?.dispose();
							edRef.current = null;
							setFallback(true);
						}
					}
				};
				void attempt();
				return () => {
					alive = false;
					if (timer) window.clearTimeout(timer);
				};
			}, [text, path]);
			// Dispose on unmount — React removes the host DOM node, but the
			// Monaco editor instance and its models survive until disposed.
			useEffect(() => () => {
				if (edRef.current) { edRef.current.dispose(); edRef.current = null; }
			}, []);
			return h(React.Fragment, null,
				// Truncation notice on the MONACO path — the legacy fallback
				// renders its own (diffRowsView), and previously the Monaco
				// view silently ended mid-file looking like the complete diff.
				truncated && !fallback ? h("div", { className: "dgp-hint", style: { padding: "2px 10px" } }, t("diff.truncatedText")) : null,
				h("div", { ref: hostRef, className: "dgp-diff dgp-diffMonaco", style: fallback ? { display: "none" } : undefined }),
				fallback ? renderFallback() : null
			);
		});

		// Work-tree diff preview card (parsed rows memoized per diff text).
		// Body renders through the shared MonacoDiffHost (Monaco diff with the
		// fixed red/blue palette; legacy rows as fallback). The stats chips
		// always come from diffRows() — they show in BOTH render paths.
		const DiffPane = React.memo(function DiffPane({ diff, onShowDiff, onClose }) {
			const parsed = useMemo(() => (diff.text.trim() === "" ? null : diffRows(diff.text)), [diff.text]);
			const t = useT();
			const titleLabel = diff.path === "" ? (diff.staged ? t("diff.allStaged") : t("diff.allUnstaged")) : diff.path + (diff.staged ? t("diff.stagedSuffix") : "");
			return h("div", { className: "dgp-gitCard dgp-diffCard" },
				h("div", { className: "dgp-sectionHead dgp-contentHead" },
					h("div", { className: "dgp-sectionTitle", title: diff.path },
						h("span", { className: "dgp-toolbarTitle" }, t("diff.title", { label: titleLabel })),
						parsed ? chip(`+${parsed.added}`, "info") : null,
						parsed ? chip(`−${parsed.removed}`, "error") : null
					),
					h("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
						diff.path === "" ? h(React.Fragment, null,
							lbtn(t("git.flagUnstaged"), () => onShowDiff("", false), { active: !diff.staged }),
							lbtn(t("git.flagStaged"), () => onShowDiff("", true), { active: diff.staged })
						) : lbtn(t("common.viewAll"), () => onShowDiff("", false)),
						lbtn(null, onClose, { tone: "default", icon: h(IconClose, { size: 14 }), title: t("common.close"), ariaLabel: t("common.close") })
					)
				),
				parsed === null ? h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("diff.noContent"))
					: h(MonacoDiffHost, { text: diff.text, path: diff.path, truncated: diff.truncated === true, fallback: () => diffRowsView(parsed, diff.truncated) })
			);
		});

		// Commit detail view (replaces work area + history).
		// Narrow drill-down: the 3:7 grid collapses to one screen at a time —
		// the commit's file list, or the selected file's full-width diff with
		// a 返回 button. Wide mode renders both panes and never reads pane state.
		// The file diff renders through the SAME MonacoDiffHost as the work
		// diff (fixed red/blue palette) — never the bare legacy renderer.
		const CommitDetailView = React.memo(function CommitDetailView({ commitDetail, onShowFile, onClose, headerHost, pageNavigation }) {
			const d = commitDetail;
			const t = useT();
			const narrow = useNarrow();
			const [pane, setPane] = useState("list");   // narrow: 'list' ⇄ 'file'
			const filePane = narrow && pane === "file" && !!d.file;
			// Same parsing the work diff uses: stats chips from diffRows, body
			// through MonacoDiffHost with the legacy rows as fallback.
			const fileParsed = useMemo(() => (!d.file || d.text.trim() === "" ? null : diffRows(d.text)), [d.file, d.text]);
			return h("div", { className: "dgp-commitView" },
				inPanelHeader(headerHost, h("div", { className: "dgp-pageToolbar dgp-historyToolbar" },
					h("div", { className: "dgp-historyContext" },
						lbtn(null, filePane ? () => setPane("list") : onClose, { icon: h(IconArrowLeft, { size: 14 }), title: t("git.back") }),
						h("span", { className: "dgp-historyHash", title: d.hash }, d.hash.slice(0, 7)),
						h("span", { className: "dgp-crumbSep" }, "·"),
						h("span", { className: "dgp-toolbarTitle", title: d.subject }, d.subject || t("commit.title", { hash: d.hash.slice(0, 7) }))),
					pageNavigation ? h("span", { className: "dgp-toolbarDivider", "aria-hidden": "true" }) : null,
					pageNavigation,
					h("div", { className: "dgp-pageActions" }, filePane ? lbtn(null, onClose, { icon: h(IconClose, { size: 14 }), title: t("common.close") }) : null))),
				h("div", { className: "dgp-commitGrid" },
					h("div", { className: "dgp-commitFilesPane", hidden: filePane },
						h("div", { className: "dgp-sectionHead dgp-contentHead" },
							h("div", { className: "dgp-sectionTitle", title: t("commit.filesHint", { count: d.files.length }) }, t("git.changedFiles") + " (" + d.files.length + ")")),
						h("div", { className: "dgp-gitCard dgp-commitFilesCard" },
							h("div", { className: "dgp-gitScroll" },
								d.files.length === 0 ? h("div", { className: "dgp-empty" }, t("commit.noFiles")) :
								d.files.map((f) => h("div", {
									key: `cf:${f.path}`, className: "dgp-row dgp-logRow", "data-clickable": "true",
									"data-active": d.file === f.path ? "true" : "false",
									title: f.path, onClick: () => { onShowFile(d.hash, f.path); if (narrow) setPane("file"); }
								},
									h("span", { className: "dgp-badge", "data-tone": f.code === "A" ? "success" : f.code === "D" ? "error" : "warn" }, f.code),
									h("span", { className: "dgp-rowPath", style: { flex: 1, minWidth: 0 } }, f.path)
								))
							)
						)
					),
					(!narrow || filePane) ? h("div", { className: "dgp-gitCard dgp-diffCard" },
						h("div", { className: "dgp-sectionHead dgp-contentHead" },
							h("div", { className: "dgp-sectionTitle", title: d.file },
								h("span", { className: "dgp-toolbarTitle" }, d.file || t("commit.noFile")),
								fileParsed ? chip(`+${fileParsed.added}`, "info") : null,
								fileParsed ? chip(`−${fileParsed.removed}`, "error") : null
							)
						),
						d.loadingFile ? h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("common.loading"))
							: fileParsed ? h(MonacoDiffHost, { text: d.text, path: d.file, truncated: d.truncated === true, fallback: () => diffRowsView(fileParsed, d.truncated) })
							: h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("diff.empty"))
					) : null
				)
			);
		});

		// Commit history block: collapsed bar ⇄ expanded list with internal
		// scroll + auto-scroll-into-view; own limit/open state. The log context
		// menu lives HERE (not in GitView) so right-clicking a row only
		// re-renders this block, never the whole panel.
		// ── git graph lanes ──────────────────────────────────────────────────────
		// Classic streaming lane assignment (the GitLens / gitgraph.js family):
		// log entries arrive newest-first; every lane expects the sha of the
		// commit that will appear next on that branch line. A commit consumes
		// its lane, the first parent continues it, merge parents fan OUT to
		// new lanes to its right — or fan IN when that parent line already
		// exists. Colors belong to the LINE (they survive index shifts) and
		// cycle through a fixed palette; capacity is capped and overflow
		// collapses into the last lane. Output per entry: { dot, color, segs }
		// where segs are {a, b, half, color} lane-index segments — the
		// renderer tiles ONE svg per row (top edge = lane arrangement before
		// the commit, bottom edge = after), so variable row heights cost
		// nothing and curves never span rows.
		const GRAPH_LANES_MAX = 12;
		const GRAPH_PALETTE = 6;
		function computeLogLanes(entries) {
			let lanes = [];   // [{sha, color}] — lane i expects lanes[i].sha next
			let nextColor = 0;
			return entries.map((e) => {
				const sha = String(e.hash ?? "");
				const parents = Array.isArray(e.parents) ? e.parents.map((p) => String(p)).filter(Boolean) : [];
				let dot = lanes.findIndex((l) => l.sha === sha);
				if (dot === -1) {
					// A tip with no visible child above (truncated log slice or a
					// fan-in from beyond it). At capacity, TAKE OVER the last lane
					// (replace, never grow): the old splice-insert pushed every
					// further tip one lane further out and the array grew without
					// bound past the documented 12-lane cap.
					if (lanes.length < GRAPH_LANES_MAX) {
						dot = lanes.length;
						lanes.splice(dot, 0, { sha, color: nextColor++ % GRAPH_PALETTE });
					} else {
						dot = GRAPH_LANES_MAX - 1;
						lanes[dot] = { sha, color: nextColor++ % GRAPH_PALETTE };
					}
				}
				const consumed = lanes[dot];
				const topLanes = lanes.slice();
				// Bottom-edge arrangement: consume the commit's lane, first
				// parent continues it, extra parents fan out / in.
				lanes = topLanes.filter((_, i) => i !== dot);
				const p0 = parents[0] ?? null;
				// Fan-in check for the FIRST parent too: on a standard merge
				// the side branch's lane already expects p0 (the merge's first
				// parent IS that branch's expected continuation). Without this
				// check the splice duplicated the sha into a second lane — a
				// zombie line running to the bottom of the log, one leaked slot
				// per merge, and the visual fan-in collapsed into a straight line.
				const p0Existing = p0 ? lanes.findIndex((l) => l.sha === p0) : -1;
				if (p0 && p0Existing === -1) lanes.splice(dot, 0, { sha: p0, color: consumed.color });
				const curves = [];
				let insertAt = dot + 1;
				for (const p of parents.slice(1)) {
					const existing = lanes.findIndex((l) => l.sha === p);
					if (existing !== -1) {
						curves.push({ lane: existing, color: lanes[existing].color });
					} else if (lanes.length < GRAPH_LANES_MAX) {
						lanes.splice(insertAt, 0, { sha: p, color: nextColor++ % GRAPH_PALETTE });
						curves.push({ lane: insertAt, color: lanes[insertAt].color });
						insertAt += 1;
					} else {
						curves.push({ lane: GRAPH_LANES_MAX - 1, color: lanes[GRAPH_LANES_MAX - 1].color });
					}
				}
				// Pass-through segments: match every non-consumed top lane by
				// sha in the bottom arrangement (straight when the index is
				// unchanged, an S-curve when merge insertions shifted it).
				const segs = [];
				for (let i = 0; i < topLanes.length; i++) {
					if (i === dot) continue;
					const j = lanes.findIndex((l) => l.sha === topLanes[i].sha);
					if (j !== -1) segs.push({ a: i, b: j, half: "full", color: topLanes[i].color });
				}
				// The consumed lane: incoming half + dot (+ first-parent half —
				// straight when p0 continued the lane, an S-curve into its
				// EXISTING lane when this was a fan-in).
				segs.push({ a: dot, b: dot, half: "top", color: consumed.color });
				if (p0) segs.push({ a: dot, b: p0Existing === -1 ? dot : p0Existing, half: "bottom", color: consumed.color });
				for (const c of curves) segs.push({ a: dot, b: c.lane, half: "mid", color: c.color });
				return { dot, color: consumed.color, segs };
			});
		}
		/** One log row's graph column: x = 7 + lane*13 px; the svg viewport is
		 * graphW×100 with vertical stretch (preserveAspectRatio none) — lines
		 * and curves tolerate it, and non-scaling-stroke keeps 2px strokes.
		 * The commit dot is a DOM span (never distorted), HEAD gets a ring. */
		function logGraphPath(s) {
			const ax = 7 + s.a * 13;
			const bx = 7 + s.b * 13;
			if (s.half === "top") return `M ${ax} 0 L ${ax} 50`;
			if (s.half === "bottom") return `M ${ax} 50 L ${ax} 100`;
			if (s.half === "mid") return `M ${ax} 50 C ${ax} 70, ${bx} 80, ${bx} 100`;
			return s.a === s.b ? `M ${ax} 0 L ${ax} 100` : `M ${ax} 0 C ${ax} 30, ${bx} 70, ${bx} 100`;
		}

		const HistoryBlock = React.memo(function HistoryBlock({ log, currentHash, onShowCommit, setConfirm, runOp, cwd }) {
			const [histOpen, setHistOpen] = useState(false);
			const [logLimit, setLogLimit] = useState(10);
			const [logMenu, setLogMenu] = useState(null); // {hash, subject, x, y}
			const histRef = useRef(null);
			const t = useT();
			useEffect(() => {
				if (histOpen && histRef.current) histRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
			}, [histOpen]);
			useEffect(() => {
				if (!logMenu) return;
				const close = () => setLogMenu(null);
				document.addEventListener("click", close);
				return () => document.removeEventListener("click", close);
			}, [logMenu]);
			// The log context menu is portaled to the panel root (outside the
			// dialog content) so its backdrop-filter renders; while open, wheel
			// is locked everywhere in the panel except inside the menu.
			useEffect(() => {
				if (!logMenu) return;
				const onWheel = (e) => {
					if (e.target.closest(".dgp-logMenu")) return;
					if (e.target.closest(".dgp-root")) e.preventDefault();
				};
				document.addEventListener("wheel", onWheel, { passive: false });
				return () => document.removeEventListener("wheel", onWheel);
			}, [logMenu]);
			// Suspending the panel closes the context menu: it is portaled under
			// .dgp-root, so the dialog's slide-out transform never moves it — it
			// would keep floating over the main UI while suspended (and the
			// hidden root swallows pointer events, making it unclosable).
			const panelHidden = useSyncExternalStore(subscribeHidden, getHidden);
			useEffect(() => { if (panelHidden) setLogMenu(null); }, [panelHidden]);
			const safeLines = Array.isArray(log?.lines) ? log.lines : [];
			// Normalize entries: a STALE host process (not restarted after the
			// structured-log upgrade) still returns `--oneline` strings while
			// this client renders objects — coerce once so BOTH shapes render
			// (identity fields simply stay empty) instead of crashing the slot.
			const entries = safeLines.map((raw) => {
				if (typeof raw === "string") {
					const sp = raw.indexOf(" ");
					const h = sp === -1 ? raw : raw.slice(0, sp);
					return { h, hash: h, subject: sp === -1 ? "" : raw.slice(sp + 1), refs: "", name: "", email: "", date: "", parents: [] };
				}
				return raw;
			});
			// Graph lanes over the VISIBLE slice — recomputed per render (≤100
			// entries of small constant work; cheaper than memo bookkeeping).
			const visible = entries.slice(0, logLimit);
			const graphs = computeLogLanes(visible);
			let laneMax = 0;
			for (const g of graphs) {
				laneMax = Math.max(laneMax, g.dot);
				for (const s of g.segs) laneMax = Math.max(laneMax, s.a, s.b);
			}
			const graphW = 14 + (laneMax + 1) * 13;
			if (!safeLines.length) return null;
			if (!histOpen) return h("button", { type: "button", className: "dgp-histBar", ref: histRef, onClick: () => setHistOpen(true), title: t("hist.title") },
				h(IconChevronRight, { size: 12 }),
				h("span", { className: "dgp-sectionTitle" }, t("hist.title")),
				h("span", { className: "dgp-hint" }, t("hist.recent", { count: safeLines.length })),
				h("span", { style: { flex: 1 } }),
				h("span", { className: "dgp-hint" }, t("hist.expand"))
			);
			return h(React.Fragment, null,
				h("div", { className: "dgp-gitCard dgp-histCard", ref: histRef },
					h("div", { className: "dgp-sectionHead" },
						h("div", { className: "dgp-sectionTitle" }, t("hist.title")),
						h("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
							safeLines.length > logLimit ? lbtn(t("hist.loadMore", { count: safeLines.length - logLimit }), () => setLogLimit((n) => n + 10)) : null,
							h("span", { className: "dgp-hint" }, `${Math.min(logLimit, safeLines.length)} / ${safeLines.length}`),
							lbtn(t("hist.collapse"), () => setHistOpen(false), { tone: "default" })
						)
					),
					h("div", { className: "dgp-gitScroll dgp-histList" }, entries.slice(0, logLimit).map((e, idx) => {
						const hash = String(e.h ?? e.hash ?? "");
						const subject = String(e.subject ?? "");
						// Tooltip: committer, email, time + operation hints. All
						// fields render as TEXT (React escaping) — no HTML sinks.
						const hasMeta = Boolean(e.name || e.email || e.date);
						const who = hasMeta ? `${e.name} <${e.email}> · ${e.date}\n` : "";
							const g = graphs[idx];
							const isHead = String(e.refs ?? "").includes("HEAD");
						return h("div", {
							key: `log:${e.hash ?? hash}`, className: "dgp-row dgp-histEntry", "data-clickable": "true",
							"data-active": currentHash === hash ? "true" : "false",
							title: `${who}${t("hist.rowTitle")}`,
							onClick: () => onShowCommit(hash, subject),
							onContextMenu: (ev) => { ev.preventDefault(); setLogMenu({ hash, subject, ...menuAt(ev.clientX, ev.clientY) }); }
						},
							// Graph column: one SVG tile per row (vertical stretch is fine for lines;
							// non-scaling-stroke keeps 1.5px). A separate square SVG viewport
							// draws the node with true circle geometry so it cannot become a squircle.
							h("div", { className: "dgp-logGraph", style: { width: graphW } },
								h("svg", { viewBox: `0 0 ${graphW} 100`, preserveAspectRatio: "none", "aria-hidden": "true" },
									g.segs.map((s, si) => h("path", {
										key: `sg${si}`, d: logGraphPath(s), fill: "none",
										style: { stroke: `var(--dsw-graph-c${s.color})` },
										"vector-effect": "non-scaling-stroke", "stroke-width": 1.5
									}))
								),
								h("svg", {
									className: "dgp-graphNode", viewBox: "0 0 14 14", "aria-hidden": "true",
									style: { left: 7 + g.dot * 13 }
								},
									isHead ? h("circle", { className: "dgp-graphHeadRing", cx: 7, cy: 7, r: 6.25, fill: "none", stroke: "var(--dsw-alias-state-business-primary)", "stroke-width": 1 }) : null,
									h("circle", { className: "dgp-graphHalo", cx: 7, cy: 7, r: 4.75, fill: "none", stroke: "var(--dsw-alias-bg-base)", "stroke-width": 2.5 }),
									h("circle", { className: "dgp-graphDot", cx: 7, cy: 7, r: 3.5, fill: `var(--dsw-graph-c${g.color})` })
								)
							),
							h("div", { className: "dgp-histBody" },
								h("div", { className: "dgp-logMain" },
									chip(hash.slice(0, 9)),
									e.refs ? h("span", { className: "dgp-chip dgp-logRefs", title: e.refs }, e.refs) : null,
									h("span", { className: "dgp-logSubject", title: subject }, subject),
									h("button", {
										type: "button", className: "dgp-logMenuBtn", title: t("hist.menuTitle"),
										onClick: (ev) => { ev.stopPropagation(); const r = ev.currentTarget.getBoundingClientRect(); setLogMenu({ hash, subject, ...menuAt(r.right, r.bottom + 4) }); }
									}, h(IconEllipsis, { size: 14 }))
								),
							hasMeta ? h("div", { className: "dgp-logMeta" },
									h("span", { className: "dgp-logAuthor" }, e.name),
									h("span", { className: "dgp-logEmail" }, `<${e.email}>`),
									h("span", { className: "dgp-logDate" }, e.date)
								) : null
							)
						);
					}))
				),
				logMenu ? portal(h("div", { className: "dgp-logMenu", "data-flip": logMenu.flip ? "true" : undefined, style: { top: logMenu.y, left: logMenu.x }, onClick: (e) => e.stopPropagation() },
					h("button", { type: "button", className: "dgp-logMenuItem", onClick: () => { onShowCommit(logMenu.hash, logMenu.subject); setLogMenu(null); } }, h(IconCode, { size: 13 }), t("hist.view")),
					h("button", { type: "button", className: "dgp-logMenuItem", onClick: () => {
						setConfirm({
							title: t("hist.revertTitle", { hash: logMenu.hash.slice(0, 7) }),
							message: t("hist.revertMsg", { hash: logMenu.hash, subject: logMenu.subject }),
							confirmLabel: t("hist.revertConfirm"),
							danger: false,
							onConfirm: () => runOp("op.revert", () => gitRpc("revert", { repo: cwd, target: logMenu.hash }))
						});
						setLogMenu(null);
					} }, h(IconRefresh, { size: 13 }), t("hist.revert")),
					h("button", { type: "button", className: "dgp-logMenuItem", onClick: () => {
						setConfirm({
							title: t("hist.resetSoftTitle", { hash: logMenu.hash.slice(0, 7) }),
							message: t("hist.resetSoftMsg", { hash: logMenu.hash.slice(0, 7), subject: logMenu.subject }),
							confirmLabel: t("hist.resetSoftConfirm"),
							danger: false,
							onConfirm: () => runOp("op.reset", () => gitRpc("reset", { repo: cwd, target: logMenu.hash, mode: "soft" }))
						});
						setLogMenu(null);
					} }, h(IconBranchOp, { size: 13 }), t("hist.resetSoft")),
					h("button", { type: "button", className: "dgp-logMenuItem", "data-danger": "true", onClick: () => {
						setConfirm({
							title: t("hist.resetHardTitle", { hash: logMenu.hash.slice(0, 7) }),
							message: t("hist.resetHardMsg", { hash: logMenu.hash.slice(0, 7), subject: logMenu.subject }),
							confirmLabel: t("hist.resetHardConfirm"),
							danger: true,
							onConfirm: () => runOp("op.reset", () => gitRpc("reset", { repo: cwd, target: logMenu.hash, mode: "hard" }))
						});
						setLogMenu(null);
					} }, h(IconWarning, { size: 13 }), t("hist.resetHard"))
				), document.querySelector(".dgp-root")) : null
			);
		});
		//#endregion

		//#region gitview
		// ── Branch selector in the shared header's Git context ─────────────────
		function BranchSelector({ git, showLabel = false }) {
			const [branchOpen, setBranchOpen] = useState(false);
			const [branchQuery, setBranchQuery] = useState("");
			const [branchSel, setBranchSel] = useState(null);   // branch row being acted on
			const [branchInput, setBranchInput] = useState(null); // {mode:"new"|"rename", value}
			const t = useT();
			const closeBranch = useCallback(() => { setBranchOpen(false); setBranchSel(null); setBranchInput(null); setBranchQuery(""); }, []);

			// Suspending the panel (manual button or auto mouse-out) must close
			// the popup: it is portaled under .dgp-root, so the dialog's
			// slide-out transform never moves it — without this reset it keeps
			// floating over the main UI while suspended, and the hidden root's
			// pointer-events:none makes it unclosable until the panel restores.
			const panelHidden = useSyncExternalStore(subscribeHidden, getHidden);
			useEffect(() => { if (panelHidden) closeBranch(); }, [panelHidden, closeBranch]);

			// Esc closes the branch popup (stopPropagation so the panel-level Esc
			// handler that closes the whole overlay doesn't fire at the same time).
			useEffect(() => {
				if (!branchOpen) return;
				const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); closeBranch(); } };
				document.addEventListener("keydown", onKey, true);
				return () => document.removeEventListener("keydown", onKey, true);
			}, [branchOpen, closeBranch]);
			// Click-outside closes: the popup itself and the chevron button stop
			// propagation, so any click that bubbles to document happened
			// outside → close (same pattern as the history context menu).
			useEffect(() => {
				if (!branchOpen) return;
				const onClick = () => closeBranch();
				document.addEventListener("click", onClick);
				return () => document.removeEventListener("click", onClick);
			}, [branchOpen, closeBranch]);
			// The branch list is portaled to the panel root (outside the dialog
			// content) so its backdrop-filter renders, and positioned in fixed
			// viewport coordinates taken from the chevron button. While open, the
			// wheel is locked everywhere in the panel except inside the popup, so
			// scrolling cannot pass through to the content beneath it.
			const [branchPos, setBranchPos] = useState(null);
			useEffect(() => {
				if (!branchOpen) return;
				const onWheel = (e) => {
					if (e.target.closest(".dgp-branchPop")) return;
					if (e.target.closest(".dgp-root")) e.preventDefault();
				};
				document.addEventListener("wheel", onWheel, { passive: false });
				return () => document.removeEventListener("wheel", onWheel);
			}, [branchOpen]);

			const allBranches = git.branches ?? [];
			const locals = allBranches.filter((b) => !b.remote);
			const remotes = allBranches.filter((b) => b.remote);
			const q = branchQuery.trim().toLowerCase();
			// Current branch first, then locals, then remotes (each name-sorted).
			const sortedBranches = (list) => [...list].sort((a, b) => {
				if (!!a.current !== !!b.current) return a.current ? -1 : 1;
				if (!!a.remote !== !!b.remote) return a.remote ? 1 : -1;
				return a.name.localeCompare(b.name);
			});
			const visibleBranches = q ? sortedBranches(allBranches.filter((b) => b.name.toLowerCase().includes(q))) : sortedBranches(allBranches);

			const runBranchAction = async (fn) => {
				closeBranch();
				await fn();
			};

			const branchRow = (b) => {
				const selected = branchSel?.name === b.name;
				const displayName = b.remote ? b.name.slice("origin/".length) : b.name;
				return h("div", { key: b.name, className: "dgp-row", "data-clickable": "true", "data-selected": selected ? "true" : "false", "data-muted": b.remote ? "true" : "false", "data-current": b.current ? "true" : "false", onClick: () => setBranchSel(b) },
					h("span", { className: "dgp-badge", "data-tone": b.current ? "success" : (b.remote ? "remote" : "info") }, b.current ? t("branch.current") : (b.remote ? t("branch.remote") : t("branch.local"))),
					h("span", { className: "dgp-rowPath", title: b.name }, displayName),
					b.upstream ? h("span", { className: "dgp-rowMeta", title: t("branch.upstream", { name: b.upstream }) }, b.upstream) : null,
					b.sha ? h("span", { className: "dgp-rowMeta" }, b.sha) : null
				);
			};

			const displayNameOf = (b) => b.remote ? b.name.slice("origin/".length) : b.name;

			// Per-branch action bar (icon + text, by common-use priority).
			const branchActions = branchSel ? h("div", { className: "dgp-branchActions" },
				h("div", { className: "dgp-sectionTitle", style: { marginBottom: 6 } }, t("branch.title", { name: branchSel.name })),
				h("div", { className: "dgp-actions", style: { flexWrap: "wrap" } },
					btn(t("branch.checkout"), () => runBranchAction(() => git.checkoutBranch(branchSel.remote ? branchSel.name.slice("origin/".length) : branchSel.name)), { disabled: git.busy !== null || branchSel.current, variant: "primary", icon: h(IconBranchOp, { size: 14 }), title: branchSel.current ? t("branch.currentTitle") : t("branch.checkoutTitle") }),
					btn(t("branch.merge"), () => runBranchAction(() => git.mergeBranch(branchSel.name)), { disabled: git.busy !== null || branchSel.current, icon: h(IconRightUp, { size: 14 }), title: branchSel.current ? t("branch.mergeCurrent") : t("branch.mergeTitle") }),
					btn(t("branch.new"), () => { setBranchInput({ mode: "new", value: "" }); }, { disabled: git.busy !== null, icon: h(IconPlus, { size: 14 }), title: t("branch.newTitle") }),
					btn(t("branch.update"), () => runBranchAction(() => git.updateBranch(branchSel.name)), { disabled: git.busy !== null || branchSel.remote, icon: h(IconDownload, { size: 14 }), title: branchSel.remote ? t("branch.remoteNoUpdate") : t("branch.updateTitle") }),
					btn(t("branch.rename"), () => { setBranchInput({ mode: "rename", value: branchSel.remote ? "" : displayNameOf(branchSel) }); }, { disabled: git.busy !== null || branchSel.remote, icon: h(IconEdit, { size: 14 }), title: branchSel.remote ? t("branch.remoteNoRename") : t("branch.renameTitle") })
				),
				branchInput ? h("div", { className: "dgp-branchInput" },
					h("input", { className: "dgp-textarea", style: { height: 34, padding: "0 10px" }, placeholder: branchInput.mode === "new" ? t("branch.newName") : t("branch.newRename"), value: branchInput.value, onChange: (e) => setBranchInput((bi) => ({ ...bi, value: e.target.value })), onKeyDown: (e) => { if (e.key === "Enter" && branchInput.value.trim()) submitBranchInput(); if (e.key === "Escape") setBranchInput(null); } }),
					h("span", { style: { flex: 1 } }),
					lbtn(t("common.cancel"), () => setBranchInput(null)),
					lbtn(t("common.ok"), () => submitBranchInput())
				) : null
			) : null;

			const submitBranchInput = () => {
				const name = (branchInput?.value ?? "").trim();
				if (!name) return;
				if (branchInput.mode === "new") {
					const start = branchSel?.name ?? "";
					runBranchAction(() => git.checkoutBranch(name, { create: true, start }));
				} else if (branchInput.mode === "rename" && branchSel) {
					const target = branchSel.name;
					runBranchAction(() => git.renameBranch(target, name));
				}
			};

			return h("div", { className: "dgp-branchTab", "data-open": branchOpen ? "true" : "false" },
				h("button", {
					type: "button",
					className: showLabel ? "dgp-branchSelect" : "dgp-tabArrow",
					title: (showLabel ? (git.status?.branch || "") + "\n" : "") + t("branch.arrowTitle", { l: locals.length, r: remotes.length }),
					"aria-label": t("branch.arrowTitle", { l: locals.length, r: remotes.length }), "aria-haspopup": "dialog", "aria-expanded": branchOpen,
					onClick: (e) => {
						e.stopPropagation();
						if (!branchOpen) {
							const r = e.currentTarget.getBoundingClientRect();
							setBranchPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4) });
						}
						setBranchOpen((o) => !o);
					},
					"data-open": branchOpen ? "true" : "false"
				}, showLabel ? h(React.Fragment, null, h(IconBranch, { size: 14 }), h("span", { className: "dgp-toolbarTitle" }, git.status?.branch || "…")) : null, h(IconChevronDown, { size: 12 })),
				branchOpen && branchPos ? portal(h("div", { className: "dgp-branchPop", role: "dialog", "aria-label": t("branch.popTitle", { l: locals.length, r: remotes.length }), style: { left: branchPos.left, top: branchPos.top }, onClick: (e) => e.stopPropagation() },
					h("div", { className: "dgp-branchPopHead" }, t("branch.popTitle", { l: locals.length, r: remotes.length })),
					h("input", { className: "dgp-branchSearch", placeholder: t("branch.search"), value: branchQuery, onChange: (e) => setBranchQuery(e.target.value) }),
					h("div", { className: "dgp-branchList" },
						visibleBranches.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("branch.noMatch")) : visibleBranches.map(branchRow)
					),
					branchActions,
					h("div", { className: "dgp-branchPopFoot" }, lbtn(t("common.close"), () => closeBranch()))
				), document.querySelector(".dgp-root")) : null
			);
		}

		// ── confirmation dialog for dangerous operations ───────────────────────
		function ConfirmDialog({ spec, onClose }) {
			const t = useT();
			const dialogRef = useRef(null);
			useEffect(() => {
				if (!spec) return;
				const previous = document.activeElement;
				dialogRef.current?.querySelector("button:not(:disabled)")?.focus();
				return () => { if (previous?.isConnected) previous.focus(); };
			}, [spec]);
			if (!spec) return null;
			const keys = (e) => {
				if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); }
				if (e.key !== "Tab") return;
				e.stopPropagation();
				const buttons = [...(dialogRef.current?.querySelectorAll("button:not(:disabled)") ?? [])];
				const first = buttons[0], last = buttons[buttons.length - 1];
				if (!first) { e.preventDefault(); return; }
				if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
				else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
			};
			return h("div", { className: "dgp-confirm", ref: dialogRef, onClick: onClose, role: "dialog", "aria-modal": "true", "aria-label": spec.title, onKeyDown: keys },
				h("div", { className: "dgp-confirmCard", onClick: (e) => e.stopPropagation() },
					h("div", { className: "dgp-confirmTitle", "data-danger": spec.danger ? "true" : "false" },
						spec.danger ? h(IconWarning, { size: 15 }) : h(IconBranchOp, { size: 15 }),
						spec.title),
					spec.message ? h("div", { className: "dgp-confirmMsg" }, spec.message) : null,
					h("div", { className: "dgp-confirmActions" },
						spec.dismissOnly ? btn(t("common.close"), onClose) : h(React.Fragment, null, btn(t("common.cancel"), onClose),
						btn(spec.confirmLabel || t("common.ok"), () => { const fn = spec.onConfirm; onClose(); fn(); }, { variant: spec.danger ? "dangerFill" : "primary" }))
					)
				)
			);
		}

		// ── Git tab ──────────────────────────────────────────────────────────────
		function GitView({ git, headerHost, pageNavigation }) {
			const busyOn = (label) => git.busy === label || git.busy === "op.refresh";
			const s = git.status;
			const t = useT();
			// Narrow viewport: the work area collapses to one screen at a time —
			// changes list, or the full-width diff (DiffPane's 关闭 acts as back).
			const narrow = useNarrow();

			// Confirmation dialog for dangerous ops: {title, message, confirmLabel, danger, onConfirm}
			const [confirm, setConfirm] = useState(null);

			// Working-tree diff split: left (changes) : right (diff), default 3:7.
			// Dragging the gutter overrides; double-click restores the default.
			const [diffFrac, setDiffFrac] = useState(null);
			const diffRef = useRef(null);
			const onDiffGutterDown = useCallback((e) => {
				e.preventDefault();
				const el = diffRef.current;
				if (!el) return;
				const move = (ev) => {
					const rect = el.getBoundingClientRect();
					if (rect.width <= 0) return;
					let f = (ev.clientX - rect.left) / rect.width;
					f = Math.max(0.08, Math.min(0.7, f));   // clamp 8%–70%
					setDiffFrac(f);
				};
				const up = () => {
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", up);
					window.removeEventListener("pointercancel", up);
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
				// pointercancel: the browser took the pointer mid-drag — clean up
				// so the window listeners never leak until the next drag.
				window.addEventListener("pointercancel", up);
			}, []);
			const resetDiffSplit = useCallback(() => setDiffFrac(null), []);
			const diffShare = diffFrac ?? 0.3;

			const pull = () => git.runOp("op.pull", () => gitRpc("pull", { repo: git.cwd, rebase: git.rebase || undefined }));
			const push = (force = false) => {
				const doPush = () => git.runOp("op.push", () => gitRpc("push", { repo: git.cwd, force: force || undefined }));
				if (force) setConfirm({ title: t("gv.forceTitle2"), message: t("gv.forceMsg", { upstream: s?.upstream ? t("gv.forceUpstream", { name: s.upstream }) : "" }), confirmLabel: t("gv.forceConfirm"), danger: true, onConfirm: doPush });
				else doPush();
			};
			const repoInfo = () => setConfirm({ title: t("gv.repoInfo"), dismissOnly: true, message: h("div", { className: "dgp-repoInfoRows" },
				[[t("gv.upstreamLabel"), s?.upstream || "—"], [t("gv.remoteLabel"), git.gitConfig?.remote || "—"], [t("gv.identityLabel"), git.gitConfig?.name || git.gitConfig?.email ? `${git.gitConfig.name ?? ""} <${git.gitConfig.email ?? ""}>`.trim() : t("gv.noIdentity")]].map(([label, value]) => h("div", { key: label, className: "dgp-repoInfoRow" }, h("span", { className: "dgp-repoInfoLabel" }, label), h("span", { className: "dgp-repoInfoValue" }, value)))) });
			const repoMenu = h(ToolbarMenu, { label: t("gv.repoActions"), items: [
				narrow ? { label: t("gv.pull"), icon: IconRefresh, disabled: git.busy !== null || !s, run: pull } : null,
				narrow ? { label: t("gv.push"), icon: IconSend, disabled: git.busy !== null || !s, run: () => push() } : null,
				{ label: busyOn("op.fetch") ? t("gv.fetchBusy") : t("gv.fetch"), icon: IconDownload, disabled: git.busy !== null || !s, run: () => git.runOp("op.fetch", () => gitRpc("fetch", { repo: git.cwd })) },
				{ label: t("gv.rebase"), icon: IconBranch, checked: git.rebase, disabled: git.busy !== null, run: () => git.setRebase(!git.rebase) },
				{ label: t("gv.forceAction"), icon: IconWarning, disabled: git.busy !== null || !s, danger: true, run: () => push(true) },
				{ label: t("gv.repoInfo"), icon: IconInfo, run: repoInfo }
			].filter(Boolean) });
			const toolbar = h("div", { className: "dgp-pageToolbar dgp-gitToolbar" },
				pageNavigation ? h("span", { className: "dgp-toolbarDivider", "aria-hidden": "true" }) : null,
				pageNavigation,
				h("div", { className: "dgp-gitContext" }, h(BranchSelector, { git, showLabel: true }),
					s ? h("span", { className: "dgp-changeCount" }, t("git.changes", { count: git.allPaths.length })) : null,
					s?.ahead > 0 ? chip(t("gv.ahead", { count: s.ahead }), "primary") : null,
					s?.behind > 0 ? chip(t("gv.behind", { count: s.behind }), "warn") : null),
				h("div", { className: "dgp-pageActions" }, !narrow ? h(React.Fragment, null,
					lbtn(busyOn("op.pull") ? t("gv.pullBusy") : t("gv.pull"), pull, { disabled: git.busy !== null || !s, icon: h(IconRefresh, { size: 14 }) }),
					lbtn(busyOn("op.push") ? t("gv.pushBusy") : t("gv.push"), () => push(), { disabled: git.busy !== null || !s, icon: h(IconSend, { size: 14 }) })) : null, repoMenu));
			const opOutput = git.op ? h("div", { className: "dgp-op", "data-status": git.op.status },
						h("div", { className: "dgp-opHead" },
							h("span", { className: "dgp-opIcon", "data-status": git.op.status },
								git.op.status === "running" ? h(IconLoading, { size: 14 })
									: git.op.status === "success" ? h(IconCheckOk, { size: 14 })
									: h(IconWarning, { size: 14 })
							),
							h("span", { className: "dgp-opTitle" },
								t(git.op.status === "running" ? "gv.opRunning" : git.op.status === "success" ? "gv.opSuccess" : "gv.opFailed", { label: t(git.op.label) })),
							h("span", { style: { flex: 1 } }),
							h("button", { type: "button", className: "dgp-opClose", title: t("gv.opClose"), "aria-label": t("gv.opCloseAria"), onClick: () => git.setOp(null) }, h(IconClose, { size: 12 }))
						),
						git.op.status === "running" ? h("div", { className: "dgp-progress" }, h("div", { className: "dgp-progressBar" })) : null,
						git.op.detail ? h("pre", { className: "dgp-opDetail" }, git.op.detail) : null
					) : null;
			return h(React.Fragment, null,
				inPanelHeader(headerHost, git.commitDetail ? null : toolbar),
				// Keep the work tree mounted behind history details, preserving
				// the draft and editor. Empty and selected-diff states share a split.
				h("div", { className: "dgp-gitWork", hidden: !!git.commitDetail, "data-diff": git.diff ? "true" : "false", ref: narrow ? undefined : diffRef, style: !narrow ? { gridTemplateColumns: `minmax(240px,${diffShare.toFixed(3)}fr) 8px minmax(0,${(1 - diffShare).toFixed(3)}fr)` } : undefined },
					// The left column owns changes, history and the bottom draft.
					// Hiding it on narrow screens preserves the draft.
					h("div", { className: "dgp-gitCol", hidden: narrow && !!git.diff },
						s ? h(ChangeList, {
							status: s, allPaths: git.allPaths, selected: git.selected, busy: git.busy,
							onShowDiff: git.showDiff, onShowNewFile: git.showNewFile, onTogglePath: git.togglePath,
							onStage: git.stagePath, onUnstage: git.unstagePath, onUntrack: git.untrackPath, onIgnore: git.ignorePath,
							onSelectAll: git.selectAll, onClearAll: git.clearAll
						}) : h("div", { className: "dgp-empty dgp-gitGrow" }, t("common.loading")),
						s ? h("div", { className: "dgp-gitState" },
							s.conflicts?.length > 0 ? chip(t("gv.conflicts", { count: s.conflicts.length }), "error") : null,
							git.busy !== null || git.readBusy !== null ? h("span", { className: "dgp-hint" }, t("gv.busy", { op: t(git.busy ?? git.readBusy) })) : null) : null,
						opOutput,
						git.log?.lines?.length > 0 ? h(HistoryBlock, { log: git.log, currentHash: null, onShowCommit: git.showCommit, setConfirm, runOp: git.runOp, cwd: git.cwd }) : null,
						h(CommitBox, { busy: git.busy, commitWith: git.commitWith, hasRepo: !!s })
					),
					// right pane: working-tree diff preview, split by a draggable
					// gutter (default left 3 : right 7; double-click resets).
					// Narrow: the diff takes the full width — no gutter, and its
					// 关闭 button is the way back to the changes list.
					narrow ? null : h("div", { className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onDiffGutterDown, onDoubleClick: resetDiffSplit }),
					git.diff ? h(DiffPane, { diff: git.diff, onShowDiff: git.showDiff, onClose: () => git.setDiff(null) }) : !narrow ? h("div", { className: "dgp-diffEmpty" }, h(IconCode, { size: 28 }), h("span", null, t("git.chooseFileHint"))) : null
				),
				git.commitDetail ? h(CommitDetailView, { commitDetail: git.commitDetail, onShowFile: git.showCommitFile, onClose: git.closeCommitDetail, headerHost, pageNavigation }) : null,
				git.error ? h("div", { className: "dgp-error" }, h("span", { style: { flex: 1 } }, git.error), lbtn(t("common.close"), () => git.setError(null), { tone: "default" })) : null,
				h(ConfirmDialog, { spec: confirm, onClose: () => setConfirm(null) })
			);
		}
		//#endregion

		//#region monaco
// ── Monaco editor (locally hosted by the sidecar; lazy; coexists with the
// CodeMirror CDN pipeline until the migration completes) ────────────────────
//
// Assets live in the plugin's `vendor/monaco/vs` tree and are served by the
// sidecar at `http://127.0.0.1:<port>/vendor/...` (direct mode only — a
// non-loopback page has no route to the sidecar and simply keeps using the
// legacy diff renderer). Everything loads on first use; a failed load is
// retryable on the next call.

let monacoPromise = null;
let monacoAssetBase = null;
let monacoWorkerFactory = null;
const monacoWorkerUrls = new Map();

// ── editor themes and font preferences ────────────────────────────────────────
// Theme definitions keep the Monaco syntax palette and settings preview in one
// source of truth. The selector stores a family; its light/dark variant follows DSH.
const MONACO_THEME_KEY = "dgp.monacoTheme";
const MONACO_FONT_KEY = "dgp.monacoFonts";
const THEME_EVENT = "dgp:monaco-theme";
const FONT_EVENT = "dgp:monaco-fonts";
let darkWatcherInstalled = false;

const MONACO_THEME_PRESETS = [
	{ id: "vs", labelKey: "set.themeVs", base: "vs", dark: false, pair: "vs-dark", colors: { bg: "#FFFFFF", fg: "#202124", comment: "#008000", keyword: "#0000FF", string: "#A31515", func: "#795E26", number: "#098658", type: "#267F99", accent: "#007ACC", selection: "#ADD6FF" } },
	{ id: "vs-dark", labelKey: "set.themeVsDark", base: "vs-dark", dark: true, pair: "vs", colors: { bg: "#1F1F1F", fg: "#D4D4D4", comment: "#6A9955", keyword: "#569CD6", string: "#CE9178", func: "#DCDCAA", number: "#B5CEA8", type: "#4EC9B0", accent: "#007ACC", selection: "#264F78" } },
	{ id: "hc-light", labelKey: "set.themeHcLight", base: "hc-light", dark: false, highContrast: true, pair: "hc-black", colors: { bg: "#FFFFFF", fg: "#000000", comment: "#4B4B4B", keyword: "#99005F", string: "#0B6F4B", func: "#0000D1", number: "#A33E00", type: "#005A9C", accent: "#0000D1", selection: "#B3D7FF" } },
	{ id: "hc-black", labelKey: "set.themeHcBlack", base: "hc-black", dark: true, highContrast: true, pair: "hc-light", colors: { bg: "#000000", fg: "#FFFFFF", comment: "#A0A0A0", keyword: "#E07BE0", string: "#7EE787", func: "#6CB6FF", number: "#FFB867", type: "#79C0FF", accent: "#6CB6FF", selection: "#264F78" } },
	{ id: "github-light", labelKey: "set.themeGithubLight", base: "vs", dark: false, pair: "github-dark", colors: { bg: "#FFFFFF", fg: "#1F2328", comment: "#6E7781", keyword: "#CF222E", string: "#0A3069", func: "#8250DF", number: "#0550AE", type: "#953800", accent: "#0969DA", selection: "#DDF4FF" } },
	{ id: "github-dark", labelKey: "set.themeGithubDark", base: "vs-dark", dark: true, pair: "github-light", colors: { bg: "#0D1117", fg: "#E6EDF3", comment: "#8B949E", keyword: "#FF7B72", string: "#A5D6FF", func: "#D2A8FF", number: "#79C0FF", type: "#FFA657", accent: "#58A6FF", selection: "#1F3A5F" } },
	{ id: "one-light", labelKey: "set.themeOneLight", base: "vs", dark: false, pair: "one-dark", colors: { bg: "#FAFAFA", fg: "#383A42", comment: "#A0A1A7", keyword: "#A626A4", string: "#50A14F", func: "#4078F2", number: "#986801", type: "#C18401", accent: "#526FFF", selection: "#D7EAFF" } },
	{ id: "one-dark", labelKey: "set.themeOneDark", base: "vs-dark", dark: true, pair: "one-light", colors: { bg: "#282C34", fg: "#ABB2BF", comment: "#5C6370", keyword: "#C678DD", string: "#98C379", func: "#61AFEF", number: "#D19A66", type: "#E5C07B", accent: "#528BFF", selection: "#3E4451" } },
	{ id: "dracula", labelKey: "set.themeDracula", base: "vs-dark", dark: true, colors: { bg: "#282A36", fg: "#F8F8F2", comment: "#6272A4", keyword: "#FF79C6", string: "#F1FA8C", func: "#50FA7B", number: "#BD93F9", type: "#8BE9FD", accent: "#BD93F9", selection: "#44475A" } },
	{ id: "dracula-light", labelKey: "set.themeDraculaLight", base: "vs", dark: false, pair: "dracula", colors: { bg: "#F8F8F2", fg: "#282A36", comment: "#6272A4", keyword: "#D63384", string: "#607D00", func: "#1B8C50", number: "#7C3AED", type: "#007C91", accent: "#6B46C1", selection: "#E8DEF8" } },
	{ id: "monokai", labelKey: "set.themeMonokai", base: "vs-dark", dark: true, colors: { bg: "#272822", fg: "#F8F8F2", comment: "#75715E", keyword: "#F92672", string: "#E6DB74", func: "#A6E22E", number: "#AE81FF", type: "#66D9EF", accent: "#FD971F", selection: "#49483E" } },
	{ id: "monokai-light", labelKey: "set.themeMonokaiLight", base: "vs", dark: false, pair: "monokai", colors: { bg: "#FAF9F5", fg: "#272822", comment: "#8B8778", keyword: "#C2185B", string: "#8A6D00", func: "#5A7A00", number: "#7048A8", type: "#007F8B", accent: "#E07A00", selection: "#E9E3D1" } },
	{ id: "nord", labelKey: "set.themeNord", base: "vs-dark", dark: true, colors: { bg: "#2E3440", fg: "#D8DEE9", comment: "#616E88", keyword: "#81A1C1", string: "#A3BE8C", func: "#88C0D0", number: "#B48EAD", type: "#8FBCBB", accent: "#88C0D0", selection: "#434C5E" } },
	{ id: "nord-light", labelKey: "set.themeNordLight", base: "vs", dark: false, pair: "nord", colors: { bg: "#ECEFF4", fg: "#2E3440", comment: "#7B88A1", keyword: "#5E81AC", string: "#6F8F61", func: "#4C78A8", number: "#A05F8F", type: "#4E8D91", accent: "#5E81AC", selection: "#D8DEE9" } },
	{ id: "solarized-light", labelKey: "set.themeSolarizedLight", base: "vs", dark: false, pair: "solarized-dark", colors: { bg: "#FDF6E3", fg: "#657B83", comment: "#93A1A1", keyword: "#859900", string: "#2AA198", func: "#268BD2", number: "#D33682", type: "#B58900", accent: "#268BD2", selection: "#EEE8D5" } },
	{ id: "solarized-dark", labelKey: "set.themeSolarizedDark", base: "vs-dark", dark: true, pair: "solarized-light", colors: { bg: "#002B36", fg: "#839496", comment: "#586E75", keyword: "#859900", string: "#2AA198", func: "#268BD2", number: "#D33682", type: "#B58900", accent: "#268BD2", selection: "#073642" } },
	{ id: "gruvbox-light", labelKey: "set.themeGruvboxLight", base: "vs", dark: false, pair: "gruvbox-dark", colors: { bg: "#FBF1C7", fg: "#3C3836", comment: "#928374", keyword: "#AF3A03", string: "#79740E", func: "#427B58", number: "#8F3F71", type: "#076678", accent: "#076678", selection: "#EBDBB2" } },
	{ id: "gruvbox-dark", labelKey: "set.themeGruvboxDark", base: "vs-dark", dark: true, pair: "gruvbox-light", colors: { bg: "#282828", fg: "#EBDBB2", comment: "#928374", keyword: "#FB4934", string: "#B8BB26", func: "#FABD2F", number: "#D3869B", type: "#8EC07C", accent: "#83A598", selection: "#3C3836" } },
	{ id: "ayu-light", labelKey: "set.themeAyuLight", base: "vs", dark: false, pair: "ayu-dark", colors: { bg: "#FAFAFA", fg: "#5C6166", comment: "#ABB0B6", keyword: "#F29718", string: "#86B300", func: "#F2AE49", number: "#A37ACC", type: "#399EE6", accent: "#FF9940", selection: "#F2EED7" } },
	{ id: "ayu-dark", labelKey: "set.themeAyuDark", base: "vs-dark", dark: true, pair: "ayu-light", colors: { bg: "#0F1419", fg: "#BFBDB6", comment: "#5C6773", keyword: "#FF8F40", string: "#B8CC52", func: "#FFD173", number: "#D4BFFF", type: "#59C2FF", accent: "#FF8F40", selection: "#253340" } },
	{ id: "material-light", labelKey: "set.themeMaterialLight", base: "vs", dark: false, pair: "material-dark", colors: { bg: "#FAFAFA", fg: "#546E7A", comment: "#90A4AE", keyword: "#7C4DFF", string: "#91B859", func: "#6182B8", number: "#F76D47", type: "#39ADB5", accent: "#6182B8", selection: "#CFD8DC" } },
	{ id: "material-dark", labelKey: "set.themeMaterialDark", base: "vs-dark", dark: true, pair: "material-light", colors: { bg: "#263238", fg: "#EEFFFF", comment: "#546E7A", keyword: "#C792EA", string: "#C3E88D", func: "#82AAFF", number: "#F78C6C", type: "#FFCB6B", accent: "#89DDFF", selection: "#37474F" } },
	{ id: "tokyo-night", labelKey: "set.themeTokyoNight", base: "vs-dark", dark: true, pair: "tokyo-night-day", colors: { bg: "#1A1B26", fg: "#C0CAF5", comment: "#565F89", keyword: "#BB9AF7", string: "#9ECE6A", func: "#7AA2F7", number: "#FF9E64", type: "#2AC3DE", accent: "#7AA2F7", selection: "#283457" } },
	{ id: "tokyo-night-day", labelKey: "set.themeTokyoNightDay", base: "vs", dark: false, pair: "tokyo-night", colors: { bg: "#E1E2E7", fg: "#3760BF", comment: "#848CB5", keyword: "#9854F1", string: "#485E30", func: "#2E7DE9", number: "#965027", type: "#007197", accent: "#2E7DE9", selection: "#D0D5E3" } },
	{ id: "catppuccin-latte", labelKey: "set.themeCatppuccinLatte", base: "vs", dark: false, pair: "catppuccin-mocha", colors: { bg: "#EFF1F5", fg: "#4C4F69", comment: "#9CA0B0", keyword: "#8839EF", string: "#40A02B", func: "#1E66F5", number: "#FE640B", type: "#179299", accent: "#1E66F5", selection: "#CCD0DA" } },
	{ id: "catppuccin-mocha", labelKey: "set.themeCatppuccinMocha", base: "vs-dark", dark: true, pair: "catppuccin-latte", colors: { bg: "#1E1E2E", fg: "#CDD6F4", comment: "#6C7086", keyword: "#CBA6F7", string: "#A6E3A1", func: "#89B4FA", number: "#FAB387", type: "#94E2D5", accent: "#89B4FA", selection: "#45475A" } }
];
const MONACO_THEME_FAMILY_BY_PRESET = {
	vs: "vscode", "vs-dark": "vscode",
	"hc-light": "high-contrast", "hc-black": "high-contrast",
	"github-light": "github", "github-dark": "github",
	"one-light": "one", "one-dark": "one",
	dracula: "dracula", "dracula-light": "dracula",
	monokai: "monokai", "monokai-light": "monokai",
	nord: "nord", "nord-light": "nord",
	"solarized-light": "solarized", "solarized-dark": "solarized",
	"gruvbox-light": "gruvbox", "gruvbox-dark": "gruvbox",
	"ayu-light": "ayu", "ayu-dark": "ayu",
	"material-light": "material", "material-dark": "material",
	"tokyo-night": "tokyo-night", "tokyo-night-day": "tokyo-night",
	"catppuccin-latte": "catppuccin", "catppuccin-mocha": "catppuccin"
};
const MONACO_THEME_FAMILIES = [
	{ id: "vscode", labelKey: "set.themeFamilyVsCode" },
	{ id: "high-contrast", labelKey: "set.themeFamilyHighContrast" },
	{ id: "github", labelKey: "set.themeFamilyGithub" },
	{ id: "one", labelKey: "set.themeFamilyOne" },
	{ id: "dracula", labelKey: "set.themeFamilyDracula" },
	{ id: "monokai", labelKey: "set.themeFamilyMonokai" },
	{ id: "nord", labelKey: "set.themeFamilyNord" },
	{ id: "solarized", labelKey: "set.themeFamilySolarized" },
	{ id: "gruvbox", labelKey: "set.themeFamilyGruvbox" },
	{ id: "ayu", labelKey: "set.themeFamilyAyu" },
	{ id: "material", labelKey: "set.themeFamilyMaterial" },
	{ id: "tokyo-night", labelKey: "set.themeFamilyTokyoNight" },
	{ id: "catppuccin", labelKey: "set.themeFamilyCatppuccin" }
];
const MONACO_THEMES = ["auto", ...MONACO_THEME_FAMILIES.map((family) => family.id)];
const MONACO_THEME_OPTIONS = [
	{ id: "auto", labelKey: "set.themeAuto" },
	...MONACO_THEME_FAMILIES
];

const UI_FONT_STACKS = {
	system: "var(--dsw-font-family, system-ui, sans-serif)",
	inter: 'Inter, "Microsoft YaHei", system-ui, sans-serif',
	segoe: '"Segoe UI", "Microsoft YaHei", sans-serif',
	noto: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
	yahei: '"Microsoft YaHei", "Noto Sans SC", sans-serif'
};
const CODE_FONT_STACKS = {
	system: "var(--dsw-font-mono, ui-monospace, SFMono-Regular, Consolas, monospace)",
	cascadia: '"Cascadia Code", Consolas, monospace',
	cascadiaMono: '"Cascadia Mono", Consolas, monospace',
	consolas: 'Consolas, "Courier New", monospace',
	courier: '"Courier New", monospace'
};
const UI_FONT_OPTIONS = ["system", "inter", "segoe", "noto", "yahei"];
const CODE_FONT_OPTIONS = ["system", "cascadia", "cascadiaMono", "consolas", "courier"];
const LEGACY_CODE_FONT_ALIASES = { jetbrains: "cascadiaMono", fira: "consolas", source: "courier" };
const DEFAULT_UI_FONT_SIZE = 13;
const DEFAULT_PREVIEW_FONT_SIZE = 12;
let panelFontPrefs = null;

function normalizeFontSize(value, fallback, min, max) {
	if (value === null || value === undefined || value === "") return fallback;
	const size = Number(value);
	return Number.isFinite(size) ? Math.max(min, Math.min(max, Math.round(size))) : fallback;
}

function normalizePanelFontPrefs(saved = {}) {
	return {
		ui: Object.hasOwn(UI_FONT_STACKS, saved?.ui) ? saved.ui : "system",
		code: normalizeCodeFont(saved?.code),
		uiSize: normalizeFontSize(saved?.uiSize, DEFAULT_UI_FONT_SIZE, 10, 20),
		previewSize: normalizeFontSize(saved?.previewSize, DEFAULT_PREVIEW_FONT_SIZE, 8, 24)
	};
}

function normalizeCodeFont(id) {
	const normalized = LEGACY_CODE_FONT_ALIASES[id] ?? id;
	return Object.hasOwn(CODE_FONT_STACKS, normalized) ? normalized : "system";
}

function getPanelFontPrefs() {
	if (panelFontPrefs) return panelFontPrefs;
	try {
		const saved = JSON.parse(localStorage.getItem(MONACO_FONT_KEY) || "{}");
		panelFontPrefs = normalizePanelFontPrefs(saved);
	} catch { panelFontPrefs = normalizePanelFontPrefs(); }
	return panelFontPrefs;
}

function getPanelFontStyle() {
	const prefs = getPanelFontPrefs();
	return {
		"--dgp-font-ui": UI_FONT_STACKS[prefs.ui], "--dgp-font-mono": CODE_FONT_STACKS[prefs.code],
		"--dgp-ui-size": `${prefs.uiSize}px`, "--dgp-ui-scale": prefs.uiSize / DEFAULT_UI_FONT_SIZE,
		"--dgp-preview-size": `${prefs.previewSize}px`
	};
}

function updatePanelFontPrefs(patch) {
	const prefs = normalizePanelFontPrefs({ ...getPanelFontPrefs(), ...patch });
	panelFontPrefs = prefs;
	try { localStorage.setItem(MONACO_FONT_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
	const root = document.querySelector(".dgp-root");
	// Apply the requested values directly as well as persisting them. If browser
	// storage is unavailable, the current panel must still react immediately.
	if (root) {
		for (const [key, value] of Object.entries(getPanelFontStyle())) root.style.setProperty(key, String(value));
	}
	try { document.dispatchEvent(new CustomEvent(FONT_EVENT)); } catch { /* non-DOM */ }
	return prefs;
}

function setPanelFonts(ui, code) {
	return updatePanelFontPrefs({ ui, code });
}

function setPanelFontSizes(uiSize, previewSize) {
	return updatePanelFontPrefs({ uiSize, previewSize });
}

function subscribePanelFonts(listener) {
	document.addEventListener(FONT_EVENT, listener);
	return () => document.removeEventListener(FONT_EVENT, listener);
}

const getUiFontSize = () => getPanelFontPrefs().uiSize;

function monacoFontOptions() {
	const fontSize = getPanelFontPrefs().previewSize;
	return { fontFamily: resolveMonacoFontFamily(), fontSize, lineHeight: Math.round(fontSize * 1.65) };
}

function resolveMonacoFontFamily() {
	const prefs = getPanelFontPrefs();
	if (prefs.code !== "system") return CODE_FONT_STACKS[prefs.code];
	try {
		const hostFont = getComputedStyle(document.body).getPropertyValue("--dsw-font-mono").trim();
		if (hostFont) return hostFont;
	} catch { /* use fallback */ }
	return 'ui-monospace, "SFMono-Regular", Consolas, monospace';
}

function isDshDark() {
	try { return typeof document !== "undefined" && document.body?.hasAttribute("data-ds-dark-theme"); } catch { return true; }
}

// ── theme-aware diff palette ──────────────────────────────────────────────────
const DIFF_DEL_DARK = "#F0787E";
const DIFF_DEL_LIGHT = "#D84E58";
const DIFF_ADD_DARK = "#76A8F7";
const DIFF_ADD_LIGHT = "#3975D6";

function makeThemeRules(colors) {
	const token = (name, property, extra = {}) => ({ token: name, foreground: colors[property].slice(1), ...extra });
	return [
		token("comment", "comment", { fontStyle: "italic" }),
		token("keyword", "keyword"), token("string", "string"), token("number", "number"),
		token("type.identifier", "type"), token("function", "func"), token("delimiter", "fg"),
		{ token: "identifier", foreground: colors.fg.slice(1) }
	];
}

function makeDiffTheme(preset) {
	const { base, dark, highContrast, colors } = preset;
	const added = dark ? DIFF_ADD_DARK : DIFF_ADD_LIGHT;
	const removed = dark ? DIFF_DEL_DARK : DIFF_DEL_LIGHT;
	const lineAlpha = highContrast ? "24" : dark ? "14" : "0A";
	const textAlpha = highContrast ? "3E" : dark ? "26" : "1C";
	const gutterAlpha = dark ? "18" : "12";
	const transparent = "#00000000";
	return {
		base, inherit: true, rules: makeThemeRules(colors),
		colors: {
			"editor.background": colors.bg,
			"editor.foreground": colors.fg,
			"editorGutter.background": colors.bg,
			"editorLineNumber.foreground": colors.comment,
			"editorLineNumber.activeForeground": colors.fg,
			"editorCursor.foreground": colors.accent,
			"editor.selectionBackground": colors.selection,
			"editor.inactiveSelectionBackground": `${colors.selection}99`,
			"diffEditor.insertedLineBackground": `${added}${lineAlpha}`,
			"diffEditor.removedLineBackground": `${removed}${lineAlpha}`,
			"diffEditor.insertedTextBackground": `${added}${textAlpha}`,
			"diffEditor.removedTextBackground": `${removed}${textAlpha}`,
			"diffEditorGutter.insertedLineBackground": `${added}${gutterAlpha}`,
			"diffEditorGutter.removedLineBackground": `${removed}${gutterAlpha}`,
			"diffEditor.insertedLineBorder": transparent,
			"diffEditor.removedLineBorder": transparent,
			"diffEditor.insertedTextBorder": transparent,
			"diffEditor.removedTextBorder": transparent
		}
	};
}

/** Register derived themes (called once per Monaco load). */
function defineDshThemes(monaco) {
	for (const preset of MONACO_THEME_PRESETS) monaco.editor.defineTheme(`dsh-${preset.id}`, makeDiffTheme(preset));
	const dark = { ...MONACO_THEME_PRESETS[0], id: "dark", base: "vs-dark", dark: true, colors: MONACO_THEME_PRESETS[1].colors };
	const light = { ...MONACO_THEME_PRESETS[0], id: "light", colors: MONACO_THEME_PRESETS[0].colors };
	monaco.editor.defineTheme("dsh-dark", makeDiffTheme(dark));
	monaco.editor.defineTheme("dsh-light", makeDiffTheme(light));
}

function resolveMonacoTheme() {
	const pref = getMonacoThemePref();
	const family = pref === "auto" ? "vscode" : pref;
	const dark = isDshDark();
	const preset = MONACO_THEME_PRESETS.find((theme) =>
		MONACO_THEME_FAMILY_BY_PRESET[theme.id] === family && theme.dark === dark);
	return `dsh-${preset?.id ?? (dark ? "vs-dark" : "vs")}`;
}

function setMonacoTheme(pref) {
	const safePref = MONACO_THEMES.includes(pref) ? pref : MONACO_THEME_FAMILY_BY_PRESET[pref] ?? "auto";
	try { localStorage.setItem(MONACO_THEME_KEY, safePref); } catch { /* ignore */ }
	if (window.monaco?.editor) window.monaco.editor.setTheme(resolveMonacoTheme());
	try { document.dispatchEvent(new CustomEvent(THEME_EVENT)); } catch { /* non-DOM */ }
}

function getMonacoThemePref() {
	try {
		const pref = localStorage.getItem(MONACO_THEME_KEY);
		if (MONACO_THEMES.includes(pref)) return pref;
		return MONACO_THEME_FAMILY_BY_PRESET[pref] ?? "auto";
	} catch { return "auto"; }
}

function installDarkModeWatcher(monaco) {
	if (darkWatcherInstalled || typeof MutationObserver === "undefined" || !document.body) return;
	darkWatcherInstalled = true;
	new MutationObserver(() => {
		monaco.editor.setTheme(resolveMonacoTheme());
	}).observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
}

/**
 * Monaco workers load their standalone entry through a same-origin blob URL.
 * The sidecar can idle-exit and restart on a new port
 * while this page stays alive, so repoint new workers whenever bootstrap has
 * refreshed the sidecar info. Keep prior blob URLs alive: an existing editor
 * may still have a worker starting from one of them.
 */
function configureMonacoAssets(base) {
	// editor.main installs its own getWorker on load, which takes precedence
	// over legacy getWorkerUrl. Restore our factory after core load too.
	if (monacoAssetBase === base && self.MonacoEnvironment?.getWorker === monacoWorkerFactory) return;
	monacoWorkerFactory = (_moduleId, label) => {
		const kind = label === "javascript" ? "typescript"
			: label === "scss" || label === "less" ? "css"
				: label === "handlebars" || label === "razor" ? "html" : label;
		const entry = Object.hasOwn(MONACO_WORKER_ENTRIES, kind) ? MONACO_WORKER_ENTRIES[kind] : MONACO_WORKER_ENTRIES.editor;
		const workerUrl = `${base}/${entry}`;
		if (!monacoWorkerUrls.has(workerUrl)) {
			monacoWorkerUrls.set(workerUrl, URL.createObjectURL(new Blob([
				"const ttPolicy = globalThis.trustedTypes?.createPolicy('defaultWorkerFactory', { createScriptURL: value => value });\n",
				"globalThis.workerttPolicy = ttPolicy;\n",
				`importScripts(ttPolicy?.createScriptURL(${JSON.stringify(workerUrl)}) ?? ${JSON.stringify(workerUrl)});\n`,
				"globalThis.postMessage({ type: 'vscode-worker-ready' });"
			], { type: "application/javascript" })));
		}
		return new Worker(monacoWorkerUrls.get(workerUrl));
	};
	self.MonacoEnvironment = {
		...(self.MonacoEnvironment ?? {}),
		getWorker: monacoWorkerFactory
	};
	monacoAssetBase = base;
	window.require?.config?.({ paths: { vs: base } });
}

/**
 * Load and configure Monaco once. Resolves to the `monaco` namespace or
 * rejects (callers must fall back). Worker strategy: the sidecar is a
 * DIFFERENT origin than the DSH web UI, and cross-origin `new Worker(url)`
 * is blocked — the classic workaround applies: hand Monaco a blob URL whose
 * script importScripts() the real cross-origin worker main.
 */
async function ensureMonaco() {
	const info = await bootstrapServiceInfo();
	if (!info) throw new Error("monaco unavailable: no direct sidecar connection");
	const base = `http://127.0.0.1:${info.port}/vendor/monaco/vs`;
	if (!monacoPromise) {
		monacoPromise = (async () => {
		// 1) AMD loader (idempotent enough: one panel, one load).
		if (!window.require?.config) {
			await new Promise((res, rej) => {
				const s = document.createElement("script");
				const finish = (error) => {
					clearTimeout(timer); s.onload = null; s.onerror = null;
					if (error) rej(error); else res();
				};
				const timer = setTimeout(() => finish(new Error("monaco loader.js timed out")), 30000);
				s.src = `${base}/loader.js`;
				s.onload = () => finish();
				s.onerror = () => finish(new Error("monaco loader.js failed to load"));
				document.head.appendChild(s);
			});
		}
		const req = window.require;
		if (!req?.config) throw new Error("monaco AMD loader missing");
		// 2) Point Monaco and its workers at this sidecar instance. The port
		// can change after the sidecar's idle exit; ensureMonaco re-runs this
		// configuration against refreshed service info on later editor mounts.
		configureMonacoAssets(base);
		// 3) Core (workers/language chunks are pulled on demand from `vs`).
		await new Promise((res, rej) => {
			// The AMD loader's errback only hands us an opaque Event. Capture
			// resource-level script failures in the load window (capture phase
			// 'error' events carry the failing element) so the rejection names
			// the exact URL instead of "[object Event]".
			const failed = [];
			const onResErr = (ev) => {
				const tag = ev?.target;
				if (tag && tag.tagName === "SCRIPT" && tag.src) {
					const src = String(tag.src);
					if (src.includes("/vendor/monaco/") && !failed.includes(src)) failed.push(src);
				}
			};
			document.addEventListener("error", onResErr, true);
			// A hung chunk must fail into the source/retry fallback instead of
			// leaving the preview/editor pending forever.
			const watchdog = setTimeout(() => {
				document.removeEventListener("error", onResErr, true);
				rej(new Error("monaco editor assets timed out"));
			}, 30000);
			const done = () => {
				clearTimeout(watchdog);
				document.removeEventListener("error", onResErr, true);
			};
			req(["vs/editor/editor.main"], () => {
				// editor.main only includes JSON, CSS, HTML, and TypeScript. Load
				// Monaco's lazy basic-language registry too, otherwise extensions
				// such as XML/Java/Python are resolved as plaintext and theme token
				// colors never appear in their previews.
				req(["vs/basic-languages/monaco.contribution"], () => {
					done();
					res();
				}, (error) => {
					done();
					rej(new Error(`monaco language contribution failed to load: ${String(error)}`));
				});
			}, (e) => {
				done();
				const detail = failed.length ? `failed scripts: ${failed.join(" | ")}` : `no script element reported (errback: ${String(e)})`;
				rej(new Error(`monaco editor.main load failed — ${detail}`));
			});
		});
		const monaco = window.monaco;
		if (!monaco?.editor) throw new Error("monaco namespace missing");
		// Register the derived DSH diff themes, then apply the persisted theme
		// right after load, and keep following DSH's light/dark switch while in
		// "auto" mode.
		defineDshThemes(monaco);
		monaco.editor.setTheme(resolveMonacoTheme());
		installDarkModeWatcher(monaco);
		return monaco;
		})();
		// A failed load must not cache the rejection forever (sidecar may have
		// been idle-exited and come back before the next attempt).
		monacoPromise.catch(() => { monacoPromise = null; });
	}
	const monaco = await monacoPromise;
	// A git RPC may have detected a stale sidecar and refreshed service-info
	// while Monaco was loading. Re-read the cached/current port before returning
	// so a worker never starts against the previous instance in that race.
	const current = await bootstrapServiceInfo();
	if (!current) throw new Error("monaco unavailable: sidecar info expired");
	configureMonacoAssets(`http://127.0.0.1:${current.port}/vendor/monaco/vs`);
	return monaco;
}

// Best-effort language id from a workspace-relative path (tokenizer only —
// language workers load on demand; unknown → plain text).
function monacoLanguageFor(path) {
	const monaco = window.monaco;
	if (!monaco?.languages || !path) return "plaintext";
	const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
	for (const lang of monaco.languages.getLanguages()) {
		if ((lang.extensions ?? []).some((e) => e.slice(1).toLowerCase() === ext)) return lang.id;
	}
	return "plaintext";
}

/**
 * Reconstruct { original, modified } document pair from a `git diff` unified
 * text so Monaco's own differ can render it. Returns null when the text is
 * not faithfully reconstructable (binary notes, truncated output, unknown
 * lines) — the caller then keeps the legacy renderer.
 */
function splitUnifiedDiff(text) {
	const lines = text.split("\n");
	// Drop the trailing empty element from the final newline (git output ends
	// with \n; the diff content itself never has a phantom last line).
	if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
	const orig = [];
	const mod = [];
	// Line numbers from @@ headers keep multi-file / multi-hunk order honest,
	// but sequential application is sufficient for well-formed input; we use
	// them only as a sanity signal (a rewind means misordered/partial input).
	let expectOld = -1;
	let expectNew = -1;
	for (const line of lines) {
		if (line.startsWith("@@ ")) {
			const m = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
			if (!m) return null;
			const o = parseInt(m[1], 10), n = parseInt(m[2], 10);
			if (expectOld !== -1 && (o < expectOld || n < expectNew)) return null;
			expectOld = o; expectNew = n;
			orig.push(line);
			mod.push(line);
		} else if (line.startsWith("diff --git")) {
			// New file: its hunks restart at line 1 (new files even at 0) —
			// reset the monotonic cursors so a later file after a modified one
			// is not misjudged as out-of-order.
			expectOld = -1;
			expectNew = -1;
		} else if (line.startsWith("index ") ||
			line.startsWith("--- ") || line.startsWith("+++ ") ||
			line.startsWith("new file") || line.startsWith("deleted file") ||
			line.startsWith("old mode") || line.startsWith("new mode") ||
			line.startsWith("rename ") || line.startsWith("similarity ") ||
			line.startsWith("copy from") || line.startsWith("copy to") ||
			line.startsWith("dissimilarity ")) {
			/* file-header meta lines (new/deleted/renamed files) — skip, the
			 * documents themselves reconstruct fine without them */
		} else if (line.startsWith("Binary files") || line.startsWith("GIT binary patch")) {
			return null; // binary payload: nothing to reconstruct
		} else if (line.startsWith("+")) {
			mod.push(line.slice(1));
		} else if (line.startsWith("-")) {
			orig.push(line.slice(1));
		} else if (line.startsWith(" ")) {
			orig.push(line.slice(1));
			mod.push(line.slice(1));
		} else if (line.startsWith("\\")) {
			/* "\ No newline at end of file" — skip */
		} else if (line === "") {
			// git context lines for empty content come as " " — a bare "" is
			// malformed for our purposes.
			return null;
		} else {
			return null;
		}
	}
	return { original: orig.join("\n"), modified: mod.join("\n") };
}

/**
 * Mount a read-only UNIFIED diff editor into `hostEl`. Resolves to
 * { update(text, path), dispose() } — or null when the diff text cannot be
 * reconstructed (caller falls back to the legacy renderer).
 */
async function mountMonacoDiff(hostEl, unifiedText, path) {
	const monaco = await ensureMonaco();
	const parsed = splitUnifiedDiff(unifiedText);
	if (!parsed) return null;
	const lang = monacoLanguageFor(path);
	const ed = monaco.editor.createDiffEditor(hostEl, {
		readOnly: true,
		renderSideBySide: false,          // unified view, like `git diff`
		compactMode: true,                // hide the unused original-line-number lane
		renderIndicators: true,
		glyphMargin: false,
		lineDecorationsWidth: 8,
		lineNumbersMinChars: 3,
		folding: false,
		automaticLayout: true,
		minimap: { enabled: false },
		scrollBeyondLastLine: false,
		...monacoFontOptions(),
		renderOverviewRuler: false,
		hideUnchangedRegions: { enabled: true, contextSize: 3 },
		diffCodeLens: false,
		scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
		theme: resolveMonacoTheme()
	});
	const orig = monaco.editor.createModel(parsed.original, lang);
	const mod = monaco.editor.createModel(parsed.modified, lang);
	ed.setModel({ original: orig, modified: mod });
	const onFontsChanged = () => {
		ed.updateOptions(monacoFontOptions());
		monaco.editor.remeasureFonts?.();
	};
	document.addEventListener(FONT_EVENT, onFontsChanged);
	return {
		update(text, newPath) {
			const next = splitUnifiedDiff(text);
			if (!next) return false;
			const newLang = monacoLanguageFor(newPath);
			if (newLang !== orig.getLanguageId()) {
				monaco.editor.setModelLanguage(orig, newLang);
				monaco.editor.setModelLanguage(mod, newLang);
			}
		orig.setValue(next.original);
			mod.setValue(next.modified);
			return true;
		},
		dispose() {
			document.removeEventListener(FONT_EVENT, onFontsChanged);
			ed.dispose();
			orig.dispose();
			mod.dispose();
		}
	};
}

/**
 * Mount a Monaco code editor (plain, not diff) into `hostEl`. This is the
 * replacement for the former CDN CodeMirror pipeline — file preview (readOnly)
 * and inline editing share this ONE renderer, so indentation, wrapping and
 * token highlighting are identical in both modes. Resolves to
 * { getValue(), dispose() } or rejects (caller decides the fallback UI).
 */
// Smaller than Monaco's built-in multi-MB threshold: this panel caps reads at
// 512 KB, but thousands of lines or one minified line can still stall typing.
function expensivePreviewText(value) {
	if (value.length >= 64 * 1024) return true;
	let lines = 1, column = 0;
	for (let i = 0; i < value.length; i++) {
		if (value.charCodeAt(i) === 10) { if (++lines >= 2000) return true; column = 0; }
		else if (++column >= 2000) return true;
	}
	return false;
}
function fileEditorOptions(value, readOnly, plainText) {
	const lean = readOnly || expensivePreviewText(value);
	return {
		readOnly: readOnly === true,
		wordWrap: plainText && !expensivePreviewText(value) ? "on" : "off",
		lineNumbers: plainText ? "off" : "on",
		largeFileOptimizations: true,
		maxTokenizationLineLength: 2000,
		occurrencesHighlight: lean ? "off" : "singleFile",
		selectionHighlight: !lean,
		folding: !lean,
		codeLens: false,
		colorDecorators: !lean,
		links: !lean,
		wordBasedSuggestions: lean ? "off" : "currentDocument",
		quickSuggestions: !lean,
		stickyScroll: { enabled: false },
		"semanticHighlighting.enabled": false
	};
}
async function mountMonacoEditor(hostEl, { value, path, readOnly, plainText = false, signal }) {
	const monaco = await ensureMonaco();
	// Do not create/tokenize a model for a file the user has already left.
	signal?.throwIfAborted();
	let source = value || "", readonly = readOnly === true;
	let language = plainText ? "plaintext" : monacoLanguageFor(path);
	const ed = monaco.editor.create(hostEl, {
		value: source,
		language,
		...fileEditorOptions(source, readonly, plainText),
		automaticLayout: true,
		minimap: { enabled: false },
		scrollBeyondLastLine: false,
		...monacoFontOptions(),
		tabSize: 2,
		renderWhitespace: "selection",
		scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
		theme: resolveMonacoTheme()
	});
	const onFontsChanged = () => {
		ed.updateOptions(monacoFontOptions());
		monaco.editor.remeasureFonts?.();
	};
	document.addEventListener(FONT_EVENT, onFontsChanged);
	// NOTE: no per-keystroke onChange — the only consumer (inline editing)
	// reads getValue() at save time; serializing the whole doc per keystroke
	// would be O(n) on every key for large files.
	return {
		getValue() { return ed.getValue(); },
		update({ value = source, path, readOnly = readonly, plainText = false }) {
			// Entering edit mode preserves the model, scroll, selection and undo.
			// Leaving it restores the saved source (cancel) or keeps the new save.
			if (value !== source || (!readonly && readOnly)) {
				if (ed.getValue() !== value) ed.setValue(value);
			}
			source = value; readonly = readOnly;
			const nextLanguage = plainText ? "plaintext" : monacoLanguageFor(path);
			if (language !== nextLanguage) {
				monaco.editor.setModelLanguage(ed.getModel(), nextLanguage);
				language = nextLanguage;
			}
			ed.updateOptions(fileEditorOptions(source, readonly, plainText));
		},
		dispose() {
			document.removeEventListener(FONT_EVENT, onFontsChanged);
			const model = ed.getModel();
			ed.dispose();
			model?.dispose();
		}
	};
}
		//#endregion

		//#region filebrowser
		// ── file browser tab ─────────────────────────────────────────────────────
		function gitBadgesOf(status) {
			const badges = new Map();
			if (!status) return badges;
			for (const entry of status.conflicts || []) badges.set(entry.path, "conflict");
			for (const entry of status.untracked || []) if (!badges.has(entry.path)) badges.set(entry.path, "untracked");
			const staged = new Set((status.staged || []).map((entry) => entry.path));
			const unstaged = new Set((status.unstaged || []).map((entry) => entry.path));
			for (const path of staged) {
				if (!badges.has(path)) badges.set(path, unstaged.has(path) ? "stagedMod" : "staged");
			}
			for (const path of unstaged) if (!badges.has(path)) badges.set(path, "modified");
			return badges;
		}
		const GIT_BADGES = {
			conflict: { label: "file.badgeConflict", tone: "error" },
			untracked: { label: "file.badgeUntracked" },
			stagedMod: { label: "file.badgeStagedMod", tone: "warn" },
			staged: { label: "file.badgeStaged", tone: "success" },
			modified: { label: "file.badgeModified", tone: "warn" }
		};

		// ── file-type → DSH icon + preview kind ──────────────────────────────────
		const escHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
		const CODE_EXTS = new Set(["js", "jsx", "ts", "tsx", "mjs", "cjs", "py", "java", "go", "rs", "c", "cc", "cpp", "cxx", "h", "hpp", "cs", "php", "rb", "sh", "bash", "swift", "kt", "scala", "lua", "sql", "vue"]);
		const DATA_EXTS = new Set(["json", "jsonc", "yaml", "yml", "toml", "ini", "cfg", "conf", "env", "properties", "xml", "csv", "tsv"]);
		const WEB_EXTS = new Set(["html", "htm", "css", "scss", "sass", "less"]);
		const DOC_EXTS = new Set(["md", "markdown", "txt", "log", "rtf"]);
		const IMG_EXTS = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "bmp"]);
		// Media preview mapping: mime types for blob-URL rendering (images,
		// PDFs, sandboxed HTML). Decided by extension only — the host returns
		// raw base64 bytes.
		const MIME_FROM_EXT = {
			png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
			svg: "image/svg+xml", webp: "image/webp", ico: "image/x-icon", bmp: "image/bmp",
			pdf: "application/pdf", html: "text/html", htm: "text/html"
		};
		function extOf(name) { const i = name.lastIndexOf("."); return i === -1 ? "" : name.slice(i + 1).toLowerCase(); }
		// Declared BEFORE classifyOf so the dependency reads top-down (the
		// bundle concatenates fragments — a use above its const works only
		// because calls happen at runtime, which is needlessly fragile).
		const MD_EXTS = new Set(["md", "markdown"]);
		// Classify a file for preview. Media kinds (image/pdf) skip the text
		// `read` RPC entirely — they go straight to `readBlob`.
		function classifyOf(name) {
			const ext = extOf(name);
			if (IMG_EXTS.has(ext)) return "image";
			if (ext === "pdf") return "pdf";
			if (WEB_EXTS.has(ext) && (ext === "html" || ext === "htm")) return "html";
			if (MD_EXTS.has(ext)) return "md";
			if (CODE_EXTS.has(ext) || DATA_EXTS.has(ext) || WEB_EXTS.has(ext)) return "code";
			return "text";
		}
		// Files that offer the preview/source toggle (anything renderable).
		const SWITCHABLE_KINDS = new Set(["md", "code", "html"]);
		// Kinds that open DIRECTLY in preview mode: code (chunked async
		// highlight is cheap) and html (sandboxed render). Markdown stays on
		// source by default — rendering a large document is heavier than
		// highlighting, so it renders only on explicit toggle.
		const DEFAULT_PREVIEW_KINDS = new Set(["code", "html"]);
		const defaultModeOf = (kind) => (DEFAULT_PREVIEW_KINDS.has(kind) ? "preview" : "source");
		// ── HTML preview prelude ─────────────────────────────────────────────────
		// The preview iframe runs WITH scripts but WITHOUT same-origin (see the
		// sandbox at the html branch): a srcdoc/blob document must never inherit
		// this page's origin, or a workspace HTML file could read the DSH
		// session. In that opaque origin the real localStorage / sessionStorage
		// THROW SecurityError, which kills any page touching them at startup —
		// theme persistence being the common case. Install in-memory stand-ins
		// BEFORE the page's own scripts: the page works and still cannot reach
		// anything outside its sandbox. (Verified in a sandboxed iframe:
		// defineProperty succeeds and the stub round-trips values.)
		const HTML_STORAGE_SHIM = "<script>(function(){function mk(){var m={},ks;return{getItem:function(k){return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},clear:function(){m={}},key:function(i){ks=Object.keys(m);return i<ks.length?ks[i]:null},get length(){return Object.keys(m).length}}};var names=['localStorage','sessionStorage'];for(var i=0;i<names.length;i++){var n=names[i];try{window[n].getItem('__dsh_probe');}catch(e){try{Object.defineProperty(window,n,{value:mk(),configurable:true});}catch(e2){}}}})()</scr" + "ipt>";
		function withHtmlPrelude(html) {
			// The shim must precede the document's first script; <head> is the
			// earliest safe spot — the lookahead keeps <header> from matching (a
			// <header>-only document would otherwise inject mid-body). Without a
			// <head> (or doctype) we prepend — never BEFORE a doctype, which
			// would drop the document into quirks mode.
			const head = /<head(?=[\s>])/i;
			if (head.test(html)) return html.replace(head, (m) => m + HTML_STORAGE_SHIM);
			const dt = /<!doctype[^>]*>/i.exec(html);
			if (dt) { const end = dt.index + dt[0].length; return html.slice(0, end) + HTML_STORAGE_SHIM + html.slice(end); }
			return HTML_STORAGE_SHIM + html;
		}
		// ── file-type icons (vscode-icons artwork, inlined at build time) ────────
		// Solid brand tiles, the same visual language DSH's own file tree uses
		// (its built-in set is devicon artwork composed onto rounded tiles). The
		// artwork table lives in fileicons.js, generated by
		// scripts/gen-file-icons.mjs; here we only own the NAME → type-key rules.
		// Unknown extensions fall through to the generic file art (never a
		// bare stroke glyph), so every row is recognizable at a glance.
		const FILE_ICON_EXTS = {
			ts: "ts", tsx: "ts", mts: "ts", cts: "ts",
			js: "js", jsx: "js", mjs: "js", cjs: "js",
			py: "py", pyi: "py", rs: "rs", go: "go", java: "java",
			c: "c", h: "c", cc: "cpp", cpp: "cpp", cxx: "cpp", hpp: "cpp", hh: "cpp",
			cs: "cs", kt: "kt", kts: "kt", swift: "swift", rb: "rb", php: "php",
			lua: "lua", dart: "dart", r: "r", scala: "scala", sh: "sh", bash: "sh",
			zsh: "sh", fish: "sh", bat: "sh", cmd: "sh", ps1: "sh",
			vue: "vue", svelte: "svelte", graphql: "graphql", gql: "graphql",
			cmake: "cmake", sql: "sql",
			md: "md", markdown: "md", mdx: "md", txt: "txt", log: "txt",
			json: "json", jsonc: "json", json5: "json",
			yml: "yml", yaml: "yml", toml: "toml", ini: "ini", cfg: "ini", conf: "ini", properties: "ini",
			xml: "xml", plist: "xml",
			xls: "xls", xlsx: "xls", csv: "csv", tsv: "csv",
			pdf: "pdf", zip: "zip", gz: "zip", tar: "zip", rar: "zip", "7z": "zip",
			png: "img", jpg: "img", jpeg: "img", gif: "img", svg: "img", webp: "img",
			ico: "img", bmp: "img", avif: "img", tiff: "img",
			mp3: "aud", wav: "aud", flac: "aud", m4a: "aud", ogg: "aud",
			mp4: "vid", mov: "vid", webm: "vid", mkv: "vid", avi: "vid",
			woff: "font", woff2: "font", ttf: "font", otf: "font", eot: "font",
			html: "html", htm: "html",
			css: "css", scss: "css", sass: "css", less: "css", styl: "css",
			env: "env", lock: "lock"
		};
		const FILE_ICON_NAMES = {
			".gitignore": "git", ".gitattributes": "git", ".gitmodules": "git",
			".gitkeep": "git", ".gitconfig": "git", ".mailmap": "git",
			"license": "lic", "licence": "lic", "copying": "lic", "notice": "lic",
			"package-lock.json": "lock", "npm-shrinkwrap.json": "lock",
			"yarn.lock": "lock", "pnpm-lock.yaml": "lock", "bun.lockb": "lock",
			"package.json": "json", "tsconfig.json": "json", "composer.json": "json",
			"dockerfile": "docker", "docker-compose.yml": "docker", "docker-compose.yaml": "docker",
			".env": "env", ".env.local": "env", ".env.development": "env", ".env.production": "env",
			"makefile": "cmake", "gnumakefile": "cmake",
			"readme": "md", "readme.md": "md", "changelog": "md", "changelog.md": "md"
		};
		function fileIconTypeOf(name) {
			const lower = String(name ?? "").toLowerCase();
			if (FILE_ICON_NAMES[lower]) return FILE_ICON_NAMES[lower];
			const ext = extOf(lower);
			return FILE_ICON_EXTS[ext] || null;
		}
		// Always returns a renderable component: a known type uses its brand tile,
		// anything else the generic file art — so the caller never branches.
		function iconForFile(name) {
			return fileIconFor(fileIconTypeOf(name) ?? "fallback");
		}

		// ── lightweight syntax highlighter (self-contained, token-level) ─────────
		const LANG_KEYWORDS = {
			js: "const let var function return if else for while do switch case break continue new class extends super this typeof instanceof in of try catch finally throw async await yield import export from default null undefined true false void delete static get set",
			ts: "const let var function return if else for while do switch case break continue new class extends super this typeof instanceof in of try catch finally throw async await yield import export from default null undefined true false void delete static get set interface type enum implements private public protected readonly abstract keyof satisfies as is namespace declare module",
			json: "true false null",
			py: "def return if elif else for while import from as class try except finally raise with lambda pass None True False and or not in is global nonlocal yield assert async await del break continue",
			java: "public private protected class interface enum extends implements return if else for while do switch case break continue new try catch finally throw throws import package static final void int long double float boolean char byte short this super null true false abstract synchronized volatile transient instanceof",
			go: "func return if else for range switch case default package import var const type struct interface map chan go defer select break continue fallthrough true false nil len cap make new append panic recover",
			rs: "fn let mut const return if else for while loop match use mod pub struct enum trait impl type where as ref move dyn async await in true false self",
			c: "int char float double void long short unsigned signed const static struct union enum typedef return if else for while do switch case break continue sizeof goto",
			cpp: "int char float double void long short unsigned signed const static struct union enum typedef return if else for while do switch case break continue class namespace template typename public private protected virtual override new delete this nullptr true false using",
			cs: "public private protected internal class interface enum struct namespace using return if else for foreach while do switch case break continue new try catch finally throw async await var void int long double float bool char string decimal object null true false this base override virtual readonly const static abstract sealed partial",
			php: "public private protected class function return if else elseif for foreach while do switch case break continue new try catch finally throw namespace use echo print null true false this static extends implements interface const",
			rb: "def end return if elsif else unless for while do case when break next class module require include attr_reader attr_writer new nil true false self",
			sh: "if then else elif fi for while do done case esac function return local export readonly echo cd ls pwd mkdir rm cp mv cat grep sed awk exit true false",
			sql: "select from where insert into values update set delete join inner left right outer on group by order having limit offset as and or not null is in like between exists distinct count sum avg min max create table drop alter index primary key foreign references union case when then else end",
			yaml: "true false null yes no on off",
			css: "px em rem vh vw important",
			html: "html head body div span p a img script style link meta title h1 h2 h3 h4 h5 h6 ul ol li table tr td th form input button class id href src style"
		};
		const LANG_LINE_COMMENT = { py: "#", rb: "#", sh: "#", yaml: "#", sql: "--" };
		const LANG_FROM_EXT = { js: "js", jsx: "js", mjs: "js", cjs: "js", ts: "ts", tsx: "ts", json: "json", jsonc: "json", py: "py", java: "java", go: "go", rs: "rs", c: "c", h: "c", cc: "cpp", cpp: "cpp", cxx: "cpp", hpp: "cpp", cs: "cs", php: "php", rb: "rb", sh: "sh", bash: "sh", swift: "c", kt: "java", sql: "sql", yaml: "yaml", yml: "yaml", css: "css", scss: "css", less: "css", html: "html", htm: "html", vue: "js" };
		function highlightCode(code, lang) {
			const kwSet = new Set((LANG_KEYWORDS[lang] || LANG_KEYWORDS.js || "").split(/\s+/).filter(Boolean));
			const lineCmt = LANG_LINE_COMMENT[lang] || "//";
			const lcEsc = lineCmt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const re = new RegExp(
				"(" + lcEsc + "[^\\n]*)|" +
				"(\\/\\*[\\s\\S]*?\\*\\/|<!--[\\s\\S]*?-->)|" +
				"(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'|`(?:[^`\\\\\\n]|\\\\.)*`)|" +
				"(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)|" +
				"(\\b[A-Za-z_$][\\w$]*\\b)",
				"g");
			let html = "";
			let last = 0;
			let m;
			while ((m = re.exec(code))) {
				const [full, lineC, blockC, str, num, id] = m;
				html += escHtml(code.slice(last, m.index));
				if (lineC) html += `<span class="dgp-tk-c">${escHtml(lineC)}</span>`;
				else if (blockC) html += `<span class="dgp-tk-c">${escHtml(blockC)}</span>`;
				else if (str) html += `<span class="dgp-tk-s">${escHtml(str)}</span>`;
				else if (num) html += `<span class="dgp-tk-n">${escHtml(num)}</span>`;
				else if (id) {
					if (kwSet.has(id)) html += `<span class="dgp-tk-k">${escHtml(id)}</span>`;
					else if (/^[A-Z]/.test(id) && (lang === "ts" || lang === "java" || lang === "cs" || lang === "go" || lang === "cpp" || lang === "c" || lang === "rs")) html += `<span class="dgp-tk-t">${escHtml(id)}</span>`;
					else html += escHtml(id);
				}
				last = m.index + full.length;
			}
			html += escHtml(code.slice(last));
			return html;
		}

		// ── compact markdown → HTML (self-contained, escaped) ────────────────────
		function inlineMd(s) {
			let r = escHtml(s);
			r = r.replace(/`([^`]+)`/g, "<code>$1</code>");
			r = r.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
			r = r.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
			// NOTE: `s` is escaped ONCE at the top, so the captured `u`/`alt`
			// are already entity-encoded (no raw quotes/angles survive) and
			// attribute-safe as-is. Escaping them AGAIN turned `?a=1&b=2` into
			// `?a=1&amp;b=2`, breaking every link with query parameters.
			r = r.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m2, alt, u) => /^(https?:)/.test(u) ? `<img src="${u}" alt="${alt}" />` : alt || "(image)");
			r = r.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m2, t, u) => /^(https?:|mailto:|#)/.test(u) ? `<a href="${u}" target="_blank" rel="noreferrer">${t}</a>` : t);
			return r;
		}
		function renderMarkdown(src, depth = 0) {
			const lines = String(src ?? "").replace(/\r\n/g, "\n").split("\n");
			let html = "";
			let i = 0;
			while (i < lines.length) {
				const t = lines[i].trim();
				const fence = t.match(/^```(\w*)\s*$/);
				if (fence) {
					const lang = fence[1].toLowerCase();
					const buf = [];
					i++;
					while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) { buf.push(lines[i]); i++; }
					i++;
					const body = buf.join("\n");
					// Avoid generating tens of thousands of token spans for a huge
					// fenced sample; preserve all source characters without highlighting.
					html += `<pre class="dgp-mdPre"><code>` + (lang && !expensivePreviewText(body) ? highlightCode(body, lang) : escHtml(body)) + `</code></pre>\n`;
					continue;
				}
				const hd = t.match(/^(#{1,6})\s+(.*)$/);
				if (hd) { const n = hd[1].length; html += `<h${n}>` + inlineMd(hd[2]) + `</h${n}>\n`; i++; continue; }
				if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { html += "<hr>\n"; i++; continue; }
				if (t.startsWith(">")) {
					const buf = [];
					while (i < lines.length && lines[i].trim().startsWith(">")) { buf.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
					// Depth cap: a file of thousands of nested ">" lines must not
					// recurse into a stack overflow — beyond the cap the block
					// renders as plain escaped paragraphs.
					if (depth >= 16) {
						html += `<blockquote>` + buf.map((l) => `<p>` + escHtml(l) + `</p>`).join("") + `</blockquote>\n`;
					} else {
						html += `<blockquote>` + renderMarkdown(buf.join("\n"), depth + 1) + `</blockquote>\n`;
					}
					continue;
				}
				const ul = t.match(/^[-*+]\s+(.*)$/);
				if (ul) {
					html += "<ul>\n";
					while (i < lines.length) { const m2 = lines[i].trim().match(/^[-*+]\s+(.*)$/); if (!m2) break; html += `<li>` + inlineMd(m2[1]) + `</li>\n`; i++; }
					html += "</ul>\n";
					continue;
				}
				const ol = t.match(/^\d+[.)]\s+(.*)$/);
				if (ol) {
					html += "<ol>\n";
					while (i < lines.length) { const m2 = lines[i].trim().match(/^\d+[.)]\s+(.*)$/); if (!m2) break; html += `<li>` + inlineMd(m2[1]) + `</li>\n`; i++; }
					html += "</ol>\n";
					continue;
				}
				if (t.startsWith("|") && lines[i + 1] && /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim()) && lines[i + 1].includes("-")) {
					const parseRow = (r) => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
					const header = parseRow(t);
					i += 2;
					const body = [];
					while (i < lines.length && lines[i].trim().startsWith("|")) { body.push(parseRow(lines[i])); i++; }
					html += "<table><thead><tr>" + header.map((c) => `<th>` + inlineMd(c) + `</th>`).join("") + "</tr></thead><tbody>";
					for (const row of body) html += "<tr>" + row.map((c) => `<td>` + inlineMd(c) + `</td>`).join("") + "</tr>";
					html += "</tbody></table>\n";
					continue;
				}
				if (t === "") { i++; continue; }
				const para = [t];
				i++;
				while (i < lines.length) {
					const nt = lines[i].trim();
					if (nt === "" || /^(#{1,6}\s|```|>\s?|[-*+]\s|\d+[.)]\s|(-{3,}|\*{3,}|_{3,})$|^\|)/.test(nt)) break;
					para.push(nt); i++;
				}
				html += `<p>` + para.map(inlineMd).join("<br>\n") + `</p>\n`;
			}
			return html;
		}

		// Clipboard write with a legacy fallback (127.0.0.1 is a secure context,
		// so navigator.clipboard normally works; fallback covers odd hosts).
		const copyText = async (text) => {
			try { await navigator.clipboard.writeText(text); return true; }
			catch {
				try {
					const ta = document.createElement("textarea");
					ta.value = text;
					ta.style.position = "fixed"; ta.style.opacity = "0";
					document.body.appendChild(ta); ta.select();
					const ok = document.execCommand("copy");
					ta.remove();
					return ok;
				} catch { return false; }
			}
		};

		// One file-browser row (memoized: clicking a row to select it only
		// re-renders that row, not the whole pane list). Hovering reveals
		// quick actions: open the containing folder in the system explorer,
		// copy the absolute path, copy the file name.
		// `tapOpens` (narrow viewports): a single tap navigates — folders drill
		// in, files open the preview — because double-tap is unreliable on
		// touch; the wide mode keeps select-on-click / open-on-double-click.
		// Only ONE row context menu may be open at a time. A row menu closes on a
		// document `click` — but a RIGHT-click does not emit one, so without this
		// registry the previous row's menu stayed open next to the new one (two
		// overlapping menus). Rows register their closer here; opening a menu
		// first closes whichever row held it.
		let closeActiveRowMenu = null;
		// Suspending the panel must drop any open row menu too: it is portaled
		// under .dgp-root, so the dialog's slide-out transform never moves it and
		// the hidden root swallows the pointer events that would close it.
		hiddenStore.subscribe(() => { if (hiddenStore.get() && closeActiveRowMenu) closeActiveRowMenu(); });
		const FileRow = React.memo(function FileRow({ entry, path, selected, opened, badgeKind, tapOpens, checkable, checked, onSelect, onToggle, onOpenDir, onOpenPreview, onOpenFolder, onCopyPath, onCopyName, onDownload, onDownloadZip, onDelete }) {
			const isDir = entry.type === "dir";
			const badge = isDir ? null : GIT_BADGES[badgeKind];
			const Icon = isDir ? (opened ? IconFolderOpen : IconFolderClose) : iconForFile(entry.name);
			const [copied, setCopied] = useState(null);   // "path" | "name" | null
			// Row actions live in a "⋯" menu button (hover-revealed) and the
			// same menu opens on right-click — mirrors the git log context
			// menu (portal under .dgp-root, icons, click-away close).
			const [menu, setMenu] = useState(null);       // {x,y} | null
			const copiedTimer = useRef(null);
			const t = useT();
			const flash = (kind) => {
				setCopied(kind);
				clearTimeout(copiedTimer.current);
				copiedTimer.current = setTimeout(() => setCopied(null), 1200);
			};
			useEffect(() => () => clearTimeout(copiedTimer.current), []);
			const closeMenu = useCallback(() => {
				if (closeActiveRowMenu === closeMenu) closeActiveRowMenu = null;
				setMenu(null);
			}, []);
			// A row unmounting (list re-render, navigation, filter change) must
			// not leave a stale closer behind.
			useEffect(() => () => { if (closeActiveRowMenu === closeMenu) closeActiveRowMenu = null; }, [closeMenu]);
			useEffect(() => {
				if (!menu) return undefined;
				document.addEventListener("click", closeMenu);
				return () => document.removeEventListener("click", closeMenu);
			}, [menu, closeMenu]);
			const openMenuAt = useCallback((x, y) => {
				if (closeActiveRowMenu && closeActiveRowMenu !== closeMenu) closeActiveRowMenu();
				closeActiveRowMenu = closeMenu;
				setMenu(menuAt(x, y));
			}, [closeMenu]);
			const menuItems = [
				{ icon: IconFolderOpen, label: t("file.openDirRow"), title: t("file.openDirRowTitle"), run: () => onOpenFolder(entry.path, isDir) },
				{ icon: IconData, label: copied === "path" ? t("file.copied") : t("file.copyPath"), title: t("file.copyPathTitle"), run: () => onCopyPath(entry.path, isDir).then((ok) => ok && flash("path")) },
				{ icon: IconListPen, label: copied === "name" ? t("file.copied") : t("file.copyName"), title: t("file.copyNameTitle"), run: () => onCopyName(entry.name).then((ok) => ok && flash("name")) },
				...(isDir
					? (onDownloadZip ? [{ icon: IconFolderOpen, label: t("file.downloadZip"), title: t("file.downloadZipTitle"), run: () => onDownloadZip(entry.path, entry.name) }] : [])
					: (onDownload ? [{ icon: IconPaperclip, label: t("file.download"), title: t("file.downloadTitle"), run: () => onDownload(entry.path, entry.name) }] : [])),
				// Destructive action last, separated by the theme's danger tone;
				// the confirm dialog is the only thing that actually deletes.
				...(onDelete ? [{ icon: IconTrash, label: t("file.delete"), title: isDir ? t("file.deleteDirHint") : t("file.deleteHint"), danger: true, run: () => onDelete(entry) }] : [])
			];
			const tapOpen = () => { onSelect(entry.path); isDir ? onOpenDir(path, entry.path) : onOpenPreview(path, entry.path); };
			// Status badge hugs the file name (left group) instead of floating
			// at the far right; size + the actions ⋯ button keep the right edge.
			return h("div", { className: "dgp-row", "data-clickable": "true", "data-directory": isDir ? "true" : "false", "data-selected": selected ? "true" : "false", "data-ignored": entry.ignored ? "true" : "false", title: entry.path + (entry.ignored ? "\n" + t("file.ignoredHint") : ""), onClick: tapOpens ? tapOpen : () => onSelect(entry.path), onDoubleClick: () => (isDir ? onOpenDir(path, entry.path) : onOpenPreview(path, entry.path)), onContextMenu: (e) => { e.preventDefault(); e.stopPropagation(); onSelect(entry.path); openMenuAt(e.clientX, e.clientY); } },
				checkable ? h("span", { className: "dgp-rowCheck", "data-checked": checked ? "true" : "false", role: "checkbox", "aria-checked": checked ? "true" : "false", onClick: (e) => { e.stopPropagation(); onToggle?.(entry); } }, checked ? h(IconCheck, { size: 11 }) : null) : null,
				// Reference-into-composer action, ALWAYS visible (deliberately not
				// hover-gated like ⋯): one click points the agent at this entry.
				// It writes the cross-scope bridge store; the session-scope injector
				// registered in triggers.js performs the actual draft insert.
				h("button", {
					type: "button", className: "dgp-refBtn",
					title: isDir ? t("file.referenceDirHint") : t("file.referenceHint"),
					"aria-label": t("file.reference"),
					onClick: (e) => { e.stopPropagation(); requestReference(entry.path, isDir); }
				}, h(IconAtSign, { size: 13 })),
				h("span", { className: "dgp-fileIcon" + (isDir ? " dgp-fileIcon--dir" : "") }, h(Icon, { size: 15 })),
				h("span", { className: "dgp-treeName", style: { ...(isDir ? { fontWeight: 500 } : { fontFamily: "var(--dgp-font-mono,var(--dsw-font-mono,monospace))", fontSize: "calc(12px * var(--dgp-ui-scale, 1))" }), flex: "0 1 auto" } }, entry.name),
				badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null,
				h("span", { style: { flex: 1 } }),
				entry.mtimeMs != null ? h("span", { className: "dgp-rowTime", title: t("file.colTime") }, fmtTime(entry.mtimeMs)) : null,
				isDir ? h("span", { className: "dgp-rowMeta" }, "—") : entry.size != null ? h("span", { className: "dgp-rowMeta" }, fmtSize(entry.size)) : null,
				h("span", { className: "dgp-fileActs" },
					h("button", {
						type: "button", className: "dgp-logMenuBtn", title: t("file.actionsTitle"),
						onClick: (e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); openMenuAt(r.right, r.bottom + 4); }
					}, copied ? h(IconCheck, { size: 14 }) : h(IconEllipsis, { size: 14 }))
				),
				menu ? portal(
					h("div", { className: "dgp-logMenu", "data-flip": menu.flip ? "true" : undefined, style: { top: menu.y, left: menu.x }, onClick: (e) => e.stopPropagation() },
						menuItems.map((it) => h("button", { key: it.label, type: "button", className: "dgp-logMenuItem", "data-danger": it.danger ? "true" : undefined, title: it.title, onClick: () => { closeMenu(); it.run(); } },
							h(it.icon, { size: 13 }), it.label))
					), document.querySelector(".dgp-root")) : null
			);
		});

		// ── media preview (images / PDFs): base64 readBlob → blob URL ──────────
		// Fetches the binary through the host's readBlob endpoint (workspace
		// path or outside-workspace abs, same trust model as write), converts
		// base64 → Blob → object URL and renders <img> / <iframe>. The object
		// URL is revoked on unmount / file switch so big payloads are freed.
		// `onUrl` reports the URL up to the preview header, whose「在浏览器打开」
		// button opens it in a NEW BROWSER TAB (window.open) — no dependence on
		// system file associations (a .png default app may be Photos, a .pdf
		// may be a desktop reader; the browser renders both natively).
		function MediaView({ cwd, p, onUrl }) {
			const t = useT();
			const [state, setState] = useState({ url: null, error: null });
			useEffect(() => {
				let alive = true;
				let url = null;
				setState({ url: null, error: null });
				onUrl?.(null);
				(async () => {
					try {
						const v = await gitRpc("readBlob", p.abs ? { repo: cwd, abs: p.abs } : { repo: cwd, path: p.path });
						// Decode through fetch(data:): the browser's native base64
						// decoder does the byte conversion off the JS main thread.
						// The old Uint8Array.from(atob(...), charCode) loop ran one
						// JS callback PER BYTE and froze the whole page for seconds
						// on 10-20MB PDFs/images.
						const res = await fetch(`data:${p.mime || "application/octet-stream"};base64,${v.base64}`);
						url = URL.createObjectURL(await res.blob());
						if (alive) { setState({ url, error: null }); onUrl?.(url); }
					} catch (err) {
						if (alive) setState({ url: null, error: String(err?.message ?? err) });
					}
				})();
				return () => { alive = false; if (url) { URL.revokeObjectURL(url); onUrl?.(null); } };
			}, [cwd, p.path, p.abs, p.mime, onUrl]);
			const sysOpen = () => {
				const target = p.abs ? p.abs : `${cwd.replace(/[\\/]+$/, "")}/${p.path}`;
				// DSH Remote wire format: endpoint = namespace/method, payload =
				// {args}. `session/openWorkspacePath` hands the path to the OS
				// default app (openNativePath) — same endpoint the chat UI uses.
				rpc("api", "session/openWorkspacePath", { args: { request: { path: target } } }).catch(() => {});
			};
			if (state.error) return h("div", { className: "dgp-paneEmpty" },
				h("div", null, t("pv.mediaFail", { msg: state.error })),
				h("div", { style: { marginTop: 8 } }, lbtn(t("pv.openEditor"), sysOpen, { tone: "default" }))
			);
			if (!state.url) return h("div", { className: "dgp-paneEmpty" }, t("pv.mediaLoading"));
			if (p.kind === "image") return h("div", { className: "dgp-mediaBody" }, h("img", { src: state.url, alt: p.name }));
			return h("iframe", { className: "dgp-pdfFrame", src: state.url, title: p.name });
		}

		function FileBrowser({ cwd, status, refreshTick, onEdited, headerHost, pageNavigation, rootNavigationRef }) {
			// `dirs`: rel-path → entries; `leftPath`/`rightPath`: the two panes;
			// `preview`: {path,name,text,truncated,binary,size,kind} when previewing.
			const [dirs, setDirs] = useState({});
			const [leftPath, setLeftPath] = useState(null);   // null ⇒ single list
			const [rightPath, setRightPath] = useState("");   // current list (root = "")
			const [preview, setPreview] = useState(null);
			const previewSeqRef = useRef(0);
			// Blob URL of the media file being previewed (image/pdf) — reported
			// by MediaView so the preview header's「在浏览器打开」button can
			// window.open it; null when no media preview is active.
			const [mediaUrl, setMediaUrl] = useState(null);
			const [sel, setSel] = useState(null);
			// ── upload / download / batch export ──────────────────────────────────
			// Multi-select (batch export): toggle on the search row; the checked
			// set is keyed by workspace-relative path and cleared on navigation
			// (a new directory is a new selection). Checkbox click selects; the
			// row itself keeps its navigate/preview behavior.
			const [multiMode, setMultiMode] = useState(false);
			const [selSet, setSelSet] = useState({});
			// Upload / export status row: { kind, text, pct } — pct null means
			// indeterminate (zip building / download streaming).
			const [busyRow, setBusyRow] = useState(null);
			// Pending upload-overwrite confirmation: the card shows { name },
			// the promise resolver waits in a ref so it resolves exactly once.
			const [overwriteAsk, setOverwriteAsk] = useState(null);
			// Pending delete confirmation ({ title, message, onConfirm, danger }).
			// Delete is irreversible on disk, so it always goes through the dialog.
			const [delConfirm, setDelConfirm] = useState(null);
			const overwriteResolveRef = useRef(null);
			const fileInputRef = useRef(null);
			// cancel() closures of active transfers live in the registry
			// declared below (cancelsRef); the upload flow owns uploadAbortRef.
			// Unmount flag: in-flight listings/preview loads stop writing state
			// after the browser (or the whole panel) goes away.
			const mounted = useRef(true);
			useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
			// Narrow-viewport (mobile) drill-down pane: 'list' ⇄ 'preview'.
			// Consulted only when narrow — wide mode keeps the master-detail
			// split and never reads this flag.
			const narrow = useNarrow();
			const [mobilePane, setMobilePane] = useState("list");
			const [searchOpen, setSearchOpen] = useState(false);
			const searchInputRef = useRef(null);
			const [query, setQuery] = useState("");   // file list name filter
			// A single Monaco instance serves preview and editing for the active file.
			const [pvEdit, setPvEdit] = useState(false);
			const [editBusy, setEditBusy] = useState(false);
			const [editErr, setEditErr] = useState(null);
			const [pvCopyStatus, setPvCopyStatus] = useState(null);
			const pvCopyTimerRef = useRef(null);
			const t = useT();
			const editorHostRef = useRef(null);
			const editorRef = useRef(null);
			const [pvMode, setPvMode] = useState("source");
			const [pvCmTick, setPvCmTick] = useState(0);
			// Finished HTML blocks keep their element identity across progress updates.
			const [mdRendered, setMdRendered] = useState(null);
			// Recent search terms (whole-workspace box), persisted locally so the
			// user can jump straight back to a file they searched before.
			const [histOpen, setHistOpen] = useState(false);
			const [crumbMenuPos, setCrumbMenuPos] = useState(null);
			const [history, setHistory] = useState(() => {
				try { return JSON.parse(localStorage.getItem("dsh-files-git.searchHistory")) || []; }
				catch { return []; }
			});
			// Resolve Git badges once per status payload. File rows do constant-time
			// lookups instead of scanning every changed path for every visible file.
			const statusBadges = useMemo(
				() => gitBadgesOf(status),
				[status?.conflicts, status?.staged, status?.unstaged, status?.untracked]
			);
			const rememberQuery = useCallback((term) => {
				const t = (term || "").trim().toLowerCase();
				if (!t) return;
				setHistory((prev) => {
					const next = [t, ...prev.filter((x) => x !== t)].slice(0, 8);
					try { localStorage.setItem("dsh-files-git.searchHistory", JSON.stringify(next)); } catch {}
					return next;
				});
			}, []);
			const clearHistory = useCallback(() => {
				setHistory([]);
				try { localStorage.removeItem("dsh-files-git.searchHistory"); } catch {}
			}, []);
			// Auto-remember: 1s after the user stops typing (and on blur / Enter),
			// the current term is saved — no need to press Enter explicitly.
			useEffect(() => {
				if (!query.trim()) return;
				const t = setTimeout(() => rememberQuery(query), 1000);
				return () => clearTimeout(t);
			}, [query, rememberQuery]);
			// The search-history dropdown is portaled to the panel root (outside
			// the dialog content) so its backdrop-filter actually renders — Chrome
			// silently drops backdrop-filter inside a layer that already has one.
			// It needs fixed viewport coordinates from the search input.
			const [histPos, setHistPos] = useState(null);
			const openHist = useCallback((open) => {
				const inp = document.querySelector(".dgp-search");
				if (inp && open) {
					const r = inp.getBoundingClientRect();
					setHistPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4), width: Math.round(r.width) });
				}
				setHistOpen(open);
			}, []);
			// Wheel lock while the dropdown is open: scrolling anywhere in the
			// panel (outside the dropdown) is swallowed so the wheel cannot pass
			// through to content beneath the popup.
			useEffect(() => {
				if (!histOpen) return;
				const onWheel = (e) => {
					if (e.target.closest(".dgp-searchHist")) return;
					if (e.target.closest(".dgp-root")) e.preventDefault();
				};
				document.addEventListener("wheel", onWheel, { passive: false });
				return () => document.removeEventListener("wheel", onWheel);
			}, [histOpen]);
			// Suspending the panel closes the search-history dropdown: it is
			// portaled under .dgp-root, so the dialog's slide-out transform never
			// moves it — it would keep floating over the main UI while suspended.
			const panelHidden = useSyncExternalStore(subscribeHidden, getHidden);
			useEffect(() => {
				if (panelHidden) { setHistOpen(false); setCrumbMenuPos(null); }
			}, [panelHidden]);
			useEffect(() => {
				if (!crumbMenuPos) return undefined;
				document.querySelector(".dgp-crumbMenuItem")?.focus();
				const onDoc = (e) => {
					if (e.target.closest?.(".dgp-crumbMenu, .dgp-crumbEllipsis")) return;
					setCrumbMenuPos(null);
				};
				const onKey = (e) => {
					if (e.key !== "Escape") return;
					setCrumbMenuPos(null);
					document.querySelector(".dgp-crumbEllipsis")?.focus();
				};
				document.addEventListener("mousedown", onDoc);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("mousedown", onDoc);
					document.removeEventListener("keydown", onKey);
				};
			}, [crumbMenuPos]);
			// Whole-workspace file index (git ls-files): LAZY — fetched only when
			// the search box is first focused or typed into, NOT on every panel
			// open. Opening the panel previously fired this full-workspace walk
			// alongside the status/list burst; if one request stalls (proxy,
			// browser's 6-connection HTTP/1.1 pool), every queued RPC ages
			// toward its timeout together. null while loading or when cwd is
			// not a git repo (falls back to filtering the current directory).
			const [allFiles, setAllFiles] = useState(null);
			const [searchArmed, setSearchArmed] = useState(false);
			useEffect(() => {
				if (!searchArmed) return;
				let alive = true;
				setAllFiles(null);
				gitRpc("search", { repo: cwd })
					.then((v) => { if (alive) setAllFiles(Array.isArray(v.files) ? v.files : null); })
					.catch(() => { if (alive) setAllFiles(null); });
				return () => { alive = false; };
			}, [searchArmed, cwd]);
			const armSearch = useCallback(() => setSearchArmed(true), []);
			const [browseError, setBrowseError] = useState(null);
			// External file-open request (produced-file/link click routed through
			// the openPath interception): {path, ts} → navigate to the file's
			// directory and open a preview. Paths outside the current workspace
			// show a hint bar with a "system app" fallback button. The effect
			// itself lives below (after loadDir/openPreview are defined).
			const openReq = useSyncExternalStore(subscribeOpenReq, getOpenReq);
			const lastOpenReqTs = useRef(0);
			const [extOpen, setExtOpen] = useState(null);
			// Split ratio control: `listFrac` (list split, default .5) and
			// `previewFrac` (preview, default .15); null = default. Draggable gutter.
			const [listFrac, setListFrac] = useState(null);
			const [previewFrac, setPreviewFrac] = useState(null);
			const [dragging, setDragging] = useState(false);
			const splitRef = useRef(null);
			// In-flight guard for loadDir: a directory whose request is still
			// pending must never be re-requested. Without it, the auto-load
			// effects below re-fire on every `dirs` identity change while the
			// value is "loading" — an unbounded list-request storm that first
			// saturates the host/connection pool ("Failed to fetch") and then
			// pegs the main thread with a render loop (whole tab freezes).
			const loadingDirsRef = useRef(new Set());
			// Directories whose refresh arrived WHILE a load was in flight —
			// the in-flight response predates the event that asked (upload →
			// loadDir during navigation), so the load re-runs on settle. A Map so
			// the queued call keeps its own opts (`silent`), otherwise a silent
			// post-upload refresh that lost the race would re-run visibly.
			const pendingDirsRef = useRef(new Map());
			// Current pane paths mirrored to refs so the cache eviction below can
			// protect the visible directories without depending on state identity.
			const leftPathRef = useRef(leftPath); leftPathRef.current = leftPath;
			const rightPathRef = useRef(rightPath); rightPathRef.current = rightPath;
			// dirs cache eviction: visited listings are kept so pane switches are
			// instant, but the cache must not grow forever across a long browsing
			// session — once it exceeds 60 paths, evict the least-recently-needed
			// entries (never the visible panes or the root) down to 40.
			const setDir = (rel, value) => setDirs((d) => {
				const next = { ...d, [rel]: value };
				const keys = Object.keys(next);
				if (keys.length > 60) {
					const keep = new Set([rel, "", rightPathRef.current, leftPathRef.current]);
					for (const k of keys) {
						if (keep.has(k)) continue;
						delete next[k];
						if (Object.keys(next).length <= 40) break;
					}
				}
				return next;
			});
			const loadDir = useCallback(async (rel, opts = {}) => {
				if (loadingDirsRef.current.has(rel)) {
					// Already in flight: remember it and re-run after settle —
					// dropping it would leave a stale listing (e.g. an upload
					// finishing right after navigation started a load).
					if (!opts.ensure) pendingDirsRef.current.set(rel, opts);
					return;
				}
				loadingDirsRef.current.add(rel);
				// `silent` skips the loading placeholder: an in-place refresh after an
				// upload/delete must not wipe the list and flip the pane into its
				// spinner state (reported as "上传后整个文件列表都刷新了"). Keys stay
				// stable, so React reconciles rows in place.
				if (!opts.silent) setDir(rel, "loading");
				try {
					const v = await gitRpc("list", { repo: cwd, path: rel });
					if (mounted.current) setDir(rel, Array.isArray(v.entries) ? v.entries : []);
				} catch (err) {
					// "error" (NOT []): caching an empty array made the pane
					// permanently show an EMPTY directory — the auto-load
					// effects only trigger on `undefined`, so a failed load
					// never retried. "error" renders a retry card instead.
					if (mounted.current) {
						setBrowseError(err.message);
						setDir(rel, "error");
					}
				} finally {
					loadingDirsRef.current.delete(rel);
					const queued = pendingDirsRef.current.get(rel);
					if (pendingDirsRef.current.delete(rel) && mounted.current) void loadDir(rel, queued ?? {});
				}
			}, [cwd]);

			useEffect(() => { setDirs({}); setLeftPath(null); setRightPath(""); setPreview(null); setSel(null); setSelSet({}); setBrowseError(null); pendingDirsRef.current.clear(); loadDir(""); }, [loadDir]);
			// Manual refresh: reload each visible pane exactly once (the Set
			// dedupes the case where leftPath === rightPath). Pane paths are
			// read from REFS: with leftPath/rightPath as deps, every
			// navigation re-fired this effect and re-loaded up to 4
			// directories, invalidating the visited-listings cache that makes
			// pane switches instant.
			useEffect(() => {
				if (refreshTick > 0) {
					const targets = new Set([""]);
					if (leftPathRef.current) targets.add(leftPathRef.current);
					targets.add(rightPathRef.current);
					for (const p of targets) loadDir(p);
				}
			}, [refreshTick, loadDir]);
			// Auto-load a pane whose directory was NEVER loaded (`undefined`).
			// "loading" must NOT re-trigger: the in-flight load owns that state,
			// and a re-request here queues into pendingDirsRef — which re-runs
			// the load on settle, which re-sets "loading", which re-triggers…
			// i.e. an infinite reload loop (v0.6.3 regression: the old guard
			// silently DROPPED these duplicate calls, so the "loading" branch
			// was harmless then and a perpetual-motion fuel source now).
			useEffect(() => { if (dirs[rightPath] === undefined) loadDir(rightPath, { ensure: true }); }, [rightPath, dirs, loadDir]);
			// Left pane auto-load: external open requests set leftPath to the
			// file's grandparent directory (never loaded on its own) — without
			// this, that pane would show "加载中…" forever.
			useEffect(() => { if (leftPath === null) return; if (dirs[leftPath] === undefined) loadDir(leftPath, { ensure: true }); }, [leftPath, dirs, loadDir]);

			const parentOf = (p) => { const i = p.lastIndexOf("/"); return i === -1 ? "" : p.slice(0, i); };
			const baseName = (p) => p === "" ? "" : p.split("/").pop();

			// Double-click a folder in pane `panePath` → cascade: the pane's list
			// moves to the left, the folder's contents become the right list.
			const openDir = useCallback((panePath, entryPath) => {
				previewSeqRef.current++;
				setPreview(null);
				setSel(entryPath);
				setSelSet({});   // a new directory is a new selection
				if (panePath === rightPath) {          // entered from the right (or single) list
					setLeftPath(rightPath);
					setRightPath(entryPath);
				} else if (panePath === leftPath) {    // entered from the left list → drill down
					setLeftPath(panePath);
					setRightPath(entryPath);
				} else {                                // entered from single list
					setLeftPath(panePath);
					setRightPath(entryPath);
				}
			}, [leftPath, rightPath]);

			// Double-click a file → preview expands right; the list it was in
			// becomes the left pane (even from the single root list).
			// previewSeqRef: the read is async — a newer open must win over a
			// slower older one (double-click A then B could land B then A and
			// leave the header saying B while the body shows A).
			const openPreview = useCallback(async (panePath, entryPath, abs = null) => {
				const seq = ++previewSeqRef.current;
				// Whole body is wrapped: a throw in the pre-await sync code
				// (classifyOf / split / setState) or the media branch must NOT
				// become an unhandled rejection — the openReq effect calls this
				// fire-and-forget, and an escaped rejection crashes DSH web.
				try {
					setBrowseError(null);
					// Narrow drill-down: opening a preview switches to the
					// preview screen (the list screen comes back via 返回).
					if (narrowStore.get()) setMobilePane("preview");
					const kind = classifyOf(entryPath);
					const name = entryPath.split("/").pop();
					const identity = { path: entryPath, name, seq, ...(abs ? { abs } : {}) };
					setLeftPath(panePath); setRightPath(panePath);   // preview actions belong to the displayed directory
					if (kind === "image" || kind === "pdf") {
						// Media preview: no text read at all — the media view fetches
						// base64 via readBlob and owns a blob URL.
						setPvMode("preview");
						setPreview({ ...identity, text: "", truncated: false, binary: true, size: null, kind, mime: MIME_FROM_EXT[extOf(entryPath)] });
						return;
					}
					// Load editor assets alongside I/O instead of after it.
					if (kind === "code") ensureMonaco().catch(() => {});
					setPreview({ ...identity, kind, loading: true });
					const v = await gitRpc(abs ? "readPath" : "read", { repo: cwd, path: abs || entryPath });
					if (seq !== previewSeqRef.current || !mounted.current) return;   // a newer open (or unmount) won
					const effKind = v.binary ? "binary" : kind;
					const lang = LANG_FROM_EXT[extOf(entryPath)] || "js";
					setPvMode(defaultModeOf(effKind));
					setPreview({ ...identity, text: v.text, truncated: v.truncated, binary: v.binary, size: v.size, kind: effKind, lang });
				} catch (err) { if (seq === previewSeqRef.current && mounted.current) { setPreview(null); if (abs) setExtOpen({ abs }); setBrowseError(err?.message ?? String(err)); } }
			}, [cwd]);

			// Closing the preview: if it was opened from the single list, the list
			// was promoted to the left pane (leftPath === rightPath, both the same
			// directory) — collapse back to a single list instead of mirroring it.
			const closePreview = useCallback(() => {
				previewSeqRef.current++;
				setPreview(null);
				setLeftPath((lp) => (lp !== null && lp === rightPath ? null : lp));
			}, [rightPath]);
			const openSystemPath = useCallback(async (abs, rel) => {
				try { await rpc("api", "session/openWorkspacePath", { args: { request: { path: abs } } }); }
				catch (err) {
					// DSH's Windows native opener can fail resolving Explorer through
					// PATH. Only that exact host failure may fall back, and only for a
					// workspace-relative file that the sidecar checks again.
					if (!rel || err.code !== "gateway/internal" || err.message !== "path open failed") throw err;
					await gitRpc("openFile", { repo: cwd, path: rel });
				}
			}, [cwd]);
			const openInEditor = useCallback(async (rel) => {
				try { await openSystemPath(`${cwd.replace(/[\\/]+$/, "")}/${rel}`, rel); }
				catch (err) { setBrowseError(err.message); }
			}, [cwd, openSystemPath]);
			// Absolute preview paths may still point inside this workspace; convert
			// only those to the sidecar's relative-only open contract. Windows paths
			// compare case-insensitively, while POSIX paths remain case-sensitive.
			const workspaceRelOf = useCallback((abs) => {
				let root = String(cwd ?? "").replace(/\\/g, "/");
				if (root.length > 1) root = root.replace(/[\\/]+$/, "");
				if (!root) return null;
				const target = String(abs ?? "").replace(/\\/g, "/");
				const insensitive = /^[a-zA-Z]:/.test(root) || root.startsWith("//");
				const prefix = root.endsWith("/") ? root : `${root}/`;
				const targetKey = insensitive ? target.toLowerCase() : target;
				const prefixKey = insensitive ? prefix.toLowerCase() : prefix;
				return targetKey.startsWith(prefixKey) ? target.slice(prefix.length) || null : null;
			}, [cwd]);
			// System-open an ABSOLUTE path (used for files previewed from outside
			// the workspace, where the cwd-relative form is meaningless).
			const openInEditorAbs = useCallback(async (abs) => {
				try { await openSystemPath(abs, workspaceRelOf(abs)); }
				catch (err) { setBrowseError(err.message); }
			}, [openSystemPath, workspaceRelOf]);
			// Row quick actions: absolute-path helpers shared by copy/open.
			const absOf = useCallback((rel) => `${cwd.replace(/[\\/]+$/, "")}/${rel.replace(/^\/+/, "")}`, [cwd]);
			const openDirectory = useCallback(async (rel) => {
				setBrowseError(null);
				try {
					try { await rpc("api", "session/openWorkspacePath", { args: { request: { path: absOf(rel) } } }); }
					catch (err) {
						// DSH 0.2's Windows opener resolves Explorer through PATH.
						// Only its native internal failure is eligible for fallback;
						// authentication, invalid paths and cancellation stay final.
						if (err.code !== "gateway/internal" || err.message !== "path open failed") throw err;
						await gitRpc("openDirectory", { repo: cwd, path: rel });
					}
				} catch (err) { setBrowseError(err.message); }
			}, [cwd, absOf]);
			// Open the entry's folder in the system file explorer (for a file:
			// its parent directory; for a directory: itself).
			const onOpenFolder = useCallback(async (rel, isDir) => {
				await openDirectory(isDir ? rel : parentOf(rel));
			}, [openDirectory]);
			const onCopyPath = useCallback((rel, isDir) => copyText(absOf(rel)), [absOf]);
			const onCopyName = useCallback((name) => copyText(name), []);

			// ── upload / download / batch export flows ──────────────────────────
			// Resolve the pending overwrite card exactly once (also on unmount).
			const finishOverwrite = useCallback((v) => {
				setOverwriteAsk(null);
				const resolve = overwriteResolveRef.current;
				overwriteResolveRef.current = null;
				resolve?.(v);
			}, []);
			useEffect(() => () => { overwriteResolveRef.current?.(false); }, []);
			const askOverwrite = useCallback((name) => new Promise((resolve) => {
				overwriteResolveRef.current = resolve;
				setOverwriteAsk({ name });
			}), []);
			// Active-transfer cancel registry: several transfers CAN be alive
			// at once (an upload running while a download starts), and the old
			// single-slot abortRef let each new transfer orphan the previous
			// one's canceler (upload became uncancellable, its progress row
			// was silently swallowed). Each flow registers its canceler and
			// removes it on settle; the busy row's 取消 aborts everything
			// still registered.
			const cancelsRef = useRef(new Set());
			const registerCancel = useCallback((myCancel) => {
				cancelsRef.current.add(myCancel);
				return () => { cancelsRef.current.delete(myCancel); };
			}, []);
			const cancelBusy = useCallback(() => {
				for (const fn of cancelsRef.current) {
					try { fn(); } catch { /* already gone */ }
				}
				cancelsRef.current.clear();
				setBusyRow(null);
			}, []);

			// Download one file (row menu / preview header). Cancelable via the
			// status row; aborts surface silently.
			const downloadStart = useCallback(async (params, name) => {
				const controller = new AbortController();
				const myCancel = () => controller.abort();
				const unregister = registerCancel(myCancel);
				setBusyRow({ kind: "download", text: t("file.downloading", { name }), pct: null });
				try {
					await downloadFile({ repo: cwd, ...params, name, signal: controller.signal });
				} catch (err) {
					if (err?.name !== "AbortError") setBrowseError(t("file.downloadFailRow", { msg: String(err?.message ?? err) }));
				} finally {
					unregister();
					setBusyRow((b) => (b && b.kind === "download" ? null : b));
				}
			}, [cwd, registerCancel]);
			const onDownload = useCallback((rel, name) => downloadStart({ path: rel }, name), [downloadStart]);
			const onDownloadAbs = useCallback((abs, name) => downloadStart({ abs }, name), [downloadStart]);

			// Build + download a zip. Returns true on success (the batch-export
			// bar exits multi mode only then). The busy-row 取消 aborts the
			// download half (the sidecar build is bounded by caps and finishes
			// on its own — its result is simply discarded when cancelled).
			const exportStart = useCallback(async (paths, name) => {
				if (paths.length === 0) return false;
				const controller = new AbortController();
				const myCancel = () => controller.abort();
				const unregister = registerCancel(myCancel);
				setBusyRow({ kind: "export", text: t("file.exporting", { count: paths.length }), pct: null });
				try {
					await exportZipDownload({ repo: cwd, paths, name, signal: controller.signal });
					return true;
				} catch (err) {
					if (err?.name === "AbortError") return false;   // user cancel: silent
					setBrowseError(t("file.exportFailRow", { msg: String(err?.message ?? err) }));
					return false;
				} finally {
					unregister();
					setBusyRow((b) => (b && b.kind === "export" ? null : b));
				}
			}, [cwd, registerCancel]);
			const onDownloadZip = useCallback((rel, name) => exportStart([rel], `${name}.zip`), [exportStart]);

			// Multi-select mode.
			const toggleMulti = useCallback(() => {
				setMultiMode((v) => !v);
				setSelSet({});   // entering or leaving both start from a clean set
			}, []);
			const exitMulti = useCallback(() => { setMultiMode(false); setSelSet({}); }, []);
			const toggleSel = useCallback((entry) => {
				setSelSet((set) => {
					const next = { ...set };
					if (next[entry.path]) delete next[entry.path];
					else next[entry.path] = entry;
					return next;
				});
			}, []);
			const selectAllCurrent = useCallback(() => {
				const entries = dirs[rightPath];
				if (!Array.isArray(entries)) return;
				const next = {};
				for (const e of entries) { if (e.name === ".git") continue; next[e.path] = e; }
				setSelSet(next);
			}, [dirs, rightPath]);
			// Select-all is a TOGGLE: the button label flips to "取消全选" once the
			// whole directory is selected, mirroring the change list in ui.js.
			// Without it the only way out of a select-all was unticking rows one
			// by one (reported bug).
			const clearSel = useCallback(() => setSelSet({}), []);
			const selectableEntries = Array.isArray(dirs[rightPath]) ? dirs[rightPath].filter((e) => e.name !== ".git") : [];
			const selCount = Object.keys(selSet).length;
			const allSelected = selectableEntries.length > 0 && selectableEntries.every((e) => selSet[e.path]);
			const exportSelected = useCallback(async () => {
				const done = await exportStart(Object.keys(selSet), "");
				if (done) exitMulti();
			}, [selSet, exportStart, exitMulti]);

			// ── delete (row menu + multi-select) ────────────────────────────────
			// Disk removal is irreversible, so it always passes the danger dialog
			// first. The sidecar op (`delete`) is workspace-relative and
			// containment-checked; a tracked file simply shows up as a deletion in
			// git status afterwards (no `git rm` — the file is gone from disk).
			const deleteEntries = useCallback(async (list) => {
				let done = 0;
				let failed = null;
				for (const entry of list) {
					// `cancelable:false` hides the status row's cancel button: the
					// sidecar delete has no abort plumbing, and a cancel button that
					// does nothing is worse than none.
					setBusyRow({ kind: "delete", text: t("file.deleting", { name: entry.name }), pct: null, cancelable: false });
					try {
						// eslint-disable-next-line no-await-in-loop
						await gitRpc("delete", { repo: cwd, path: entry.path });
						done += 1;
					} catch (err) {
						failed = err;
						break;
					}
				}
				setBusyRow((b) => (b && b.kind === "delete" ? null : b));
				if (failed) setBrowseError(t("file.deleteFail", { msg: String(failed?.message ?? failed) }));
				if (done > 0) {
					// Silent refresh: the rows reconcile in place instead of the pane
					// flipping to its loading card; onEdited() then refreshes git
					// status so the removed entry stops showing as a change.
					if (multiMode) exitMulti();
					await loadDir(rightPath, { silent: true });
					if (typeof onEdited === "function") onEdited();
				}
			}, [cwd, t, loadDir, rightPath, onEdited, multiMode, exitMulti]);

			// Ask first, then delete. One entry or the whole selection.
			const askDelete = useCallback((entries) => {
				const list = (Array.isArray(entries) ? entries : [entries]).filter(Boolean);
				if (list.length === 0) return;
				const many = list.length > 1;
				const hasDir = list.some((e) => e.type === "dir");
				setDelConfirm({
					title: many ? t("file.deleteTitleMany", { count: list.length }) : t("file.deleteTitle", { name: list[0].name }),
					message: many ? t("file.deleteMsgMany") : (hasDir ? t("file.deleteMsgDir") : t("file.deleteMsg")),
					confirmLabel: t("file.delete"),
					danger: true,
					onConfirm: () => { void deleteEntries(list); }
				});
			}, [t, deleteEntries]);

			// Upload: hidden file input → sequential uploads into the current
			// directory. Existing targets ask once (覆盖 / 取消); the batch
			// stops at the first real failure.
			const pickFiles = useCallback(() => fileInputRef.current?.click(), []);
			// The upload flow needs a REF (uploadFile reads signalRef.current
			// per chunk), so it gets its own slot — separate from the download
			// registry so a concurrent download can't be swallowed by it.
			const uploadAbortRef = useRef(null);
			const onFilesPicked = useCallback((fileList) => {
				const files = Array.from(fileList ?? []);
				if (files.length === 0) return;
				void (async () => {
					let okCount = 0;
					let lastError = null;
					const myCancel = () => { try { uploadAbortRef.current?.(); } catch { /* already gone */ } };
					const unregister = registerCancel(myCancel);
					for (const file of files) {
						// Existence probe (the stat endpoint takes an absolute
						// path); a missing/unreadable target just means absent —
						// the upload itself surfaces real failures.
						let exists = false;
						try {
							const s = await gitRpc("stat", { repo: cwd, path: absOf(rightPath ? `${rightPath}/${file.name}` : file.name) });
							exists = s?.type === "file";
						} catch { exists = false; }
						if (exists) {
							// eslint-disable-next-line no-await-in-loop
							const overwrite = await askOverwrite(file.name);
							if (!overwrite) continue;
						}
						try {
							setBusyRow({ kind: "upload", text: t("file.uploading", { name: file.name, pct: 0 }), pct: 0 });
							// eslint-disable-next-line no-await-in-loop
							await uploadFile({
								repo: cwd,
								dirRel: rightPath,
								file,
								overwrite: exists,
								onProgress: (pct) => setBusyRow((b) => (b && b.kind === "upload" ? { ...b, pct, text: t("file.uploading", { name: file.name, pct }) } : b)),
								signalRef: uploadAbortRef
							});
							okCount++;
						} catch (err) {
							if (/aborted/i.test(String(err?.message ?? err))) break;
							lastError = err;
							break;
						}
					}
					unregister();
					uploadAbortRef.current = null;
					setBusyRow((b) => (b && b.kind === "upload" ? null : b));
					if (lastError) setBrowseError(t("file.uploadFailRow", { msg: String(lastError?.message ?? lastError) }));
					if (okCount > 0) {
						// Silent: the uploaded rows appear in place (stable keys) instead
						// of the pane flipping to a loading card and rebuilding the
						// whole listing — the reported "上传后列表全部刷新" jank.
						loadDir(rightPath, { silent: true });
						if (typeof onEdited === "function") onEdited();
					}
				})();
			}, [cwd, rightPath, absOf, askOverwrite, loadDir, onEdited, registerCancel]);

			// Consume an external open request: navigate to the file's directory
			// and open a preview. Defined here (after loadDir/openPreview) so the
			// dependency array never touches a const before initialization.
			useEffect(() => {
				// Whole body is wrapped: a throw in the path math / setState
				// here would otherwise become an unhandled error escaping the
				// panel boundary (the openReq effect runs as a passive effect;
				// fire-and-forget async inside it must never reject uncaught).
				try {
					if (!openReq || openReq.ts === lastOpenReqTs.current) return;
					lastOpenReqTs.current = openReq.ts;
					const abs = String(openReq.path || "").trim();
					if (!abs) return;
					const normCwd = cwd.replace(/[\\/]+$/, "");
					const absSlash = abs.replace(/\\/g, "/");
					const cwdSlash = normCwd.replace(/\\/g, "/");
					const absLower = absSlash.toLowerCase();
					const cwdLower = cwdSlash.toLowerCase();
					if (absLower === cwdLower) return; // the workspace root itself
					if (absLower.startsWith(cwdLower + "/")) {
						const rel = absSlash.slice(cwdSlash.length).replace(/^\/+/, "");
						if (!rel) return;
						const dir = parentOf(rel);
						setExtOpen(null);
						setBrowseError(null);
						setSelSet({});   // external open = navigation: selection resets
						if (dir === "") { setLeftPath(null); setRightPath(""); }
						else { setLeftPath(parentOf(dir)); setRightPath(dir); }
						loadDir(dir);
						// Fire-and-forget: attach .catch so a rejected preview
						// (locked/being-written file, etc.) never surfaces as
						// an unhandled rejection that crashes DSH web.
						openPreview(dir, rel).catch((e) => setBrowseError(e?.message ?? String(e)));
					} else {
						// File outside the current workspace: read it via the
						// absolute-path endpoint and preview inline; on failure
						// fall back to the hint bar with a system-open button.
						setExtOpen(null);
						setBrowseError(null);
						// Give the preview a left pane (the workspace root) so the
						// split grid renders two real panes — without a leftPath the
						// 3-column grid would get only the gutter + preview children
						// and the preview would collapse into the 8px gutter column.
						setLeftPath((lp) => (lp === null ? "" : lp));
						// Narrow drill-down: the external preview opens on the
						// preview screen too (a failed read leaves preview null
						// and the render falls back to the list + error bar).
						if (narrowStore.get()) setMobilePane("preview");
						const fname = absSlash.split("/").pop() || abs;
						openPreview("", fname, abs);
					}
				} catch (err) { setBrowseError(err?.message ?? String(err)); }
			}, [openReq, cwd, loadDir, openPreview]);

			// The list toolbar shows directories only; the preview owns the file
			// name and its full-path tooltip (including external files).
			const navTo = useCallback((target) => {
				previewSeqRef.current++;
				setPreview(null);
				setSelSet({});   // a new directory is a new selection
				if (target === "") { setLeftPath(null); setRightPath(""); }
				else { setLeftPath(parentOf(target)); setRightPath(target); }
			}, []);
			useEffect(() => {
				if (!rootNavigationRef) return;
				rootNavigationRef.current = navTo;
				return () => { if (rootNavigationRef.current === navTo) rootNavigationRef.current = null; };
			}, [rootNavigationRef, navTo]);
			const segs = rightPath === "" ? [] : rightPath.split("/");
			// Keep the workspace root and the two nearest directory levels visible.
			// Older levels remain reachable from the ellipsis menu.
			const hiddenCrumbs = segs.length > 2
				? segs.slice(0, -2).map((name, i) => ({ name, path: segs.slice(0, i + 1).join("/") }))
				: [];
			useEffect(() => {
				if (hiddenCrumbs.length === 0 && crumbMenuPos) setCrumbMenuPos(null);
			}, [hiddenCrumbs.length, crumbMenuPos]);
			const visibleSegs = hiddenCrumbs.length
				? segs.slice(-2).map((name, i) => ({ name, index: segs.length - 2 + i }))
				: segs.map((name, index) => ({ name, index }));
			const crumbs = h("div", { className: "dgp-crumbs dgp-crumbsInline" },
				h(React.Fragment, null,
						hiddenCrumbs.length ? h(React.Fragment, null,
							h("span", { className: "dgp-crumbSep" }, "/"),
							h("button", {
								type: "button", className: "dgp-crumb dgp-crumbEllipsis",
								title: hiddenCrumbs.map((c) => c.path).join(" / "),
								"aria-label": t("file.morePath"),
								"aria-haspopup": "menu", "aria-expanded": crumbMenuPos ? "true" : "false",
								onClick: (e) => {
									if (crumbMenuPos) { setCrumbMenuPos(null); return; }
									const r = e.currentTarget.getBoundingClientRect();
									setCrumbMenuPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4) });
								}
							}, "…")
						) : null,
						visibleSegs.map(({ name, index }) => h(React.Fragment, { key: index },
							h("span", { className: "dgp-crumbSep" }, "/"),
							h("button", { className: "dgp-crumb" + (index === segs.length - 1 ? " dgp-crumbActive" : ""), onClick: () => navTo(segs.slice(0, index + 1).join("/")), title: segs.slice(0, index + 1).join("/") }, h("span", { className: "dgp-crumbLabel" }, name))
						))
					)
			);
			const crumbMenu = crumbMenuPos && hiddenCrumbs.length > 0 ? portal(
				h("div", { className: "dgp-crumbMenu", role: "menu", "aria-label": t("file.morePath"), style: { left: crumbMenuPos.left, top: crumbMenuPos.top } },
					hiddenCrumbs.map((item) => h("button", { key: item.path, type: "button", className: "dgp-crumbMenuItem", role: "menuitem", title: item.path, onClick: () => { setCrumbMenuPos(null); navTo(item.path); } },
						h(IconFolderOpen, { size: 13 }),
						h("span", { className: "dgp-crumbMenuLabel" }, item.path)))
				), document.querySelector(".dgp-root")) : null;

			// Prepare only the visible pane listings, and only when their directory
			// data or filter changes. Selection/preview state updates no longer
			// refilter thousands of names on every click.
			const visibleListings = useMemo(() => {
				const listings = new Map();
				const paths = new Set([rightPath]);
				if (leftPath !== null) paths.add(leftPath);
				const q = query.trim().toLowerCase();
				for (const path of paths) {
					const entries = dirs[path];
					if (!Array.isArray(entries)) continue;
					const items = [];
					for (const entry of entries) {
						if (entry.name === ".git" || (q && !entry.name.toLowerCase().includes(q))) continue;
						items.push(entry);
					}
					listings.set(path, { items });
				}
				return listings;
			}, [dirs, leftPath, rightPath, query]);

			// One list pane (folders first, then files). Single click selects,
			// double click on a folder drills in, on a file previews.
			const renderList = (path) => {
				const entries = dirs[path];
				if (entries === undefined || entries === "loading") return h("div", { className: "dgp-paneEmpty" }, t("common.loading"));
				// A FAILED load (repo vanished, transport error): show a retry
				// card instead of a silently empty directory (auto-load only
				// triggers on `undefined`, so this needs an explicit way out).
				if (entries === "error") return h("div", { className: "dgp-paneEmpty" },
					h("span", { style: { marginBottom: 8 } }, t("file.loadFailed")),
					h("button", { type: "button", className: "dgp-lbtn", onClick: () => loadDir(path) }, t("common.retry"))
				);
				const listing = visibleListings.get(path);
				const items = listing?.items || [];
				const row = (entry) => h(FileRow, { key: entry.path, entry, path, selected: sel === entry.path, opened: entry.type === "dir" && (rightPath === entry.path || rightPath.startsWith(entry.path + "/")), badgeKind: statusBadges.get(entry.path), tapOpens: narrow, checkable: multiMode, checked: !!selSet[entry.path], onSelect: setSel, onToggle: toggleSel, onOpenDir: openDir, onOpenPreview: openPreview, onOpenFolder, onCopyPath, onCopyName, onDownload, onDownloadZip, onDelete: askDelete });
				return h(React.Fragment, null,
					h("div", { className: "dgp-fileCard" },
						items.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("common.emptyDir")) : h(WindowedList, { key: path, className: "dgp-fileRows", items, rowHeight: 32, renderItem: row, itemKey: (entry) => entry.path })
					)
				);
			};

			useEffect(() => { setPvEdit(false); setEditErr(null); }, [preview?.seq]);
			useEffect(() => {
				setPvCopyStatus(null);
				return () => clearTimeout(pvCopyTimerRef.current);
			}, [preview]);
			const sourceView = pvMode === "source" || preview?.kind === "text";
			const needsEditor = !!preview && !preview.loading && !preview.binary &&
				(pvEdit || (preview.kind === "code" && !sourceView) || (sourceView && expensivePreviewText(preview.text || "")));
			const editorInput = {
				value: (preview?.text || "") + (sourceView && preview?.truncated ? t("file.truncatedNote") : ""), path: preview?.name,
				readOnly: !pvEdit, plainText: sourceView && !pvEdit
			};
			const editorInputRef = useRef(editorInput); editorInputRef.current = editorInput;
			// Toggle readOnly instead of rebuilding the model; never serialize on input.
			useEffect(() => {
				if (!needsEditor || !editorHostRef.current) { setEditBusy(false); return; }
				const controller = new AbortController();
				setEditBusy(true); setEditErr(null);
				mountMonacoEditor(editorHostRef.current, { ...editorInputRef.current, signal: controller.signal }).then((ed) => {
					if (controller.signal.aborted) { ed.dispose(); return; }
					try { ed.update(editorInputRef.current); } catch (err) { ed.dispose(); throw err; }
					editorRef.current = ed;
					setEditBusy(false);
				}).catch((err) => {
					if (controller.signal.aborted) return;
					setEditErr(err?.message ?? String(err)); setEditBusy(false);
				});
				return () => {
					controller.abort();
					editorRef.current?.dispose(); editorRef.current = null;
				};
			}, [needsEditor, preview?.seq, pvCmTick]);
			useEffect(() => {
				editorRef.current?.update(editorInputRef.current);
			}, [preview?.text, preview?.truncated, pvEdit, sourceView, t]);
			// Save the edited content back to disk. Works for workspace-relative
			// paths (containment-checked by the host) and absolute paths for
			// files outside the workspace. On success the preview text is
			// refreshed and the parent is told to re-pull git status.
			const saveEdit = useCallback(async () => {
				const view = editorRef.current;
				const p = preview;
				if (!view || !p) return;
				const content = view.getValue();
				const seq = previewSeqRef.current;
				setEditBusy(true);
				setEditErr(null);
				try {
					const payload = p.abs ? { repo: cwd, abs: p.abs, content } : { repo: cwd, path: p.path, content };
					await gitRpc("write", payload);
					if (typeof onEdited === "function") onEdited();
					if (!mounted.current || seq !== previewSeqRef.current) return;
					setPreview((prev) => (prev && prev.path === p.path && prev.abs === p.abs ? { ...prev, text: content, size: new TextEncoder().encode(content).length, truncated: false } : prev));
					setPvEdit(false);
				} catch (err) {
					if (mounted.current && seq === previewSeqRef.current) setEditErr(err.message);
				} finally {
					if (mounted.current && seq === previewSeqRef.current) setEditBusy(false);
				}
			}, [preview, cwd, onEdited]);
			const cancelEdit = useCallback(() => { setPvEdit(false); setEditErr(null); }, []);
			const copyPreviewContent = useCallback(async () => {
				const p = preview;
				if (!p || p.binary || typeof p.text !== "string") return;
				const content = pvEdit ? (editorRef.current?.getValue() ?? p.text) : p.text;
				const ok = await copyText(content);
				setPvCopyStatus(ok ? "copied" : "failed");
				clearTimeout(pvCopyTimerRef.current);
				pvCopyTimerRef.current = window.setTimeout(() => setPvCopyStatus(null), 1200);
			}, [preview, pvEdit]);
			// Warm independently of the search index, after the initial list settles.
			useEffect(() => {
				const ric = typeof window.requestIdleCallback === "function";
				const run = () => { ensureMonaco().catch(() => {}); };
				const handle = ric ? window.requestIdleCallback(run, { timeout: 1500 }) : window.setTimeout(run, 1200);
				return () => { if (ric) window.cancelIdleCallback(handle); else window.clearTimeout(handle); };
			}, [cwd]);
			// Markdown preview uses a chunked async pipeline: a large
			// document would otherwise render synchronously inside useMemo and
			// freeze the whole panel (double-click → minutes of nothing). The
			// source is split at SAFE top-level boundaries only — never inside
			// a fenced code block (inFence tracking), and only at a blank line
			// once the chunk has enough lines — so every chunk renders exactly
			// the same blocks the whole-document pass would produce. Each
			// finished chunk keeps its own HTML element: content streams in
			// top-down and a thin progress bar shows pct.
			useEffect(() => {
				if (!preview || preview.loading || pvEdit || preview.kind !== "md" || pvMode !== "preview") { setMdRendered(null); return; }
				let alive = true;
				setMdRendered({ seq: preview.seq, blocks: [], pct: 0 });
				const lines = (preview.text || "").replace(/\r\n/g, "\n").split("\n");
				if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) { setMdRendered({ seq: preview.seq, blocks: [], pct: 100 }); return; }
				const CHUNK_LINES = 300;
				const chunks = [];
				let cur = [];
				let inFence = false;
				for (const line of lines) {
					if (/^\s*```/.test(line)) inFence = !inFence;
					cur.push(line);
					if (!inFence && line.trim() === "" && cur.length >= CHUNK_LINES) { chunks.push(cur.join("\n")); cur = []; }
				}
				if (cur.length) chunks.push(cur.join("\n"));
				const blocks = [];
				let k = 0;
				const step = () => {
					if (!alive) return;
					blocks.push(h("div", { key: k, className: "dgp-mdChunk", dangerouslySetInnerHTML: { __html: renderMarkdown(chunks[k]) } }));
					k++;
					setMdRendered({ seq: preview.seq, blocks: blocks.slice(), pct: Math.round((k / chunks.length) * 100) });
					if (k < chunks.length) timer = setTimeout(step, 0);
				};
				let timer = setTimeout(step, 0);
				return () => { alive = false; clearTimeout(timer); };
			}, [preview, pvMode, pvEdit]);
			const previewBody = useMemo(() => {
				if (!preview) return null;
				const p = preview;
				if (p.loading) return { kind: "loading" };
				// Media kinds always render (no mode switch, no text pipeline).
				if (p.kind === "image" || p.kind === "pdf") return { kind: p.kind };
				if (p.kind === "html") {
					// Preview mode renders the HTML in a sandboxed iframe (opaque
					// origin, scripts allowed); source mode falls through to the
					// plain-text branch below.
					if (pvMode === "preview") return { kind: "html", text: p.text || "" };
					return { kind: "text", text: (p.text || "") + (p.truncated ? t("file.truncatedNote") : "") };
				}
				if (p.kind === "binary") return { kind: "binary" };
				if (pvMode === "source") {
					const note = p.truncated ? t("file.truncatedNote") : "";
					return { kind: "text", text: (p.text || "") + note };
				}
				if (p.kind === "md") return { kind: "md", blocks: mdRendered?.seq === p.seq ? mdRendered.blocks : [], pct: mdRendered?.seq === p.seq ? mdRendered.pct : 0 };
				if (p.kind === "code") return { kind: "code" };
				return { kind: "text", text: p.text || "" };
			}, [preview, pvMode, mdRendered, t]);

			const previewView = () => {
				const p = preview;
				let body;
				if (!previewBody) return null;
				if (previewBody.kind === "loading") {
					body = h("div", { className: "dgp-paneEmpty" }, t("pv.loadingPreview"));
				} else if (needsEditor) {
					// Keep this host at the same reconciliation position in both modes.
					body = h(React.Fragment, null,
						editErr ? h("div", { className: "dgp-error" },
							h("span", { style: { flex: 1 } }, pvEdit ? editErr : t("pv.editFail", { msg: editErr })),
							lbtn(t("common.retry"), () => { setEditErr(null); setPvCmTick((n) => n + 1); }, { tone: "default" })) : null,
						h("div", { className: "dgp-editorHost", ref: editorHostRef },
							editBusy && !editorRef.current ? h("div", { className: "dgp-paneEmpty" }, t("pv.loadingEditor")) : null,
							editErr && !pvEdit ? h("pre", { className: "dgp-pre" }, preview.text || "") : null));
				} else if (previewBody.kind === "binary") {
					body = h("div", { className: "dgp-paneEmpty" }, t("file.binary"));
				} else if (previewBody.kind === "image" || previewBody.kind === "pdf") {
					// Media (image / PDF): MediaView fetches base64 → blob URL.
					body = h(MediaView, { cwd, p, onUrl: setMediaUrl });
				} else if (previewBody.kind === "html") {
					// Scripts MUST run: a standalone page builds its content (and
					// often its theme) from inline JS, so sandbox="" rendered an
					// empty shell. `allow-scripts` keeps the document in an OPAQUE
					// origin — the page's JS runs, while a compromised HTML file
					// still cannot reach the panel, the DSH app or its storage.
					// Deliberately NO `allow-same-origin`: with it, a srcdoc/blob
					// document inherits THIS page's origin and could read the
					// session. Consequence: same-origin APIs (localStorage,
					// relative fetch) stay unavailable — that is the price of the
					// boundary, not a bug. `allow-modals` lets alert/confirm/print
					// work instead of failing silently; forms and popups stay
					// blocked (a preview must not POST or spawn windows).
					body = h("iframe", { className: "dgp-htmlFrame", srcDoc: withHtmlPrelude(previewBody.text), sandbox: "allow-scripts allow-modals", title: p.name });
				} else if (previewBody.kind === "md") {
					// Chunked rendering: nothing done yet → centered hint with
					// percent; partial/done → content (streams top-down) with a
					// thin progress bar pinned above it until 100%.
					body = previewBody.blocks.length === 0 && previewBody.pct < 100
						? h("div", { className: "dgp-paneEmpty" }, h(IconLoading, { size: 16 }), h("span", { style: { marginLeft: 8 } }, t("pv.renderMd", { pct: previewBody.pct })))
						: h(React.Fragment, null,
							previewBody.pct < 100 ? h("div", { className: "dgp-mdProg", role: "progressbar", "aria-valuenow": previewBody.pct, "aria-valuemin": 0, "aria-valuemax": 100 },
								h("div", { className: "dgp-mdProgBar", style: { width: `${previewBody.pct}%` } })) : null,
							h("div", { className: "dgp-md" }, previewBody.blocks)
						);
				} else {
					body = h("pre", { className: "dgp-pre" }, previewBody.text);
				}
				const editable = !p.loading && !p.binary && !p.truncated;
				const copyTitle = pvCopyStatus === "copied" ? t("file.copied")
					: pvCopyStatus === "failed" ? t("pv.copyFailed")
						: p.truncated ? t("pv.copyContentTruncatedTitle") : t("pv.copyContentTitle");
				const isFrame = !pvEdit && (previewBody.kind === "pdf" || previewBody.kind === "html");
				const modeItems = [
					{ label: t("pv.preview"), icon: IconEye, checked: pvMode === "preview", run: () => setPvMode("preview") },
					{ label: t("pv.source"), icon: IconCode, checked: pvMode === "source", run: () => setPvMode("source") }
				];
				const fileItems = [
					{ label: t("file.download"), icon: IconDownload, run: () => p.abs ? onDownloadAbs(p.abs, p.name) : onDownload(p.path, p.name) },
					!p.binary && typeof p.text === "string" ? { label: t("pv.copyContent"), title: copyTitle, icon: IconCopy, run: copyPreviewContent } : null,
					(p.kind === "html" || ((p.kind === "image" || p.kind === "pdf") && mediaUrl)) ? { label: t("pv.openBrowser"), icon: IconExternalLink, run: () => {
						if (p.kind === "html") { p.abs ? openInEditorAbs(p.abs) : openInEditor(p.path); return; }
						window.open(mediaUrl, "_blank");
					} } : null,
					!narrow ? { label: t("pv.openEditor"), icon: IconRightUp, run: () => p.abs ? openInEditorAbs(p.abs) : openInEditor(p.path) } : null,
					narrow && SWITCHABLE_KINDS.has(p.kind) && !pvEdit ? modeItems[0] : null,
					narrow && SWITCHABLE_KINDS.has(p.kind) && !pvEdit ? modeItems[1] : null,
					narrow ? { label: t("file.searchDir"), icon: IconSearch, run: () => setSearchOpen(true) } : null,
					{ label: t("pv.closePreview"), icon: IconClose, run: closePreview }
				];
				return { toolbar: h("div", { className: "dgp-pageToolbar dgp-fileToolbar", "data-editing": pvEdit ? "true" : "false" },
						narrow ? lbtn(null, () => setMobilePane("list"), { tone: "default", title: t("common.back"), ariaLabel: t("common.back"), icon: h(IconArrowLeft, { size: 14 }) }) : null,
						h("div", { className: "dgp-fileContext" }, directoryContext(rightPath, p, !narrow, false)),
						pageNavigation ? h("span", { className: "dgp-toolbarDivider", "aria-hidden": "true" }) : null,
						pageNavigation,
						h("div", { className: "dgp-fileSearchSlot", "data-open": searchOpen || query ? "true" : "false" }, searchOpen || query ? searchControl() : !narrow ? searchButton() : null),
						h("div", { className: "dgp-pageActions" },
						!pvEdit && SWITCHABLE_KINDS.has(p.kind) ? h(React.Fragment, null,
							h("span", { className: "dgp-pvSwitch dgp-modeWide", role: "group", "aria-label": t("pv.modeAria") },
								lbtn(t("pv.preview"), () => setPvMode("preview"), { active: pvMode === "preview" }),
								lbtn(t("pv.source"), () => setPvMode("source"), { active: pvMode === "source", tone: "default" })),
							h(ToolbarMenu, { className: "dgp-modeCompact", label: t("pv.modeAria"), icon: pvMode === "preview" ? IconEye : IconCode, items: modeItems })) : null,
						pvEdit ? h(React.Fragment, null,
							lbtn(t("pv.save"), saveEdit, { disabled: editBusy, title: editBusy ? t("pv.saving") : t("pv.save"), icon: h(IconSave, { size: 14 }) }),
							lbtn(t("common.cancel"), cancelEdit, { tone: "default" })) :
							editable ? lbtn(t("pv.edit"), () => setPvEdit(true), { title: t("pv.editHint"), icon: h(IconEdit, { size: 14 }) }) : null,
						h(ToolbarMenu, { label: pvCopyStatus ? copyTitle : t("file.actionsTitle"), icon: pvCopyStatus === "copied" ? IconCheck : pvCopyStatus === "failed" ? IconWarning : IconEllipsis, items: fileItems, info: h(React.Fragment, null, h("div", null, p.abs || p.path), p.size != null ? h("span", { className: "dgp-hint" }, fmtSize(p.size)) : null) })
						)),
					body: h("div", { className: "dgp-previewBody" + (needsEditor ? " dgp-editBody" : "") + (isFrame ? " dgp-frameBody" : "") }, body)
				};
			};

			const split = leftPath !== null;
			// Effective left-pane share of the split (0..1); user-drag overrides default.
			// Preview default is 3:7 (list : preview); plain browsing defaults 1:1.
			const leftShare = preview ? (previewFrac ?? 0.3) : (listFrac ?? 0.5);
			const gridCols = (split || preview) ? `${leftShare.toFixed(3)}fr 8px ${(1 - leftShare).toFixed(3)}fr` : "1fr";

			// Gutter drag → resize left pane (clamped so both sides stay usable).
			const onGutterDown = useCallback((e) => {
				e.preventDefault();
				setDragging(true);
				const el = splitRef.current;
				if (!el) return;
				const isPreview = preview !== null;
				const move = (ev) => {
					const rect = el.getBoundingClientRect();
					if (rect.width <= 0) return;
					let f = (ev.clientX - rect.left) / rect.width;
					f = Math.max(0.08, Math.min(0.85, f));
					if (isPreview) setPreviewFrac(f); else setListFrac(f);
				};
				const up = () => { setDragging(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
				// pointercancel: the browser took the pointer (scroll gesture,
				// element removed mid-drag) — without this the listeners would
				// stay attached until the next drag overwrites them.
				window.addEventListener("pointercancel", up);
			}, [preview]);
			const resetSplit = useCallback(() => {
				if (preview) setPreviewFrac(null); else setListFrac(null);
			}, [preview]);

			// Whole-workspace search: when typing in the box (and the workspace
			// file index is available) the main area becomes a flat result list;
			// double-click previews the file (right pane if a preview is open).
			const q = query.trim().toLowerCase();
			const globalSearch = q !== "" && allFiles !== null;
			// Memoize the whole-workspace filter: typing filters up to 5000 paths,
			// recomputing on every keystroke would be wasteful.
			const globalResults = useMemo(
				() => (globalSearch ? allFiles.filter((p) => p.toLowerCase().includes(q)).slice(0, 200) : []),
				[globalSearch, allFiles, q]
			);
			const globalList = () => h(React.Fragment, null,
				h("div", { className: "dgp-paneTitle" }, t("file.results", { count: globalResults.length >= 200 ? "200+" : globalResults.length })),
				h("div", { className: "dgp-globalList" },
				globalResults.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("file.noMatch")) :
				globalResults.map((p) => {
						const badge = GIT_BADGES[statusBadges.get(p)];
						return h("div", { key: p, className: "dgp-row", "data-clickable": "true", "data-selected": sel === p ? "true" : "false", title: narrow ? p : `${p}\n${t("common.doubleClick")}`, onClick: () => { setSel(p); if (narrow) openPreview("", p); }, onDoubleClick: () => openPreview("", p) },
							h("span", { className: "dgp-fileIcon" }, h(iconForFile(p), { size: 15 })),
					h("span", { className: "dgp-treeName", style: { fontFamily: "var(--dgp-font-mono,var(--dsw-font-mono,ui-monospace,monospace))", fontSize: "calc(12px * var(--dgp-ui-scale, 1))" } }, p),
							badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null
						);
					})
				)
			);

			// Narrow drill-down: the preview screen (full-width preview + back)
			// replaces the split; the list screen keeps crumbs + search. Wide
			// mode renders the master-detail split exactly as before.
			const narrowPreviewScreen = narrow && preview !== null && mobilePane === "preview";
			const closeSearch = () => { setSearchOpen(false); setQuery(""); setHistOpen(false); };
			useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);
			const directoryMenu = (path) => h(ToolbarMenu, { label: t("file.directoryActions"), icon: IconChevronDown, items: [
				{ label: t("file.openFolderShort"), title: t("file.openFolder"), icon: IconFolderOpen, run: () => openDirectory(path) },
				{ label: t("file.upload"), icon: IconPaperclip, run: pickFiles },
				{ label: t("file.multi"), icon: IconListChecks, checked: multiMode, run: toggleMulti }
			] });
			const searchControl = () => h("div", { className: "dgp-searchRow" },
					h("span", { className: "dgp-searchIcon" }, h(IconSearch, { size: 13 })),
					h("input", { ref: searchInputRef, className: "dgp-search", "aria-label": allFiles ? t("file.searchAll") : t("file.searchDir"), placeholder: allFiles ? t("file.searchAll") : t("file.searchDir"), value: query,
						onChange: (e) => { setQuery(e.target.value); armSearch(); }, onFocus: () => { armSearch(); openHist(true); },
						onBlur: () => { if (query.trim()) rememberQuery(query); setTimeout(() => setHistOpen(false), 120); },
						onKeyDown: (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeSearch(); } else if (e.key === "Enter") rememberQuery(query); }, spellCheck: false }),
					lbtn(null, () => openHist(!histOpen), { title: t("common.history"), ariaLabel: t("common.history"), active: histOpen, tone: "default", icon: h(IconListPen, { size: 13 }) }),
					lbtn(null, closeSearch, { title: t("common.close"), ariaLabel: t("common.close"), tone: "default", icon: h(IconClose, { size: 13 }) })
				);
			const searchButton = () => !(searchOpen || query) ? lbtn(null, () => setSearchOpen(true), { title: allFiles ? t("file.searchAll") : t("file.searchDir"), ariaLabel: t("file.searchDir"), tone: "default", icon: h(IconSearch, { size: 14 }) }) : null;
			// The parent header supplies the workspace root. Keep the path and
			// directory actions together, then place file search after Git navigation.
			const directoryContext = (path, file = null, showDirectory = true, includeSearch = true) => h("div", { className: "dgp-directoryContext", "data-search": searchOpen || query ? "true" : "false" },
				h("div", { className: "dgp-contextPath", "data-preview": file ? "true" : "false" },
					!narrow || !file ? crumbs : null,
					file && !narrow ? h("span", { className: "dgp-crumbSep" }, "/") : null,
					file ? h("span", { className: "dgp-previewName", title: file.abs || file.path }, file.name) : null),
				h("div", { className: "dgp-contextActions" },
					showDirectory ? directoryMenu(path) : null,
					includeSearch ? (searchOpen || query ? searchControl() : showDirectory ? searchButton() : null) : null));
			const directoryToolbar = (path) => h("div", { className: "dgp-pageToolbar dgp-directoryToolbar" },
				directoryContext(path, null, true, false),
				pageNavigation ? h("span", { className: "dgp-toolbarDivider", "aria-hidden": "true" }) : null,
				pageNavigation,
				h("div", { className: "dgp-fileSearchSlot", "data-open": searchOpen || query ? "true" : "false" }, searchOpen || query ? searchControl() : searchButton()));
			const previewContent = preview ? previewView() : null;
			// Browsing, preview and search share the same single-row context.
			const pageToolbar = preview && (!narrow || narrowPreviewScreen) ? previewContent.toolbar : directoryToolbar(rightPath);
			const historyPopup = histOpen && query.trim() === "" && histPos ? portal(h("div", { className: "dgp-searchHist", style: { left: histPos.left, top: histPos.top, width: histPos.width } },
						history.length > 0 ? h(React.Fragment, null,
							h("div", { className: "dgp-searchHistHead" },
								h("span", null, t("file.recent")),
								lbtn(t("common.cleanAll"), clearHistory, { tone: "default" })
							),
							history.map((t) => h("button", { type: "button", key: t, className: "dgp-searchHistItem", title: t, onMouseDown: (e) => e.preventDefault(), onClick: () => { setQuery(t); setHistOpen(false); rememberQuery(t); } },
								h(IconSearch, { size: 12 }),
								h("span", { className: "dgp-treeName" }, t)
							))
						) : h("div", { className: "dgp-searchHistHead" }, h("span", null, t("file.noHistory")))
						), document.querySelector(".dgp-root")) : null;
			return h(React.Fragment, null,
				inPanelHeader(headerHost, pageToolbar),
				historyPopup,
				crumbMenu,
				busyRow ? h("div", { className: "dgp-noteRow" },
					h("span", { style: { flex: 1, minWidth: 0 } }, busyRow.text),
					busyRow.pct != null ? h("div", { className: "dgp-mdProg", style: { width: 140, margin: 0, flex: "none" } }, h("div", { className: "dgp-mdProgBar", style: { width: `${busyRow.pct}%`, transition: "none" } })) : null,
					busyRow.cancelable === false ? null : lbtn(t("common.cancel"), cancelBusy, { tone: "default" })
				) : null,
				multiMode ? h("div", { className: "dgp-multiBar", role: "toolbar", "aria-label": t("git.selectionActions") },
					h("div", { className: "dgp-multiSelection" },
						h("span", { className: "dgp-multiCount", "aria-live": "polite" },
							t("file.selectedCount", { count: selCount })
						),
						lbtn(allSelected ? t("git.deselectAll") : t("git.selectAll"), () => (allSelected ? clearSel() : selectAllCurrent()), {
							tone: "default", active: allSelected, disabled: busyRow !== null,
							icon: h(IconListChecks, { size: 14 })
						})
					),
					h("div", { className: "dgp-multiBarActions" },
						lbtn(t("file.exportSel"), exportSelected, { disabled: selCount === 0 || busyRow !== null, icon: h(IconDownload, { size: 14 }) }),
						lbtn(t("file.deleteSel"), () => askDelete(selectableEntries.filter((e) => selSet[e.path])), { tone: "error", disabled: selCount === 0 || busyRow !== null, icon: h(IconTrash, { size: 14 }) }),
						h("span", { className: "dgp-multiDivider", "aria-hidden": "true" }),
						lbtn(t("common.cancel"), exitMulti, { tone: "default", icon: h(IconClose, { size: 13 }) })
					)
				) : null,
				browseError ? h("div", { className: "dgp-error" }, h("span", { style: { flex: 1 } }, browseError), lbtn(t("common.close"), () => setBrowseError(null), { tone: "default" })) : null,
				extOpen ? h("div", { className: "dgp-error" },
					h("span", { style: { flex: 1 } }, `${t("file.cantPreview", { path: extOpen.abs })}`),
					lbtn(t("file.openSystem"), () => { rpc("api", "session/openWorkspacePath", { args: { request: { path: extOpen.abs } } }).catch((err) => setBrowseError(err.message)); setExtOpen(null); }),
					lbtn(t("common.close"), () => setExtOpen(null), { tone: "default" })
				) : null,
				h("div", { className: "dgp-split", ref: splitRef, "data-dragging": dragging ? "true" : "false", style: { gridTemplateColumns: (preview || (split && !globalSearch)) ? gridCols : "1fr" } },
					(preview || (split && !globalSearch)) ? h("div", { key: "left", className: "dgp-pane dgp-listPane", "data-flat": "true", hidden: narrow && (!preview || narrowPreviewScreen) }, preview && globalSearch ? globalList() : renderList(leftPath ?? rightPath)) : null,
					(preview || (split && !globalSearch)) && !narrow ? h("div", { key: "gutter", className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onGutterDown, onDoubleClick: resetSplit }) : null,
					h("div", { key: "right", className: "dgp-pane " + (preview ? "dgp-previewPane" : "dgp-listPane"), "data-flat": preview ? undefined : "true", hidden: narrow && !!preview && !narrowPreviewScreen }, preview ? previewContent.body : globalSearch ? globalList() : renderList(rightPath))
				),
				// Hidden multi-file picker behind the 上传 button. Snapshot the
				// files into a plain array BEFORE resetting .value — input.files
				// is a LIVE FileList: clearing the value empties the very object
				// we captured, and the upload would silently see zero files.
				h("input", { ref: fileInputRef, type: "file", multiple: true, style: { display: "none" }, onChange: (e) => { const files = Array.from(e.target.files ?? []); e.target.value = ""; onFilesPicked(files); } }),
				overwriteAsk ? h("div", { className: "dgp-confirm", onClick: () => finishOverwrite(false) },
					h("div", { className: "dgp-confirmCard", onClick: (e) => e.stopPropagation() },
						h("div", { className: "dgp-confirmTitle" }, t("file.overwriteTitle")),
						h("div", { className: "dgp-confirmMsg" }, t("file.overwriteMsg", { name: overwriteAsk.name })),
						h("div", { className: "dgp-confirmActions" },
							lbtn(t("common.cancel"), () => finishOverwrite(false), { tone: "default" }),
							lbtn(t("file.overwrite"), () => finishOverwrite(true))
						)
					)
				) : null,
				// Delete confirmation: the same inline card shape as the overwrite
				// prompt, with the danger tone (warning glyph + red confirm button).
				delConfirm ? h("div", { className: "dgp-confirm", onClick: () => setDelConfirm(null) },
					h("div", { className: "dgp-confirmCard", onClick: (e) => e.stopPropagation() },
						h("div", { className: "dgp-confirmTitle", "data-danger": "true" }, h(IconWarning, { size: 15 }), delConfirm.title),
						delConfirm.message ? h("div", { className: "dgp-confirmMsg" }, delConfirm.message) : null,
						h("div", { className: "dgp-confirmActions" },
							btn(t("common.cancel"), () => setDelConfirm(null)),
							btn(delConfirm.confirmLabel || t("common.ok"), () => { const run = delConfirm.onConfirm; setDelConfirm(null); run(); }, { variant: "dangerFill" })
						)
					)
				) : null
			);
		}

		// Shared DSH-style dropdown: pill trigger + floating option card. The
		// card closes on outside click / Escape; the selected item carries a
		// trailing checkmark exactly like the DSH settings page. Keyboard nav
		// mirrors the native menu: ArrowUp/Down/Home/End move a cursor row,
		// Enter/Space commits it, Escape closes; Enter's default (re-toggling
		// the trigger button) is suppressed while the menu is open.
		const DsSelect = function DsSelect({ value, options, onChange, label }) {
			const [open, setOpen] = useState(false);
			const [cursor, setCursor] = useState(0);
			const ref = useRef(null);
			useEffect(() => {
				if (!open) return undefined;
				const selected = options.findIndex((o) => String(o.value) === value);
				setCursor(selected < 0 ? 0 : selected);
				const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
				const onDocKey = (e) => { if (e.key === "Escape") setOpen(false); };
				document.addEventListener("mousedown", onDoc);
				document.addEventListener("keydown", onDocKey);
				return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onDocKey); };
			}, [open]);
			const commit = (o) => { setOpen(false); if (o !== undefined && String(o.value) !== value) onChange(o.value); };
			const onKey = (e) => {
				if (!open || options.length === 0) return;
				if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => (c + 1) % options.length); }
				else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => (c - 1 + options.length) % options.length); }
				else if (e.key === "Home") { e.preventDefault(); setCursor(0); }
				else if (e.key === "End") { e.preventDefault(); setCursor(options.length - 1); }
				else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); commit(options[cursor]); }
			};
			return h("div", { className: "dgp-ddWrap", ref, onKeyDown: onKey },
				h("button", {
					type: "button", className: "dgp-ddBtn", "data-open": open ? "true" : "false",
					"aria-haspopup": "listbox", "aria-expanded": open ? "true" : "false",
					onClick: () => setOpen(!open)
				},
					h("span", { className: "dgp-ddLabel" }, label),
					h(IconChevronDown, { size: 14 })),
				open ? h("div", { className: "dgp-ddMenu", role: "listbox" },
					options.map((o, i) => h("button", {
						key: String(o.value), type: "button", role: "option",
						className: "dgp-ddItem",
						"aria-selected": String(o.value) === value ? "true" : "false",
						"data-selected": String(o.value) === value ? "true" : "false",
						"data-cursor": i === cursor ? "true" : "false",
						onMouseEnter: () => setCursor(i),
						onClick: () => commit(o)
					},
						h("span", null, o.label),
						String(o.value) === value ? h(IconCheck, { size: 13 }) : null))) : null);
		};

		// Settings page (a real tab — clicking the tab switches the body, no popover).
		// Layout: one statement-style row per setting — descriptive label (+ hint)
		// on the LEFT, a dropdown select on the RIGHT. The theme row additionally
		// carries a side-by-side light/dark comparison preview block under its
		// label, so the choice is visible before it is made. No tiled button cubes.
		const SettingsView = React.memo(function SettingsView({ onSetMax }) {
			const t = useT();
			const [defaultMax, setDefaultMax] = useState(readDefaultMaximized);
			const pick = useCallback((v) => {
				writeDefaultMaximized(v);
				setDefaultMax(v);
				onSetMax(v);   // apply to the current window too
			}, [onSetMax]);
			const [previewOpen, setPreviewOpen] = useState(() => {
				try { return localStorage.getItem(PREVIEW_OPEN_KEY) === "1"; } catch { return false; }
			});
			const setPreviewOpenFlag = useCallback((v) => {
				try { localStorage.setItem(PREVIEW_OPEN_KEY, v ? "1" : "0"); } catch {}
				setPreviewOpen(v);
			}, []);
			const [themePref, setThemePref] = useState(getMonacoThemePref);
			const pickTheme = useCallback((id) => {
				setMonacoTheme(id);
				setThemePref(id);
			}, []);
			const [fontPrefs, setFontPrefs] = useState(getPanelFontPrefs);
			const pickUiFont = useCallback((id) => {
				const next = { ...fontPrefs, ui: id };
				setFontPrefs(setPanelFonts(next.ui, next.code));
			}, [fontPrefs]);
			const pickCodeFont = useCallback((id) => {
				const next = { ...fontPrefs, code: id };
				setFontPrefs(setPanelFonts(next.ui, next.code));
			}, [fontPrefs]);
			// One dropdown row: statement label left, native select right.
			const row = (label, hint, control) => h("div", { className: "dgp-setRow" },
				h("div", { className: "dgp-setRowMain" },
					h("div", { className: "dgp-setRowLabel" }, label),
					hint ? h("div", { className: "dgp-setRowHint" }, hint) : null),
				control);
			// DSH-style dropdown select. A native <select>'s popup list cannot be
			// styled, so the trigger is a pill button and the option menu is a
			// floating card matching the DSH settings page: rounded frosted card,
			// hover row highlight, checkmark on the selected item (right side).
			const dropdown = (value, options, onPick) => {
				const current = options.find((o) => String(o.value) === String(value));
				return h(DsSelect, { value: String(value), options, onChange: onPick, label: current?.label ?? "" });
			};
			// Theme preview uses the exact light/dark palettes registered in Monaco.
			// The selector remains one family entry while both variants are previewed.
			const SAMPLE = [
				[["comment", "// 计算斐波那契数列第 n 项"]],
				[["plain", "function "], ["func", "fib"], ["plain", "(n) {"]],
				[["plain", "  "], ["keyword", "if"], ["plain", " (n <= "], ["number", "1"], ["plain", ") "], ["keyword", "return"], ["plain", " n;"]],
				[["plain", "  "], ["keyword", "return"], ["plain", " fib(n - "], ["number", "1"], ["plain", ") + fib(n - "], ["number", "2"], ["plain", ");"]],
				[["plain", "}"]],
				[["keyword", "const"], ["plain", " answer = "], ["func", "fib"], ["plain", "("], ["number", "10"], ["plain", "); "], ["comment", "// 55"]]
			];
			const themePane = (preset, key) => {
				const pal = preset.colors;
				return h("div", {
				key, className: "dgp-themePreview", "aria-hidden": "true",
				style: { background: pal.bg, fontFamily: "var(--dgp-font-mono)" }
			},
				h("div", { className: "dgp-themePreviewFile", style: { color: pal.comment } }, t(preset.labelKey)),
				SAMPLE.map((line, li) => h("div", { key: li },
					line.map(([kind, text], ti) => h("span", { key: ti, style: { color: kind === "plain" ? pal.fg : pal[kind] } }, text))),
				),
				h("div", { style: { color: pal.fg } }, "…"));
			};
			const themePair = () => {
				const family = themePref === "auto" ? "vscode" : themePref;
				const variants = MONACO_THEME_PRESETS.filter((preset) => MONACO_THEME_FAMILY_BY_PRESET[preset.id] === family);
				const light = variants.find((preset) => !preset.dark) ?? MONACO_THEME_PRESETS.find((preset) => preset.id === "vs");
				const dark = variants.find((preset) => preset.dark) ?? MONACO_THEME_PRESETS.find((preset) => preset.id === "vs-dark");
				return [light, dark];
			};
			const [palL, palR] = themePair();
			const themeSplit = h("div", { className: "dgp-themeSplit", "aria-hidden": "true" },
				themePane(palL, "L"),
				themePane(palR, "R"));
			const themeOptions = MONACO_THEME_OPTIONS.map((option) => ({ value: option.id, label: t(option.labelKey) }));
			const uiFontOptions = UI_FONT_OPTIONS.map((id) => ({ value: id, label: t(`set.fontUi${id[0].toUpperCase()}${id.slice(1)}`) }));
			const codeFontOptions = CODE_FONT_OPTIONS.map((id) => ({ value: id, label: t(`set.fontCode${id[0].toUpperCase()}${id.slice(1)}`) }));
			const sizeOptions = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => ({ value: min + i, label: `${min + i} px` }));
			return h("div", { className: "dgp-settingsPage" },
				h("div", { className: "dgp-settingsTitle" }, t("set.title")),
				row(t("set.editorGroup"), t("set.themeHint"),
					dropdown(themePref, themeOptions, pickTheme)),
				// Full-width split preview directly under the theme row.
				themeSplit,
				row(t("set.uiFont"), t("set.fontHint"), dropdown(fontPrefs.ui, uiFontOptions, pickUiFont)),
				row(t("set.uiSize"), t("set.uiSizeHint"), dropdown(fontPrefs.uiSize, sizeOptions(10, 20), (size) => setFontPrefs(setPanelFontSizes(size, fontPrefs.previewSize)))),
				row(t("set.codeFont"), t("set.codeFontHint"), dropdown(fontPrefs.code, codeFontOptions, pickCodeFont)),
				row(t("set.previewSize"), t("set.previewSizeHint"), dropdown(fontPrefs.previewSize, sizeOptions(8, 24), (size) => setFontPrefs(setPanelFontSizes(fontPrefs.uiSize, size)))),
				h("pre", { className: "dgp-fontSample" }, t("set.sizeSample")),
				row(t("set.defaultOpen"), t("set.applyHint"),
					dropdown(defaultMax, [
						{ value: true, label: t("set.maximized") },
						{ value: false, label: t("set.normal") }
					], pick)),
				row(t("set.click"), t("set.previewHint"),
					dropdown(previewOpen, [
						{ value: true, label: t("set.panelPreview") },
						{ value: false, label: t("set.systemOpen") }
					], setPreviewOpenFlag))
			);
		});
		//#endregion

		//#region overlay
		// ── panel body: header + tabs ────────────────────────────────────────────
		const FilePanelBody = React.memo(function FilePanelBody({ cwd, maximized = false, onToggleMax, onSetMax, onSuspend }) {
			const git = useGit(cwd);
			const [tab, setTab] = useState("files");
			const [refreshTick, setRefreshTick] = useState(0);
			const [headerHost, setHeaderHost] = useState(null);
			const rootNavigationRef = useRef(null);
			const t = useT();
			// Narrow viewport: the dialog IS the full screen — the maximize
			// toggle has nothing to do and its button is dropped.
			const narrow = useNarrow();
			// External open request (produced-file/link click) forces the file tab
			// so FileBrowser mounts and consumes the request (its own effect does
			// the navigation + preview).
			const openReq = useSyncExternalStore(subscribeOpenReq, getOpenReq);
			const lastOpenReqTs = useRef(0);
			useEffect(() => {
				if (openReq && openReq.ts !== lastOpenReqTs.current) {
					lastOpenReqTs.current = openReq.ts;
					setTab("files");
				}
			}, [openReq]);
			const refreshAll = useCallback(() => { git.refresh({ full: true }); setRefreshTick((t) => t + 1); }, [git.refresh]);
			// The workspace title IS the file-view entry and breadcrumb root.
			const wsName = (() => { const s = String(cwd ?? "").replace(/[\\/]+$/, "").split(/[\\/]/); return s[s.length - 1] || ""; })();
			// Pages portal their context/actions into this stable shared header.
			const tabBtn = (id, label) => h("button", { type: "button", className: "dgp-tab" + (id === "git" ? " dgp-pageNavGit" : ""), "aria-pressed": tab === id, "data-active": tab === id ? "true" : "false", onClick: () => setTab(id) }, id === "git" ? h(IconBranch, { size: 14 }) : null, label);
			const openFiles = () => { if (tab === "files") rootNavigationRef.current?.(""); else setTab("files"); };
			// Branch controls belong to the Git page; navigation stays short.
			const pageNavigation = git.isRepo === false || narrow ? null : tabBtn("git", "Git");
			useEffect(() => { if (git.isRepo === false && tab === "git") setTab("files"); }, [git.isRepo, tab]);
			return h(React.Fragment, null,
				h("div", { className: "dgp-header dgp-singleHeader", "data-page": tab },
					h("button", { type: "button", className: "dgp-titleWrap dgp-workspaceTab", title: cwd, "aria-label": wsName + " · " + t("tab.files"), "aria-pressed": tab === "files", "data-active": tab === "files" ? "true" : "false", onClick: openFiles },
						h("span", { className: "dgp-wsIcon", "aria-hidden": "true" }, h(IconFolderClose, { size: 18 })),
						h("span", { className: "dgp-title" }, wsName)
					),
					narrow ? h(ToolbarMenu, { className: "dgp-navigationMenu", label: t("panel.navigation"), text: tab === "files" ? wsName : tab === "git" ? "Git" : t("tab.settings"), icon: null, items: [
						{ label: wsName, title: cwd, checked: tab === "files", run: openFiles },
						git.isRepo === false ? null : { label: "Git", checked: tab === "git", run: () => setTab("git") },
						{ label: t("tab.settings"), checked: tab === "settings", run: () => setTab("settings") },
						{ label: t("common.refresh"), run: refreshAll, disabled: git.busy !== null },
						{ label: t("panel.suspend"), run: onSuspend },
						{ label: t("panel.close"), run: () => overlayStore.set(false) }
					] }) : null,
					h("div", { className: "dgp-headerHost", ref: setHeaderHost }, tab === "settings" ? h(React.Fragment, null,
						pageNavigation ? h("span", { className: "dgp-toolbarDivider", "aria-hidden": "true" }) : null,
						pageNavigation
					) : null),
					h("div", { className: "dgp-headerActions" },
						btn(null, () => setTab((value) => value === "settings" ? "files" : "settings"), { icon: h(IconSettings, { size: 14 }), title: t("tab.settings"), className: tab === "settings" ? "dgp-settingsActive" : "" }),
						btn(null, refreshAll, { disabled: git.busy !== null, icon: h(IconRefresh, { size: 14 }), title: t("common.refresh") }),
						btn(null, onSuspend, { icon: h(IconChevronUp, { size: 14 }), title: t("panel.suspend") }),
						narrow ? null : btn(null, onToggleMax, { icon: h(IconMaximize, { size: 14 }), title: maximized ? t("panel.restore") : t("panel.maximize") }),
						h("button", { className: "dgp-close", title: t("panel.close"), onClick: () => overlayStore.set(false), "aria-label": t("panel.close") }, h(IconClose, { size: 16 }))
					)
				),
				h("div", { className: "dgp-body", "data-tab": tab },
					tab === "settings" ? h(SettingsView, { onSetMax })
						: (tab === "files" || git.isRepo === false ? h(FileBrowser, { cwd, status: git.status, refreshTick, onEdited: refreshAll, headerHost, pageNavigation, rootNavigationRef }) : h(GitView, { git, headerHost, pageNavigation }))
				)
			);
		});

		// ── render-error boundary ────────────────────────────────────────────────
		// A render bug inside the panel body (unexpected data shape from a
		// stale host process, a future regression…) must degrade to a visible
		// error card with a retry — NEVER unmount the slot silently: the slot's
		// death also removes the exposed-strip restore target, stranding the
		// panel for good.
		class PanelBoundary extends React.Component {
			constructor(props) { super(props); this.state = { err: null, nonce: 0 }; }
			static getDerivedStateFromError(err) { return { err }; }
			componentDidCatch(err) { try { console.error("files-git: panel render error", err); } catch { /* ignore */ } }
			render() {
				if (this.state.err !== null) {
					return h("div", { className: "dgp-body", style: { display: "flex", alignItems: "center", justifyContent: "center", padding: 24 } },
						h("div", { className: "dgp-error", style: { maxWidth: 620 } },
							h("span", { style: { flex: 1, minWidth: 0, wordBreak: "break-all" } }, t("panel.renderErr", { msg: String(this.state.err?.message ?? this.state.err) })),
							lbtn(t("common.retry"), () => this.setState((s) => ({ err: null, nonce: s.nonce + 1 })), { tone: "default" })));
				}
				// key bump: retry remounts the subtree fresh (stale crash state gone)
				return h(React.Fragment, { key: this.state.nonce }, this.props.children);
			}
		}

		// ── overlay modal (mirrors DSH Modal visual language) ────────────────────
		function FilePanelOverlay() {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const hidden = useSyncExternalStore(subscribeHidden, getHidden);
			const narrow = useNarrow();
			const overlayRef = useRef(null);
			const t = useT();
			// Suspended (hide): the panel keeps ALL its state (tab, preview file,
			// scroll, search…) and slides out of the viewport, leaving its top edge
			// exposed; hovering anywhere along that strip slides it back in.
			const hideTimer = useRef(null);
			const mousePos = useRef({ x: 0, y: 0 });
			// Track the cursor globally: when the cursor leaves the panel and stays
			// out (350ms debounce), suspend automatically — no need to click the
			// suspend button. The exposed top strip is exempt, otherwise the panel
			// would re-hide while the cursor still rests on the restore area.
			useEffect(() => {
				// Narrow/touch: no cursor to track, no hover-out suspend — the
				// suspend button and exposed strip remain the exits.
				if (narrow) return;
				const onMove = (e) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
				document.addEventListener("mousemove", onMove, { passive: true });
				return () => { document.removeEventListener("mousemove", onMove); clearTimeout(hideTimer.current); };
			}, [narrow]);
			const cancelHide = useCallback(() => clearTimeout(hideTimer.current), []);
			// Any click inside the panel (e.g. the fullscreen toggle, which
			// resizes the dialog and can momentarily leave the cursor outside its
			// new bounds) grants a short exemption window so the auto-suspend
			// debounce does not fire right after a deliberate in-panel click.
			const lastPanelClick = useRef(0);
			const scheduleHide = useCallback(() => {
				clearTimeout(hideTimer.current);
				hideTimer.current = setTimeout(() => {
					// Narrow/touch never schedules a hide (see scheduleHide callers).
					if (narrowStore.get()) return;
					const m = mousePos.current;
					// Keep the panel open while the cursor rests anywhere over its
					// exposed 40px top strip, including after hover restored it.
					const dialog = overlayRef.current?.querySelector(".dgp-dialog");
					const rect = dialog?.getBoundingClientRect();
					if (m.y <= 40 && rect && m.x >= rect.left && m.x <= rect.right) return;
					// Cursor is currently back inside the dialog or a popup.
					const el = document.elementFromPoint(m.x, m.y);
					if (el && el.closest?.(".dgp-dialog, .dgp-searchHist, .dgp-branchPop, .dgp-logMenu, .dgp-crumbMenu, .dgp-toolbarMenu")) return;
					// A click inside the panel happened within the last 500ms
					// (fullscreen toggle, refresh…): its layout change may have
					// pushed the cursor out of the dialog — don't suspend for that.
					if (Date.now() - lastPanelClick.current < 500) return;
					hiddenStore.set(true);
				}, 350);
			}, []);
			// Default state: fullscreen unless the setting says otherwise.
			const [maximized, setMaximized] = useState(readDefaultMaximized);
			// Stable identity so the memoized FilePanelBody is not re-rendered by
			// unrelated global store updates (sessions/workspaces churn).
			const toggleMax = useCallback(() => setMaximized((m) => !m), []);
			const setMax = useCallback((v) => setMaximized(v), []);
			const suspend = useCallback(() => { clearTimeout(hideTimer.current); hiddenStore.set(true); }, []);
			const snapshot = useSyncExternalStore(
				(cb) => (sessionsService ? sessionsService.list.subscribe(cb) : () => {}),
				() => (sessionsService ? sessionsService.list.getSnapshot() : { ids: [], byId: {}, current: undefined, phase: "pending" })
			);
			// Workspace membership resolves a selected session without a cwd;
			// hero fallback is limited to hosts with an unambiguous workspace.
			const wsSnapshot = useSyncExternalStore(
				(cb) => (workspacesService ? workspacesService.list.subscribe(cb) : () => {}),
				() => (workspacesService ? workspacesService.list.getSnapshot() : { items: [], phase: "pending" })
			);
			useEffect(() => {
				if (!open || hidden) return;
				const prevFocus = document.activeElement;
				const FOCUSABLE = 'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
				const onKey = (e) => {
					if (e.key === "Escape") {
						if (closeActiveToolbarMenu || document.activeElement?.closest?.(".dgp-crumbMenu")) return;
						overlayStore.set(false);
						return;
					}
					if (e.key !== "Tab") return;
					const el = overlayRef.current;
					if (!el) return;
					const portalNodes = [...document.querySelectorAll(".dgp-crumbMenu, .dgp-toolbarMenu")].flatMap((menu) => [...menu.querySelectorAll(FOCUSABLE)]);
					const nodes = [...el.querySelectorAll(FOCUSABLE), ...portalNodes].filter((n) => n.offsetParent !== null);
					if (nodes.length === 0) { e.preventDefault(); return; }
					const first = nodes[0], last = nodes[nodes.length - 1];
					const active = document.activeElement;
					const activeInScope = el.contains(active) || !!active.closest?.(".dgp-crumbMenu, .dgp-toolbarMenu");
					if (e.shiftKey) {
						if (active === first || !activeInScope) { e.preventDefault(); last.focus(); }
					} else {
						if (active === last || !activeInScope) { e.preventDefault(); first.focus(); }
					}
				};
				document.addEventListener("keydown", onKey);
				// Move focus inside the dialog so keyboard input never leaks to
				// the main UI underneath; restore it when the panel closes.
				const root = overlayRef.current;
				if (root && !root.contains(document.activeElement)) {
					const first = root.querySelector(FOCUSABLE);
					if (first) first.focus();
					else { root.setAttribute("tabindex", "-1"); root.focus(); }
				}
				return () => {
					document.removeEventListener("keydown", onKey);
					root?.removeAttribute?.("tabindex");
					if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
				};
			}, [open, hidden]);
			// Resolve the panel's workspace (cwd) BEFORE the early return so the
			// suspend-lifecycle effects below can depend on it.
			const cwd = workspaceCwdOf(snapshot, wsSnapshot) || null;
			// The panel is bound to ONE workspace at a time. Switching to a
			// session of a DIFFERENT workspace closes the panel entirely (which
			// also clears any suspension): the suspended state must never leak
			// into other workspaces, and the panel must never pop open by itself
			// in a workspace that did not ask for it. Sessions of the SAME
			// workspace keep the panel (and its suspension) untouched.
			const prevCwdRef = useRef(null);
			useEffect(() => {
				if (prevCwdRef.current !== null && prevCwdRef.current !== cwd) {
					overlayStore.set(false);
				}
				prevCwdRef.current = cwd;
			}, [cwd]);
			// Closing the panel also clears any suspension: reopening it must show
			// the panel expanded, not still slid out.
			useEffect(() => {
				if (!open && getHidden()) hiddenStore.set(false);
			}, [open]);
			// Closing the panel must also drop any pending external open request —
			// otherwise reopening would replay the last produced-file click
			// (preview + breadcrumb left over from the previous session).
			// The same rule covers a pending `@` reference: it must not fire into
			// the composer later, after the panel that produced it is gone.
			useEffect(() => {
				if (!open) { openReqStore.clear(); clearRefReq(); }
			}, [open]);
			if (!open) return null;
			let content;
			if (snapshot?.phase === "pending") {
				content = h("div", { className: "dgp-body" }, h("div", { className: "dgp-empty" }, t("panel.loadingSession")));
			} else if (!cwd) {
				content = h("div", { className: "dgp-body" }, h("div", { className: "dgp-empty", style: { lineHeight: "26px" } }, t("panel.noWorkspace")));
			} else {
				content = h(FilePanelBody, { key: cwd, cwd, maximized, onToggleMax: toggleMax, onSetMax: setMax, onSuspend: suspend });
			}
			// Portaled straight to <body>: the dsh overlay container that hosts
			// this slot has a low z-index stacking context (z 20), which would trap
			// the panel underneath dsh's own (transparent) event-swallowing mask —
			// real mouse input (hover on the exposed restore strip, clicking the mask)
			// would never reach it. On body, z 1050 sits above dsh's root (z 1000).
			// OUTER boundary: a render crash ANYWHERE in the overlay subtree
				// (dialog shell, exposed restore strip, an effect-driven re-render) must degrade
			// to a visible error card — never escape and kill the DSH web slot.
			return portal(
				h(PanelBoundary, null,
					h("div", { className: "dgp-root", style: getPanelFontStyle(), ref: overlayRef, role: "presentation", "data-hidden": hidden ? "true" : "false", "data-narrow": narrow ? "true" : "false" },
						h("div", { className: "dgp-mask", "aria-hidden": "true", "data-hidden": hidden ? "true" : "false", onClick: suspend }),
						h("div", { className: "dgp-dialog", role: "dialog", "aria-modal": "true", "aria-label": t("panel.aria"), "data-max": maximized ? "true" : "false",
							onClickCapture: () => { lastPanelClick.current = Date.now(); if (getHidden()) hiddenStore.set(false); },
							onMouseEnter: () => { cancelHide(); if (getHidden()) hiddenStore.set(false); },
							onMouseLeave: (e) => {
								// Touch devices synthesize mouseleave after taps with a
								// stale cursor position — never auto-suspend there.
								if (narrowStore.get()) return;
								// Moving into a portaled popup (branch list, search
								// history, log menu) is still "inside the panel".
								const t = e.relatedTarget;
								if (t && (t.closest?.(".dgp-searchHist") || t.closest?.(".dgp-branchPop") || t.closest?.(".dgp-logMenu"))) return;
								scheduleHide();
							}
							// INNER boundary: a body/content error keeps the shell
							// (mask, header, close button) visible so the user can
							// dismiss/retry without a dead pane.
						}, h(PanelBoundary, null, content),
						hidden ? h("div", { className: "dgp-suspendCue", "aria-hidden": "true" }, h(IconArrowDown, { size: 16 })) : null)
					)
				), document.body);
		}
		//#endregion

		//#region index
		/** Required client services: slot registry, session runtime, workspace list, locale (i18n), connection (RPC funnel).
		 * NOTE: do NOT inject dotted remote namespaces speculatively — the cordis
		 * ctx guard throws on un-injected property access and fails the plugin. */
		const inject = ["slots", "sessions", "workspaces", "locale", "connection", "sidebarRight"];

		/** Setting key: route produced-file/link clicks into the panel preview. */
		const PREVIEW_OPEN_KEY = "dsh-files-git.previewOpenPath";
		const previewOpenEnabled = () => {
			try { return localStorage.getItem(PREVIEW_OPEN_KEY) === "1"; } catch { return false; }
		};

		// ── Sidebar-right interception (DSH 0.1.5 produced files) ───────────────
		// 0.1.5 routes every produced-file click (deliverable chips, prose file
		// mentions, tool "open file" actions) through the chat view's openFile,
		// which lands on the sidebarRight service as a
		// `dsh-resource://file/session/<sessionId>/<path>` address — it never
		// touches connection.rpc's `session/openWorkspacePath` anymore. Wrap
		// openResource: when panel preview is enabled and the address decodes to
		// a regular file, expand THIS panel instead; anything else (directories,
		// foreign addresses, stat failures) falls through to the DSH default.
		const SESSION_FILE_PREFIX = "dsh-resource://file/session/";
		/** Decode a session file address into { sessionId, path }; null if foreign. */
		function parseSessionFileAddress(address) {
			if (typeof address !== "string" || !address.startsWith(SESSION_FILE_PREFIX)) return null;
			const rest = address.slice(SESSION_FILE_PREFIX.length);
			const slash = rest.indexOf("/");
			if (slash <= 0) return null;
			try {
				const sessionId = decodeURIComponent(rest.slice(0, slash));
				const path = rest.slice(slash + 1).split("/").map((s) => decodeURIComponent(s)).join("/");
				if (sessionId === "" || path === "") return null;
				return { sessionId, path };
			} catch { return null; }
		}
		/** Workspace root of one session, falling back to the active workspace. */
		function cwdOfSession(sessionId) {
			const snapshot = sessionsService?.list?.getSnapshot?.() ?? null;
			return workspaceCwdOf(snapshot, workspacesService?.list?.getSnapshot?.(), sessionId);
		}
		/** Stat the addressed file and expand the panel on success. Never throws. */
		async function openProducedInPanel(sessionId, rawPath) {
			const rel = String(rawPath).replace(/\\/g, "/").replace(/^(?:\.\/)+/, "");
			const cwd = cwdOfSession(sessionId).replace(/[\\/]+$/, "");
			if (cwd === "" && !/^[a-zA-Z]:\//.test(rel) && !rel.startsWith("/")) return false;
			const abs = /^[a-zA-Z]:\//.test(rel) || rel.startsWith("/") ? rel : (cwd !== "" ? `${cwd}/${rel}` : rel);
			const st = await gitRpc("stat", { repo: cwd !== "" ? cwd : ".", path: abs });
			if (st?.type !== "file") return false;
			overlayStore.set(true);
			hiddenStore.set(false);
			openReqStore.request(abs);
			return true;
		}

		/**
		 * Register the trigger capsules (session header + blank-session input dock,
		 * so the button stays reachable before any conversation exists) and overlay.
		 */
		function apply(ctx) {
			sessionsService = ctx.sessions;
			workspacesService = ctx.workspaces;
			// i18n: register the zh/en dictionaries and bind the LocaleFace.
			// ctx.effect disposes the registration on HMR reload (the locale
			// service rejects duplicate registrations of the same namespace).
			ctx.effect(() => installLocale(ctx.locale), "files-git: locale");
			// Intercept the workspace "open with system application" entry point.
			// This is the ONLY caller of the host openPath RPC (the conversation
			// view's file opener), so wrapping it covers every produced-file chip,
			// in-message file mention and "open in folder" action with no other
			// side effects. When the setting is on, FILE paths are previewed in
			// the panel instead; directories ("." and friends) always keep the
			// system behavior.
			// HMR / re-apply guard: a previous module instance may have left its
			// wrapper on the service — unwrap it BEFORE wrapping again (the old
			// closure holds a DEAD module's stores; chaining on it could swallow
			// clicks with neither preview nor native open, plus duplicate stat
			// RPCs).
			const prevOpenPathWrap = workspacesService?.openPath;
			if (prevOpenPathWrap?.__filesGitPreviewWrap === true && typeof prevOpenPathWrap.__filesGitPreviewOrig === "function") {
				workspacesService.openPath = prevOpenPathWrap.__filesGitPreviewOrig;
			}
			const openPath = workspacesService?.openPath?.bind(workspacesService);
			if (typeof openPath === "function") {
				// The wrapper MUST NEVER reject: DSH fires this off a click, and
				// an unhandled rejection from it propagates to DSH's global
				// error handler and can crash the whole web app. Every path
				// resolves (void on failure); worst case = no preview, never a
				// crash.
				const wrappedOpenPath = async (path) => {
					try {
						if (previewOpenEnabled() && typeof path === "string" && path.trim() !== "" && path !== "." && !/[\\/]$/.test(path)) {
							const st = await gitRpc("stat", { repo: cwdOf(), path: path.trim() });
							if (st?.type === "file") {
								overlayStore.set(true);
								// Also slide the panel back in if it was suspended:
								// a produced-file click must always surface the preview.
								hiddenStore.set(false);
								openReqStore.request(path.trim());
								return;
							}
						}
					} catch { /* stat unreachable / foreign: fall through to the system opener */ }
					try { return await openPath(path); }
					catch { /* DSH opener threw: swallow so the wrapper never rejects */ }
				};
				wrappedOpenPath.__filesGitPreviewWrap = true;
				wrappedOpenPath.__filesGitPreviewOrig = openPath;
				workspacesService.openPath = wrappedOpenPath;
				// Restore the original on plugin dispose (HMR / remove): the wrap
				// closure would otherwise outlive this module instance and
				// intercept with stale stores. The disposer is SYNCHRONOUS — an
				// async disposer returns a promise nobody awaits, so any rejection
				// inside it would escape unhandled.
				ctx.effect(() => () => {
					try {
						if (workspacesService.openPath === wrappedOpenPath) workspacesService.openPath = openPath;
					} catch { /* service replaced meanwhile: nothing to restore */ }
				}, "files-git: openPath interception");
			}
			// Primary interception point: DSH's conversation file opener now
			// calls the typert remote DIRECTLY and never touches
			// workspacesService.openPath. Verified transport funnel (gateway
			// client `invoke`): connection.rpc.call("/api", endpoint,
			// { args }) — a persistent object whose property is looked up per
			// call. Wrapping it catches the file opener regardless of
			// remote-layer refactors. ANY failure here (missing service, frozen
			// handle) must only DOWNGRADE to native open — never fail apply.
			try {
				const connection = ctx.connection;
				// Guard against double-install (HMR / re-apply): a second wrap
				// would chain onto the first, whose closure holds a DEAD module
				// store — its re-interception could swallow clicks with neither
				// preview nor native open, plus duplicate stat RPCs.
				const alreadyWrapped = connection?.rpc?.call?.__filesGitPreviewWrap === true;
				if (!alreadyWrapped && connection?.rpc && typeof connection.rpc.call === "function") {
					const origCall = connection.rpc.call.bind(connection.rpc);
					const wrappedCall = async (channel, endpoint, payload, signal) => {
						if (endpoint === "session/openWorkspacePath" && typeof channel === "string" && channel.startsWith("/api")) {
							const p = payload?.args?.request?.path ?? payload?.args?.path ?? payload?.request?.path ?? payload?.path;
							if (previewOpenEnabled() && typeof p === "string" && p.trim() !== "" && p !== "." && !/[\\/]$/.test(p)) {
								try {
									const st = await gitRpc("stat", { repo: cwdOf(), path: p.trim() });
									if (st?.type === "file") {
										overlayStore.set(true);
										hiddenStore.set(false);
										openReqStore.request(p.trim());
										return { ok: true, value: { opened: true } };
									}
								} catch { /* stat unreachable / foreign: fall through to the system opener */ }
							}
						}
						return origCall(channel, endpoint, payload, signal);
					};
					wrappedCall.__filesGitPreviewWrap = true;
					const desc = Object.getOwnPropertyDescriptor(connection.rpc, "call");
					if (!desc || desc.writable || desc.set) {
						connection.rpc.call = wrappedCall;
						// Restore the original transport on plugin dispose (HMR /
						// remove): the wrap closure would otherwise outlive this
						// module instance and intercept with stale stores. The
						// disposer is SYNCHRONOUS — an async disposer returns a
						// promise nobody awaits, so any rejection inside it would
						// escape unhandled.
						ctx.effect(() => () => {
							try {
								if (connection.rpc.call === wrappedCall) connection.rpc.call = origCall;
							} catch { /* transport replaced meanwhile: nothing to restore */ }
						}, "files-git: openWorkspacePath interception");
					}
				}
			} catch { /* interception unavailable → native open; plugin must still load */ }
			// Sidebar-right interception (DSH 0.1.5+): the primary produced-file
			// opener. HMR / re-apply guard mirrors the openPath wrap above —
			// unwrap a previous module instance's wrapper BEFORE wrapping again.
			try {
				const sidebarRight = ctx.sidebarRight ?? ctx.get?.("sidebarRight");
				if (sidebarRight && typeof sidebarRight.openResource === "function") {
					const prevOpenResource = sidebarRight.openResource;
					if (prevOpenResource?.__filesGitPreviewWrap === true && typeof prevOpenResource.__filesGitPreviewOrig === "function") {
						sidebarRight.openResource = prevOpenResource.__filesGitPreviewOrig;
					}
					const rawOpenResource = sidebarRight.openResource;
					const wrappedOpenResource = function (address, options) {
						if (previewOpenEnabled()) {
							const parsed = parseSessionFileAddress(address);
							if (parsed !== null) {
								openProducedInPanel(parsed.sessionId, parsed.path)
									.then((opened) => { if (opened !== true) rawOpenResource.call(sidebarRight, address, options); })
									.catch(() => { try { rawOpenResource.call(sidebarRight, address, options); } catch { /* DSH default also failed: nothing to do */ } });
								return;
							}
						}
						return rawOpenResource.call(sidebarRight, address, options);
					};
					wrappedOpenResource.__filesGitPreviewWrap = true;
					wrappedOpenResource.__filesGitPreviewOrig = rawOpenResource;
					sidebarRight.openResource = wrappedOpenResource;
					// Restore the original on plugin dispose (HMR / remove).
					ctx.effect(() => () => {
						try {
							if (sidebarRight.openResource === wrappedOpenResource) sidebarRight.openResource = rawOpenResource;
						} catch { /* service replaced meanwhile: nothing to restore */ }
					}, "files-git: sidebarRight.openResource interception");
				}
			} catch { /* interception unavailable → DSH default open; plugin must still load */ }
			// Trigger A: conversation.session.header.utilities (list, session-scope),
			// order -1 so it renders just LEFT of the "Session log" capsule (order 0).
			ctx.slots.inject("conversation.session.header.utilities", () =>
				ctx.slots.register({ name: "conversation.session.header.utilities", id: "files-git", order: -1 }, FileHeaderAction));
			// Trigger B: conversation.input.left (end of the leading controls).
			// Order after other contributions in that group; render only while the
			// selected Session is blank, then let the header trigger take over.
			ctx.slots.inject("conversation.input.left", () =>
				ctx.slots.register({ name: "conversation.input.left", id: "files-git", order: 50 }, InputLeftTrigger));
			// Headless composer-reference injector. Session scope is where the
			// `inputActions` draft-write face is handed out, so it must live in a
			// session slot; the panel (shell scope) only writes the bridge store.
			// Registered in BOTH session slots because either may be unmounted
			// (hero state vs. active session) — the bridge request is consumed
			// once, so a double mount cannot double-insert.
			ctx.slots.inject("conversation.input.dock", () =>
				ctx.slots.register({ name: "conversation.input.dock", id: "files-git-ref" }, ReferenceInjector));
			ctx.slots.inject("conversation.session.header.utilities", () =>
				ctx.slots.register({ name: "conversation.session.header.utilities", id: "files-git-ref", order: -2 }, ReferenceInjector));
			// Modal: shell.overlay (list, root-scope, additive — no conflict).
			ctx.slots.inject("shell.overlay", () =>
				ctx.slots.register({ name: "shell.overlay", id: "files-git" }, FilePanelOverlay));
		}

		/** Absolute path of the active session's workspace (mirrors overlay cwd resolution). */
		function cwdOf() {
			const snapshot = sessionsService?.list?.getSnapshot?.() ?? null;
			return workspaceCwdOf(snapshot, workspacesService?.list?.getSnapshot?.());
		}

		exports.FileHeaderAction = FileHeaderAction;
		exports.FilePanelOverlay = FilePanelOverlay;
		exports.apply = apply;
		exports.inject = inject;
		//#endregion
		return module.exports;
	}
});
