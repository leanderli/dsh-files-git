window.__ModuleLoader__.load({
	id: "dsh-files-git",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region head · platform deps (require/seed words only)
		const React = require("react");
		const { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } = React;
		const h = React.createElement;
		const ReactDOM = (() => { try { return require("react-dom"); } catch (e) { return null; } })();
		//#endregion
		//#region styles
		// ── inject one <style> tag with all classes (DSH-token-driven) ────────────
		const CSS_TAG = "dsh-files-git/styles";
		if (typeof document !== "undefined" && !document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`)) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-files-git";
			style.dataset.pluginCss = CSS_TAG;
			style.textContent = `
.dgp-trigger{border:1px solid var(--dsw-alias-border-l2);min-width:118px;height:32px;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);cursor:pointer;background:0 0;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:6px 12px;font-size:13px;font-weight:400;line-height:20px;display:inline-flex}
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
.dgp-dockRow{position:absolute;left:0;right:0;display:flex;justify-content:flex-end;align-items:center;box-sizing:border-box;padding-right:var(--dsh-composer-side-clearance,16px);pointer-events:none}
.dgp-dockRow button{pointer-events:auto}
.dgp-root{position:fixed;inset:0;z-index:1050;display:flex;align-items:center;justify-content:center;pointer-events:auto;animation:dgp-fade .16s ease}
.dgp-root[data-hidden="true"]{pointer-events:none}
.dgp-mask{position:absolute;inset:0;background:rgba(15,19,30,.32);pointer-events:auto;transition:opacity .2s ease}
body[data-ds-dark-theme] .dgp-mask{background:rgba(0,0,0,.48)}
.dgp-mask[data-hidden="true"]{opacity:0;pointer-events:none}
.dgp-handle{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:1060;display:inline-flex;align-items:center;gap:7px;padding:6px 18px 8px;border-radius:0 0 14px 14px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 90%,transparent);backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);border:1px solid var(--dsw-alias-border-l2);border-top:none;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);font-size:12px;line-height:18px;font-weight:500;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.16);pointer-events:auto;user-select:none;animation:dgp-handle-in .18s cubic-bezier(.2,.8,.2,1)}
.dgp-handle:hover{background:var(--dsw-alias-interactive-bg-hover);box-shadow:0 10px 32px rgba(0,0,0,.22)}
.dgp-handle svg{transition:transform .18s ease;color:color-mix(in srgb,var(--dsw-alias-label-primary) 55%,transparent)}
.dgp-handle:hover svg{transform:translateY(1px);color:var(--dsw-alias-label-primary)}
@keyframes dgp-handle-in{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.dgp-dialog{position:relative;z-index:1;display:flex;flex-direction:column;width:1280px;max-width:94vw;height:820px;max-height:90vh;background:color-mix(in srgb,var(--dsw-alias-bg-base) 86%,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:24px;overflow:hidden;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.1);animation:dgp-scale .16s cubic-bezier(.2,.8,.2,1);transition:transform .28s cubic-bezier(.2,.8,.2,1);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family)}
/* Frosted-glass backdrop lives on ::before (a dedicated backdrop root) instead
   of the dialog itself — Chrome does NOT apply backdrop-filter to elements
   nested inside another backdrop-filter element, which silently killed the
   blur on the search-history / branch popups. With the dialog no longer a
   backdrop root, popups inside it blur normally again. */
.dgp-dialog::before{content:"";position:absolute;inset:0;z-index:0;background:transparent;backdrop-filter:blur(30px) saturate(1.3);-webkit-backdrop-filter:blur(30px) saturate(1.3);pointer-events:none}
.dgp-dialog > div{position:relative;z-index:1}
@keyframes dgp-fade{from{opacity:0}to{opacity:1}}
@keyframes dgp-scale{from{opacity:0;transform:scale(.97) translateY(6px)}to{opacity:1;transform:none}}
.dgp-header{display:flex;align-items:center;gap:12px;padding:20px 24px 12px;flex:none;position:relative}
.dgp-settingsPage{display:flex;flex-direction:column;gap:14px;max-width:600px;width:100%;margin:0 auto;padding:20px 0 28px}
.dgp-settingsTitle{font-size:15px;font-weight:600;line-height:22px;color:var(--dsw-alias-label-primary)}
.dgp-settingsCard{background:color-mix(in srgb,var(--dsw-alias-bg-base) 92%,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:10px}
.dgp-settingsRow{font-size:12px;color:var(--dsw-alias-label-secondary)}
.dgp-settingsOpts{display:flex;gap:6px}
.dgp-settingsOpt{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:4px;background:transparent;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:20px;padding:4px 8px;cursor:pointer;white-space:nowrap}
.dgp-settingsOpt:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-settingsOpt[data-active="true"]{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 14%,transparent);border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}
.dgp-settingsHint{font-size:11px;line-height:16px;color:color-mix(in srgb,var(--dsw-alias-label-primary) 55%,transparent)}
.dgp-titleWrap{flex:1;min-width:0;display:flex;align-items:center}
.dgp-title{margin:0;font-size:15px;font-weight:600;line-height:22px;color:var(--dsw-alias-label-primary)}
.dgp-close{border:none;background:0 0;cursor:pointer;color:var(--dsw-alias-label-secondary);width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0}
.dgp-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-tabs{display:flex;gap:4px;flex:none;padding:0 24px;border-bottom:1px solid var(--dsw-alias-border-l1);position:relative;align-items:center}
.dgp-tab{border:none;background:0 0;cursor:pointer;font-family:var(--dsw-font-family);font-size:13px;font-weight:500;line-height:20px;padding:8px 14px;color:var(--dsw-alias-label-secondary);border-bottom:2px solid transparent;margin-bottom:-1px;display:inline-flex;align-items:center;gap:6px}
.dgp-tab:hover{color:var(--dsw-alias-label-primary)}
.dgp-tab[data-active="true"]{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-state-business-primary)}
.dgp-tabSplit{padding:0;gap:0;position:relative}
.dgp-tabSplit .dgp-tabMain{border:none;background:0 0;cursor:pointer;font-family:var(--dsw-font-family);font-size:13px;font-weight:500;line-height:20px;padding:8px 4px 8px 14px;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;gap:6px}
.dgp-tabSplit .dgp-tabMain:hover{color:var(--dsw-alias-label-primary)}
.dgp-tabSplit .dgp-tabMain[data-active="true"]{color:var(--dsw-alias-label-primary)}
.dgp-tabArrow{border:none;background:0 0;cursor:pointer;padding:8px 14px 8px 2px;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;flex:none}
.dgp-tabArrow:hover{color:var(--dsw-alias-label-primary)}
.dgp-tabArrow[data-open="true"]{color:var(--dsw-alias-label-primary)}
.dgp-body{flex:1;min-height:0;overflow-y:auto;padding:16px 24px 24px;display:flex;flex-direction:column;gap:14px}
.dgp-dialog[data-max="true"]{width:calc(100vw - 24px);max-width:calc(100vw - 24px);height:calc(100vh - 24px);max-height:calc(100vh - 24px)}
.dgp-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.dgp-opBar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.dgp-opDivider{width:1px;align-self:stretch;background:var(--dsw-alias-border-l2);flex:none}
.dgp-commitInline{display:flex;align-items:center;gap:8px;flex:1 1 360px;min-width:0}
.dgp-commitInput{flex:1 1 180px;min-width:140px;height:32px;box-sizing:border-box;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:0 10px;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;outline:none}
.dgp-commitInput:focus{border-color:var(--dsw-alias-state-business-primary)}
.dgp-commitInput::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-primary) 45%,transparent)}
.dgp-btn{border:1px solid var(--dsw-alias-border-l2);background:0 0;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);font-size:13px;font-weight:400;line-height:20px;padding:5px 12px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.dgp-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dgp-btn:disabled{opacity:.5;cursor:not-allowed}
.dgp-btn[data-variant="primary"]{background:var(--dsw-alias-button-info-fill);border-color:transparent;color:#fff}
.dgp-btn[data-variant="primary"]:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-button-info-fill) 88%,#000)}
.dgp-btn[data-variant="danger"]{color:var(--dsw-alias-state-error-primary)}
.dgp-btn[data-variant="dangerFill"]{background:var(--dsw-alias-state-error-primary);border-color:transparent;color:#fff}
.dgp-btn[data-variant="dangerFill"]:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 88%,#000)}
.dgp-btn[data-variant="ghost"]{border-color:transparent}
.dgp-btn svg{flex:none}
.dgp-chk{margin:0;cursor:pointer;accent-color:var(--dsw-alias-state-business-primary)}
.dgp-chkLbl{display:inline-flex;gap:4px;align-items:center;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dgp-chip{display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border-radius:999px;font-size:11px;line-height:18px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap}
.dgp-chip[data-tone="success"]{color:#fff;background:var(--dsw-alias-state-success-primary);border-color:transparent}
.dgp-chip[data-tone="warn"]{color:#fff;background:var(--dsw-alias-state-warn-primary);border-color:transparent}
.dgp-chip[data-tone="error"]{color:#fff;background:var(--dsw-alias-state-error-primary);border-color:transparent}
.dgp-chip[data-tone="primary"]{color:#fff;background:var(--dsw-alias-state-business-primary);border-color:transparent}
.dgp-chip b{font-weight:700}
.dgp-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.dgp-branchSel{position:relative;display:inline-flex;align-items:center;gap:6px;padding:7px 14px 7px 10px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap;max-width:560px;min-width:0;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}
.dgp-branchSel:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.dgp-branchSel[data-open="true"]{border-color:var(--dsw-alias-state-business-primary)}
.dgp-branchSelIcon{display:inline-flex;align-items:center;color:var(--dsw-alias-label-secondary);flex:none}
.dgp-branchSelName{font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-weight:600;max-width:440px;min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:var(--dsw-font-mono,ui-monospace,monospace)}
.dgp-branchSelArrow{display:inline-flex;align-items:center;color:var(--dsw-alias-label-secondary);flex:none;transition:transform .14s ease}
.dgp-branchSelArrow[data-open="true"]{transform:rotate(180deg);color:var(--dsw-alias-label-primary)}
.dgp-branchTab{position:relative;display:inline-flex;align-items:center;flex:none}
.dgp-branchPop{position:fixed;left:0;top:0;z-index:60;width:460px;max-width:90vw;background:color-mix(in srgb,var(--dsw-alias-bg-base) 88%,transparent);backdrop-filter:blur(18px) saturate(1.35);-webkit-backdrop-filter:blur(18px) saturate(1.35);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.1);display:flex;flex-direction:column;gap:6px;padding:8px;animation:dgp-scale .14s cubic-bezier(.2,.8,.2,1);will-change:transform}
.dgp-branchPopHead{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);line-height:18px}
.dgp-branchSearch{box-sizing:border-box;width:100%;height:30px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:0 10px;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:none}
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
.dgp-sectionTitle{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);margin:0;font-weight:500;display:flex;align-items:center;gap:8px}
.dgp-link{background:0 0;border:none;cursor:pointer;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;text-decoration:none;padding:0}
.dgp-link:hover{text-decoration:underline}
.dgp-linkMuted{color:var(--dsw-alias-label-secondary)}
/* Unified ghost action button for every in-page operation */
.dgp-lbtn{display:inline-flex;align-items:center;gap:4px;background:transparent;border:1px solid transparent;border-radius:7px;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;line-height:20px;padding:1px 8px;cursor:pointer;white-space:nowrap;flex:none}
.dgp-lbtn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-lbtn[data-tone="default"]{color:var(--dsw-alias-label-secondary)}
.dgp-lbtn[data-tone="default"]:hover{color:var(--dsw-alias-label-primary)}
.dgp-lbtn[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dgp-lbtn[data-active="true"]{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 14%,transparent);color:var(--dsw-alias-state-business-primary)}
.dgp-lbtn[data-disabled="true"]{opacity:.45;cursor:default}
.dgp-lbtn[data-disabled="true"]:hover{background:transparent}
.dgp-rows{display:flex;flex-direction:column;gap:1px}
.dgp-row{display:flex;align-items:center;gap:8px;padding:3px 6px;border-radius:6px;font-size:13px;line-height:22px}
.dgp-row[data-clickable="true"]{cursor:pointer}
.dgp-row[data-clickable="true"]:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-row[data-selected="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-row[data-current="true"] .dgp-rowPath{font-weight:600}
.dgp-row[data-current="true"]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 6%,transparent)}
.dgp-rowPath{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px}
.dgp-rowMeta{color:var(--dsw-alias-label-secondary);font-size:11px;white-space:nowrap}
.dgp-fileActs{display:none;gap:6px;align-items:center;flex:none}
.dgp-row:hover .dgp-fileActs{display:inline-flex}
.dgp-fileActs .dgp-btn{padding:1px 6px;font-size:11px}
.dgp-badge{font-size:10px;line-height:16px;padding:0 6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap}
.dgp-badge[data-tone="success"]{color:#fff;background:var(--dsw-alias-state-success-primary);border-color:transparent}
.dgp-badge[data-tone="info"]{color:#fff;background:var(--dsw-alias-button-info-fill);border-color:transparent}
.dgp-badge[data-tone="remote"]{color:var(--dsw-alias-label-secondary);background:transparent;border:1px dashed var(--dsw-alias-border-l2)}
.dgp-badge[data-tone="warn"]{color:#fff;background:var(--dsw-alias-state-warn-primary);border-color:transparent}
.dgp-badge[data-tone="error"]{color:#fff;background:var(--dsw-alias-state-error-primary);border-color:transparent}
.dgp-tree{display:flex;flex-direction:column;gap:1px;max-height:420px;overflow-y:auto}
.dgp-treeArrow{width:14px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:11px;flex:none;display:inline-flex;align-items:center;justify-content:center;transition:transform .12s ease}
.dgp-treeArrow[data-open="true"]{transform:rotate(90deg)}
.dgp-treeName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-pre{margin:0;font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px;line-height:18px;white-space:pre;overflow:auto}
.dgp-preWrap{white-space:pre-wrap;word-break:break-all}
.dgp-diff{display:flex;flex-direction:column;flex:1;min-height:0;font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px;line-height:19px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:auto;contain:content}
.dgp-diffLine{white-space:pre;padding:0}
.dgp-diffSpan{display:inline-block;min-width:100%;box-sizing:border-box;padding:0 10px}
.dgp-diffHunk{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,transparent);color:var(--dsw-alias-label-primary);font-weight:600}
.dgp-diffMeta{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1)}
.dgp-diffAdd{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,transparent);color:var(--dsw-alias-state-success-primary)}
.dgp-diffDel{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary)}
.dgp-diffWordAdd{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 34%,transparent);color:var(--dsw-alias-label-primary);font-weight:600}
.dgp-diffWordDel{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 30%,transparent);color:var(--dsw-alias-label-primary);font-weight:600}
.dgp-diffWordSame{color:var(--dsw-alias-label-primary)}
.dgp-diffStats{display:flex;gap:6px;padding:0 10px;margin:6px 0 2px}
.dgp-textarea{width:100%;min-height:64px;resize:vertical;box-sizing:border-box;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;outline:none}
.dgp-textarea:focus{border-color:var(--dsw-alias-state-business-primary)}
.dgp-textarea::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-primary) 45%,transparent)}
.dgp-error{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent);border:1px solid var(--dsw-alias-state-error-primary);border-radius:8px;padding:8px 10px;color:var(--dsw-alias-state-error-primary);font-size:13px;display:flex;align-items:center;gap:8px}
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
.dgp-opTitle{font-size:13px;font-weight:600;line-height:20px;color:var(--dsw-alias-label-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-op[data-status="error"] .dgp-opTitle{color:var(--dsw-alias-state-error-primary)}
.dgp-opClose{border:none;background:0 0;cursor:pointer;color:var(--dsw-alias-label-secondary);width:24px;height:24px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0}
.dgp-opClose:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-progress{height:4px;border-radius:2px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;position:relative}
.dgp-progressBar{position:absolute;top:0;bottom:0;left:0;width:38%;border-radius:2px;background:var(--dsw-alias-state-business-primary);animation:dgp-indeterminate 1.2s cubic-bezier(.4,0,.6,1) infinite}
.dgp-opDetail{margin:0;font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px;line-height:18px;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary);max-height:150px;overflow:auto}
.dgp-op[data-status="error"] .dgp-opDetail{color:var(--dsw-alias-state-error-primary)}
@keyframes dgp-spin{to{transform:rotate(360deg)}}
@keyframes dgp-indeterminate{0%{left:-38%}50%{left:62%}100%{left:100%}}
/* ── confirmation dialog (dangerous ops) ── */
.dgp-confirm{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);-webkit-backdrop-filter:var(--dsw-mask-blur);animation:dgp-fade .14s ease}
.dgp-confirmCard{width:400px;max-width:88vw;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:16px;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.12);padding:18px 20px;display:flex;flex-direction:column;gap:10px;animation:dgp-scale .14s cubic-bezier(.2,.8,.2,1)}
.dgp-confirmTitle{font-size:14px;font-weight:600;line-height:22px;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:8px}
.dgp-confirmTitle[data-danger="true"]{color:var(--dsw-alias-state-error-primary)}
.dgp-confirmMsg{font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;word-break:break-word}
.dgp-confirmActions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}
/* ── Git tab vertical layout ──
   chips → actions → op output → work area (changes + commit box; collapses to
   2:8 master-detail when a diff opens) → history (collapsed bar by default). */
.dgp-gitTop{display:flex;flex-direction:column;gap:10px;flex:none;min-height:0}
.dgp-gitWork{flex:1 1 auto;min-height:340px;display:flex;flex-direction:column;gap:12px}
.dgp-gitWork[data-diff="true"]{display:grid;grid-template-columns:minmax(260px,3fr) minmax(0,7fr)}
.dgp-gitCol{display:flex;flex-direction:column;gap:12px;min-height:0;min-width:0}
.dgp-gitCard{display:flex;flex-direction:column;min-height:0;background:color-mix(in srgb,var(--dsw-alias-bg-base) 92%,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:10px 12px}
.dgp-gitGrow{flex:1}
.dgp-gitScroll{flex:1;min-height:0;overflow-y:auto;contain:content}
.dgp-diffCard{min-height:0;min-width:0;align-self:stretch}
.dgp-histBar{flex:none;display:flex;align-items:center;gap:8px;width:100%;border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-base);cursor:pointer;padding:8px 12px;font:inherit;color:var(--dsw-alias-label-primary);text-align:left}
.dgp-histBar:hover{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dgp-histBar>svg{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-histCard{flex:none}
.dgp-histList{max-height:min(300px,38vh)}
.dgp-commitView{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.dgp-commitHead{display:flex;align-items:center;gap:8px;flex:none;min-width:0}
.dgp-commitGrid{flex:1;min-height:0;display:grid;grid-template-columns:minmax(260px,3fr) minmax(0,7fr);gap:12px}
.dgp-logRow{display:flex;align-items:center;gap:8px}
.dgp-dirRow{color:var(--dsw-alias-label-primary);font-weight:500}
.dgp-dirRow>svg{flex:none;color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent)}
/* Compact change-tree rows: tighter vertical rhythm, deeper levels hide the
   status text so long filenames stay visible despite the indent. */
.dgp-treeRow{padding-top:1px;padding-bottom:1px;line-height:20px;gap:6px}
.dgp-treeRow .dgp-rowPath{font-size:11.5px}
.dgp-treeDeep .dgp-rowMeta{display:none}
.dgp-treeDeep .dgp-rowActions .dgp-btn{padding:1px 6px;font-size:11px}
.dgp-logMenuBtn{border:none;background:0 0;cursor:pointer;color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent);width:22px;height:22px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0;font:inherit;font-size:14px;line-height:1}
.dgp-logMenuBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-logMenu{position:fixed;z-index:1300;min-width:224px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 88%,transparent);backdrop-filter:blur(18px) saturate(1.35);-webkit-backdrop-filter:blur(18px) saturate(1.35);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.14);padding:4px;display:flex;flex-direction:column;transform:translateX(-100%);animation:dgp-logmenu-in .12s cubic-bezier(.2,.8,.2,1);will-change:transform}
@keyframes dgp-logmenu-in{from{transform:translateX(-100%) scale(.96);opacity:0}to{transform:translateX(-100%) scale(1);opacity:1}}
.dgp-logMenuItem{border:none;background:0 0;cursor:pointer;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:6px 10px;border-radius:7px;display:flex;align-items:center;gap:8px;text-align:left}
.dgp-logMenuItem:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-logMenuItem[data-danger="true"]{color:var(--dsw-alias-state-error-primary)}
.dgp-logMenuItem>svg{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-logMenuItem[data-danger="true"]>svg{color:var(--dsw-alias-state-error-primary)}
.dgp-muted{color:var(--dsw-alias-label-secondary)}
.dgp-empty{color:var(--dsw-alias-label-secondary);padding:8px 0}
.dgp-hint{font-size:12px;color:var(--dsw-alias-label-secondary)}
/* ── master-detail file browser (single list ⇄ 50/50 split ⇄ 1:9 preview) ── */
.dgp-crumbs{display:flex;align-items:center;gap:2px;flex-wrap:wrap;flex:none;padding:0 2px;font-size:12px}
.dgp-crumb{border:none;background:0 0;cursor:pointer;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:20px;padding:2px 6px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.dgp-crumb:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-crumbActive{color:var(--dsw-alias-label-primary);font-weight:500}
/* External-file crumb segments: display-only, no hover / pointer affordance. */
.dgp-crumbStatic{cursor:default;user-select:auto}
.dgp-crumbStatic:hover{background:0 0;color:var(--dsw-alias-label-secondary)}
/* Rightmost crumb action: open the current directory in the system explorer.
   Dashed outline = "action button" affordance, with a text label beside the icon. */
.dgp-crumbDir{border:1px dashed var(--dsw-alias-border-l2);background:0 0;cursor:pointer;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:20px;padding:2px 8px;border-radius:7px;display:inline-flex;align-items:center;gap:4px;flex:none;margin-left:auto;white-space:nowrap}
.dgp-crumbDir:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-state-business-primary)}
.dgp-searchRow{display:flex;align-items:center;gap:6px;flex:none;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:0 8px;position:relative}
.dgp-searchRow:focus-within{border-color:var(--dsw-alias-state-business-primary)}
.dgp-searchIcon{display:inline-flex;flex:none;color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent)}
.dgp-search{border:none;background:0 0;outline:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:28px;min-width:0;flex:1}
.dgp-search::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-primary) 45%,transparent)}
.dgp-searchHist{position:fixed;left:0;top:0;z-index:60;background:color-mix(in srgb,var(--dsw-alias-bg-base) 92%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 0 1px rgba(0,0,0,.2),0 4px 16px rgba(0,0,0,.08);padding:6px;display:flex;flex-direction:column;gap:2px;animation:dgp-scale .12s cubic-bezier(.2,.8,.2,1);will-change:transform}
.dgp-searchHistHead{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:color-mix(in srgb,var(--dsw-alias-label-primary) 55%,transparent);padding:2px 6px 4px}
.dgp-searchHistItem{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:7px;cursor:pointer;font-size:12px;color:var(--dsw-alias-label-primary);min-width:0;border:none;background:0 0;font-family:inherit;text-align:left}
.dgp-searchHistItem:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-searchHistItem .dgp-treeName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--dsw-font-mono,ui-monospace,monospace)}
.dgp-pvSwitch{display:inline-flex;gap:2px}
.dgp-crumbSep{color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent);display:inline-flex;align-items:center;flex:none;white-space:pre}
.dgp-split{display:grid;flex:1;min-height:0;gap:0;transition:grid-template-columns .22s cubic-bezier(.2,.8,.2,1)}
.dgp-split[data-dragging="true"]{transition:none;cursor:col-resize}
.dgp-gutter{width:100%;height:100%;cursor:col-resize;flex:none;position:relative;display:flex;align-items:center;justify-content:center;user-select:none;touch-action:none}
.dgp-gutter::before{content:"";width:2px;height:100%;border-radius:2px;background:var(--dsw-alias-border-l1);transition:background .15s}
.dgp-gutter:hover::before{background:var(--dsw-alias-border-l2)}
.dgp-gutter:active::before{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-pane{min-width:0;overflow:auto;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 92%,transparent);padding:6px;display:flex;flex-direction:column;gap:1px;transition:background .2s;contain:content}
.dgp-paneTitle{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);padding:2px 6px 4px;font-weight:500;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-paneEmpty{color:var(--dsw-alias-label-secondary);font-size:12px;padding:10px 8px}
.dgp-fileIcon{display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-previewHead{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dgp-previewName{font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:13px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.dgp-previewBody{flex:1;min-height:0;overflow:auto;padding:12px 14px;contain:content}
/* Markdown chunked-render progress: thin bar above the streaming content. */
.dgp-mdProg{height:3px;border-radius:2px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;margin:-4px 0 10px}
.dgp-mdProgBar{height:100%;background:var(--dsw-alias-state-business-primary);transition:width .15s ease}
/* Full-bleed frame previews (PDF viewer / sandboxed HTML): no padding,
   the iframe fills the pane. */
.dgp-previewBody.dgp-frameBody{padding:0;display:flex}
.dgp-frameBody iframe{flex:1;width:100%;min-height:0;border:none;background:#fff}
/* Centered image preview (blob URL <img>), contained within the pane. */
.dgp-mediaBody{flex:1;min-height:100%;display:flex;align-items:center;justify-content:center;overflow:auto}
.dgp-mediaBody img{max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,.18)}
/* Inline CodeMirror editing: the host must fill the preview pane so the
   editor's own scroller can scroll — previewBody becomes a column flex
   container, host is flex:1 (min-height:0) and the .cm-editor height:100%. */
.dgp-editBody{display:flex;flex-direction:column;padding:0;overflow:hidden}
.dgp-editorHost{flex:1;min-height:0;overflow:hidden;border-radius:0 0 10px 10px}
.dgp-editorHost .cm-editor{height:100%;font-size:13px}
.dgp-editorHost .cm-scroller{font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Consolas,monospace);line-height:1.6}
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
.dgp-md{font-size:13px;line-height:1.7;color:var(--dsw-alias-label-primary);overflow-wrap:break-word}
.dgp-previewCut{color:color-mix(in srgb,var(--dsw-alias-label-primary) 55%,transparent);font-size:12px;margin:10px 0 0;padding-top:8px;border-top:1px dashed var(--dsw-alias-border-l2)}
.dgp-md h1{font-size:20px;font-weight:600;margin:2px 0 12px}
.dgp-md h2{font-size:17px;font-weight:600;margin:18px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dgp-md h3{font-size:15px;font-weight:600;margin:14px 0 6px}
.dgp-md h4,.dgp-md h5,.dgp-md h6{font-size:13px;font-weight:600;margin:12px 0 6px}
.dgp-md p{margin:0 0 10px}
.dgp-md ul,.dgp-md ol{margin:0 0 10px;padding-left:22px}
.dgp-md li{margin:2px 0}
.dgp-md code{font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px;background:var(--dsw-alias-bg-layer-2);border-radius:4px;padding:1px 5px}
.dgp-md pre{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px 12px;overflow:auto;margin:0 0 12px}
.dgp-md pre code{background:0 0;padding:0;font-size:12px;line-height:1.6}
.dgp-md a{color:var(--dsw-alias-state-business-primary);text-decoration:none}
.dgp-md a:hover{text-decoration:underline}
.dgp-md blockquote{margin:0 0 12px;padding:4px 12px;border-left:3px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-radius:0 8px 8px 0}
.dgp-md hr{border:none;border-top:1px solid var(--dsw-alias-border-l1);margin:14px 0}
.dgp-md table{border-collapse:collapse;margin:0 0 12px;font-size:12px;width:100%}
.dgp-md th,.dgp-md td{border:1px solid var(--dsw-alias-border-l2);padding:5px 10px;text-align:left}
.dgp-md th{background:var(--dsw-alias-bg-layer-1);font-weight:500}
.dgp-md img{max-width:100%}
`;
			document.head.appendChild(style);
		}
		//#endregion

		//#region icons
		// ── inlined DSH icons (exact SVG paths from dsh-client-ui-primitives) ─────
		const svg = (child, viewBox = "0 0 16 16") => ({ size = 16, className, style }) =>
			h("svg", { width: size, height: size, viewBox, fill: "none", xmlns: "http://www.w3.org/2000/svg", className, style, "aria-hidden": "true" }, child);
		const IconFolderOpen = svg(h("path", { d: "M5.19629 1.57104C5.81144 1.5711 6.38623 1.8786 6.72754 2.39038L7.19922 3.09839C7.28454 3.22635 7.42824 3.30344 7.58203 3.30347H12.1699C13.5039 3.30348 14.5859 4.38548 14.5859 5.71948V6.62671C15.2694 7.02689 15.6605 7.85012 15.4385 8.68726L14.3848 12.658C14.1037 13.7164 13.1449 14.4527 12.0498 14.4529H2.91699C1.51651 14.4529 0.451662 13.2814 0.501954 11.9519V3.98706C0.501954 2.65305 1.58396 1.57104 2.91797 1.57104H5.19629ZM3.7793 7.75562C3.30994 7.75562 2.89883 8.07153 2.77832 8.52515L1.91602 11.7722C1.74167 12.4291 2.23734 13.073 2.91699 13.073H12.0498C12.5191 13.0728 12.9304 12.757 13.0508 12.3035L14.1045 8.33374C14.1819 8.04202 13.9619 7.756 13.6602 7.75562H3.7793ZM2.91797 2.9519C2.34625 2.9519 1.88281 3.41534 1.88281 3.98706V7.2937C2.33068 6.7269 3.02249 6.37476 3.7793 6.37476H13.2051V5.71948C13.2051 5.14777 12.7416 4.68433 12.1699 4.68433H7.58203C6.96675 4.6843 6.39209 4.37595 6.05078 3.86401L5.5791 3.15601C5.49379 3.02821 5.34995 2.95196 5.19629 2.9519H2.91797Z", fill: "currentColor" }));
		const IconBranch = svg(h("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M13.0762 1.37207C14.0846 1.37228 14.9021 2.19077 14.9023 3.19922C14.9022 4.20772 14.0847 5.02518 13.0762 5.02539C12.2967 5.02539 11.6325 4.53691 11.3701 3.84961H4.35547C4.79397 4.26458 5.15861 4.7644 5.41699 5.33496L7.10645 9.06738C7.88526 10.7875 9.55104 11.9228 11.4189 12.0371C11.7085 11.4109 12.3411 10.9756 13.0762 10.9756C14.0843 10.9759 14.9023 11.7936 14.9023 12.8018C14.9023 13.81 14.0843 14.6277 13.0762 14.6279C12.2534 14.6279 11.5574 14.0832 11.3291 13.335C8.9868 13.1879 6.89981 11.7612 5.92285 9.60352L4.23242 5.87109C3.67503 4.64033 2.44878 3.84961 1.09766 3.84961V2.54883C1.10665 2.54883 1.11601 2.54975 1.125 2.5498L11.3701 2.54883C11.6326 1.86151 12.2969 1.37207 13.0762 1.37207ZM13.0762 12.2764C12.7858 12.2764 12.5508 12.5114 12.5508 12.8018C12.5508 13.0921 12.7858 13.3281 13.0762 13.3281C13.3664 13.3279 13.6025 13.092 13.6025 12.8018C13.6025 12.5115 13.3664 12.2766 13.0762 12.2764ZM13.0762 2.67285C12.7855 2.67285 12.55 2.90861 12.5498 3.19922C12.5499 3.48987 12.7855 3.72559 13.0762 3.72559C13.3667 3.72538 13.6024 3.48975 13.6025 3.19922C13.6023 2.90874 13.3666 2.67306 13.0762 2.67285Z", fill: "currentColor" }));
		const IconClose = svg([h("path", { d: "M14.1168 13.197L13.197 14.1167L1.8833 2.80303L2.80309 1.88324L14.1168 13.197Z", fill: "currentColor" }), h("path", { d: "M13.197 1.88326L14.1168 2.80305L2.80309 14.1168L1.8833 13.197L13.197 1.88326Z", fill: "currentColor" })]);
		const IconRefresh = svg(h("path", { d: "M7.92136 0.349152C10.3744 0.349234 12.5564 1.5052 13.9557 3.29894L15.1281 2.12759C15.3303 1.92546 15.6767 2.06943 15.6767 2.35538V5.53923C15.6766 5.71626 15.5329 5.85976 15.3559 5.86002H12.171C11.8854 5.8597 11.7426 5.51465 11.9443 5.31249L12.9641 4.29056C11.8237 2.74305 9.98908 1.74106 7.92136 1.74097C4.46436 1.74097 1.66233 4.543 1.66233 8C1.66233 11.457 4.46436 14.259 7.92136 14.259C11.3782 14.2589 14.1804 11.4569 14.1804 8H15.5722C15.5722 12.2251 12.1465 15.6507 7.92136 15.6508C3.69614 15.6508 0.270508 12.2252 0.270508 8C0.270508 3.77478 3.69614 0.349152 7.92136 0.349152Z", fill: "currentColor" }));
		const IconChevronRight = svg(h("path", { d: "M5.5 2.15137L5.92383 2.57617L8.65137 5.30273C8.90706 5.55843 9.13382 5.78438 9.29785 5.98828C9.46883 6.20088 9.61756 6.44405 9.66602 6.75C9.69222 6.91565 9.69222 7.08435 9.66602 7.25C9.61756 7.55595 9.46883 7.79912 9.29785 8.01172C9.13382 8.21561 8.90706 8.44157 8.65137 8.69727L5.92383 11.4238L5.5 11.8486L4.65137 11L5.07617 10.5762L7.80273 7.84863C8.07732 7.57405 8.24849 7.40124 8.3623 7.25977C8.46904 7.12709 8.47813 7.07728 8.48047 7.0625C8.48703 7.02105 8.48703 6.97895 8.48047 6.9375C8.47813 6.92272 8.46904 6.87291 8.3623 6.74023C8.24848 6.59876 8.07732 6.42595 7.80273 6.15137L5.07617 3.42383L4.65137 3L5.5 2.15137Z", fill: "currentColor" }), "0 0 14 14");
		const IconCheck = svg(h("path", { d: "M6.1538 13.5L0.5 7.8462L1.9481 6.3981L6.1538 10.6038L14.0519 2.7057L15.5 4.1538L6.1538 13.5Z", fill: "currentColor" }));
		const IconFolderClose = svg(h("path", { transform: "translate(1.5 2.429)", d: "M5.05582 0.518756L4.50669 0.86654L5.05582 0.518756ZM13 9.4837L13.65 9.4837L13.65 3.53962L13 3.53962L12.35 3.53962L12.35 9.4837L13 9.4837ZM11.3264 1.86603L11.3264 1.21603L6.52313 1.21603L6.52313 1.86603L6.52313 2.51603L11.3264 2.51603L11.3264 1.86603ZM5.58054 1.34727L6.12968 0.999489L5.60495 0.170972L5.05582 0.518756L4.50669 0.86654L5.03141 1.69506L5.58054 1.34727ZM4.11323 1.23058e-13L4.11323 -0.65L1.67359 -0.65L1.67359 5.00699e-14L1.67359 0.65L4.11323 0.65L4.11323 1.23058e-13ZM0 1.67359L-0.65 1.67359L-0.65 9.4837L0 9.4837L0.65 9.4837L0.65 1.67359L0 1.67359ZM11.3264 11.1573L11.3264 10.5073L1.67359 10.5073L1.67359 11.1573L1.67359 11.8073L11.3264 11.8073L11.3264 11.1573ZM0 9.4837L-0.65 9.4837C-0.65 10.767 0.390308 11.8073 1.67359 11.8073L1.67359 11.1573L1.67359 10.5073C1.10828 10.5073 0.65 10.049 0.65 9.4837L0 9.4837ZM1.67359 5.00699e-14L1.67359 -0.65C0.390307 -0.65 -0.65 0.390309 -0.65 1.67359L0 1.67359L0.65 1.67359C0.65 1.10828 1.10828 0.65 1.67359 0.65L1.67359 5.00699e-14ZM5.05582 0.518756L5.60495 0.170972C5.28121 -0.340193 4.71829 -0.65 4.11323 -0.65L4.11323 1.23058e-13L4.11323 0.65C4.27282 0.65 4.4213 0.731715 4.50669 0.86654L5.05582 0.518756ZM6.52313 1.86603L6.52313 1.21603C6.36354 1.21603 6.21507 1.13431 6.12968 0.999489L5.58054 1.34727L5.03141 1.69506C5.35515 2.20622 5.91808 2.51603 6.52313 2.51603L6.52313 1.86603ZM13 3.53962L13.65 3.53962C13.65 2.25634 12.6097 1.21603 11.3264 1.21603L11.3264 1.86603L11.3264 2.51603C11.8917 2.51603 12.35 2.97431 12.35 3.53962L13 3.53962ZM13 9.4837L12.35 9.4837C12.35 10.049 11.8917 10.5073 11.3264 10.5073L11.3264 11.1573L11.3264 11.8073C12.6097 11.8073 13.65 10.767 13.65 9.4837L13 9.4837Z", fill: "currentColor" }));
		const IconChevronDown = svg(h("path", { d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z", fill: "currentColor" }), "0 0 14 14");
		const IconChevronUp = svg(h("path", { transform: "translate(0 14) scale(1 -1)", d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z", fill: "currentColor" }), "0 0 14 14");
		const IconChevronLeft = svg(h("path", { d: "M8.5 2.15137L8.07617 2.57617L5.34863 5.30273C5.09294 5.55843 4.86618 5.78438 4.70215 5.98828C4.53117 6.20088 4.38244 6.44405 4.33398 6.75C4.30778 6.91565 4.30778 7.08435 4.33398 7.25C4.38244 7.55595 4.53117 7.79912 4.70215 8.01172C4.86618 8.21561 5.09294 8.44157 5.34863 8.69727L8.07617 11.4238L8.5 11.8486L9.34863 11L8.92383 10.5762L6.19727 7.84863C5.92268 7.57405 5.75151 7.40124 5.6377 7.25977C5.53096 7.12709 5.52187 7.07728 5.51953 7.0625C5.51297 7.02105 5.51297 6.97895 5.51953 6.9375C5.52187 6.92272 5.53096 6.87291 5.6377 6.74023C5.75152 6.59876 5.92268 6.42595 6.19727 6.15137L8.92383 3.42383L9.34863 3L8.5 2.15137Z", fill: "currentColor" }), "0 0 14 14");
		const IconCode = svg(h("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M12.3368 1.53569L11.931 4.43172H14.8086V5.79673H11.7404L11.1962 9.67859H14.2839V11.0436H11.0056L10.4994 14.6529L9.14873 14.4643L9.62731 11.0436H5.75876L5.25252 14.6529L3.90186 14.4643L4.38043 11.0436H1.69141V9.67859H4.57104L5.11417 5.79673H2.21609V4.43172H5.30581L5.73724 1.34713L7.08995 1.53569L6.68414 4.43172H10.5527L10.9841 1.34713L12.3368 1.53569ZM5.94937 9.67859H9.81791L10.361 5.79673H6.49353L5.94937 9.67859Z", fill: "currentColor" }));
		const IconData = svg([
			h("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M12.0997 8.54554C12.2905 8.54989 12.3541 8.58056 12.4535 8.74614L12.8849 9.46387C12.9851 9.63071 13.0464 9.66013 13.2388 9.66447H14.1138C14.3417 9.66448 14.3512 9.66937 14.4686 9.86507L14.892 10.5717C14.9942 10.7422 14.9948 10.8247 14.892 10.9961L14.4756 11.6906C14.3741 11.8677 14.3694 11.9379 14.4756 12.115L14.892 12.8096C14.9942 12.9801 14.9947 13.0625 14.892 13.234L14.4686 13.9406C14.3643 14.1028 14.3063 14.1354 14.1138 14.1412H13.2388C13.0465 14.1456 12.985 14.1752 12.8849 14.3418L12.4535 15.0595C12.353 15.2195 12.2895 15.2558 12.0997 15.2601H11.2237C10.9962 15.2601 10.9871 15.2548 10.8699 15.0595L10.4384 14.3418C10.3383 14.175 10.2767 14.1456 10.0846 14.1412H9.2096C9.01854 14.1355 8.95761 14.1006 8.85477 13.9406L8.43139 13.234C8.32562 13.0576 8.33148 12.9862 8.43139 12.8096L8.84771 12.115C8.95165 11.9416 8.94659 11.863 8.84771 11.6906L8.43139 10.9961C8.32767 10.8232 8.33411 10.7437 8.43139 10.5717L8.85477 9.86507C8.95447 9.69891 9.01875 9.67017 9.2096 9.66447H10.0846C10.2741 9.66441 10.3414 9.62547 10.4384 9.46387L10.8699 8.74614C10.987 8.55106 10.9963 8.54554 11.2237 8.54554H12.0997ZM11.6612 10.232C11.3326 10.7798 10.8155 11.0948 10.1743 11.106C10.4443 11.61 10.4425 12.1976 10.1743 12.6987C10.803 12.7096 11.3391 13.0359 11.6612 13.5727C11.9855 13.0323 12.5131 12.7098 13.148 12.6987C12.879 12.196 12.8789 11.6086 13.148 11.106C12.5076 11.0948 11.9894 10.7794 11.6612 10.232Z", fill: "currentColor" }),
			h("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M7.51205 0.790627C9.19055 0.790649 10.7401 1.0691 11.892 1.54364C12.4664 1.78029 12.9719 2.07885 13.3436 2.4408C13.7171 2.80467 13.9916 3.27253 13.9918 3.82384V7.90442C13.6067 7.69532 13.1907 7.53597 12.7529 7.43366V5.66454C12.4928 5.82898 12.2028 5.97601 11.892 6.10405C10.74 6.57865 9.19071 6.85706 7.51205 6.85706C5.8337 6.85703 4.285 6.57852 3.13309 6.10405C2.82215 5.97593 2.53164 5.8291 2.27121 5.66454V7.4135C2.27134 7.75678 2.6066 8.27106 3.62502 8.73405C4.58641 9.17097 5.95762 9.45591 7.50499 9.45681C7.24582 9.83133 7.03684 10.2434 6.88706 10.6826C5.44388 10.6162 4.12516 10.3216 3.11192 9.86104C2.81708 9.72698 2.53185 9.56866 2.27121 9.38928V11.2542C2.27158 11.5974 2.60697 12.1109 3.62502 12.5737C4.41933 12.9347 5.4937 13.1898 6.71569 13.2693C6.80349 13.7128 6.9513 14.1345 7.14814 14.5273C5.60324 14.4862 4.18593 14.1889 3.11192 13.7007C2.01039 13.1998 1.03366 12.3814 1.03333 11.2542V3.82384C1.03352 3.27273 1.30721 2.80461 1.68049 2.4408C2.05211 2.07893 2.55887 1.78026 3.13309 1.54364C4.28492 1.06926 5.83393 0.790683 7.51205 0.790627ZM7.51205 2.02851C5.95492 2.02857 4.57354 2.29079 3.60486 2.68979C3.11958 2.88977 2.76667 3.11253 2.5454 3.32788C2.32671 3.54101 2.2714 3.7089 2.27121 3.82384C2.27121 3.93882 2.32624 4.10625 2.5454 4.3198C2.76667 4.53527 3.11927 4.75781 3.60486 4.9579C4.5736 5.35699 5.95467 5.61914 7.51205 5.61918C9.06942 5.61918 10.4505 5.35695 11.4192 4.9579C11.9051 4.75773 12.2584 4.53536 12.4797 4.3198C12.6988 4.10627 12.7529 3.93882 12.7529 3.82384C12.7527 3.70889 12.6984 3.54104 12.4797 3.32788C12.2584 3.11239 11.9049 2.88989 11.4192 2.68979C10.4505 2.29079 9.06925 2.02853 7.51205 2.02851Z", fill: "currentColor" })
		]);
		const IconListPen = svg([
			h("path", { d: "M10.8239 3.54733V4.78443H4.63437V3.54733H10.8239Z", fill: "currentColor" }),
			h("path", { d: "M10.8239 6.12629V7.36338H4.63437V6.12629H10.8239Z", fill: "currentColor" }),
			h("path", { d: "M9.073 8.70524V9.94234H4.63437V8.70524H9.073Z", fill: "currentColor" }),
			h("path", { d: "M9.13321 0.573526C10.0076 0.573525 10.7179 0.572522 11.285 0.63397C11.8645 0.696791 12.3743 0.831648 12.8193 1.1548C13.0776 1.34246 13.3056 1.57047 13.4933 1.82875C13.8164 2.2737 13.9513 2.7836 14.0141 3.36303C14.0755 3.93015 14.0745 4.64049 14.0745 5.51485V6.1757L12.7327 7.5629V5.51485C12.7327 4.61092 12.732 3.9862 12.6803 3.5081C12.6298 3.0427 12.5379 2.79497 12.4083 2.61654C12.3033 2.47211 12.176 2.34472 12.0315 2.23977C11.8531 2.11016 11.6054 2.01823 11.14 1.96777C10.6618 1.91601 10.0372 1.91539 9.13321 1.91539H6.32658C5.42262 1.91539 4.79796 1.91604 4.31983 1.96777C3.85451 2.01819 3.60672 2.11029 3.42827 2.23977C3.28392 2.34465 3.15643 2.47223 3.0515 2.61654C2.9219 2.79496 2.82997 3.04274 2.7795 3.5081C2.72774 3.9862 2.72712 4.61092 2.72712 5.51485V10.023C2.72712 10.9273 2.72773 11.5525 2.7795 12.0307C2.82992 12.4959 2.92205 12.7429 3.0515 12.9213C3.15645 13.0657 3.28384 13.1931 3.42827 13.2981C3.60676 13.4277 3.85408 13.5206 4.31983 13.5711C4.79797 13.6228 5.42259 13.6234 6.32658 13.6234H6.87057L5.57707 14.9593C5.03527 14.9556 4.57031 14.9467 4.17476 14.9039C3.59508 14.841 3.08558 14.7063 2.64048 14.383C2.38215 14.1953 2.15422 13.9684 1.96653 13.7101C1.64319 13.2649 1.50851 12.7546 1.4457 12.1748C1.38432 11.6076 1.38525 10.8974 1.38525 10.023V5.51485C1.38525 4.64049 1.38426 3.93015 1.4457 3.36303C1.50853 2.78363 1.64341 2.27368 1.96653 1.82875C2.15417 1.57059 2.38228 1.34239 2.64048 1.1548C3.08544 0.831805 3.59533 0.696762 4.17476 0.63397C4.74193 0.572552 5.45218 0.573525 6.32658 0.573526H9.13321Z", fill: "currentColor" }),
			h("path", { d: "M14.2193 14.9553H10.0124L11.3744 13.6134H14.2193V14.9553Z", fill: "currentColor" }),
			h("path", { d: "M8.24493 13.3711L7.49015 14.8806C7.40148 15.058 7.58961 15.2461 7.76695 15.1574L9.27651 14.4027L14.6147 9.09934L13.5832 8.06775L8.24493 13.3711Z", fill: "currentColor" })
		]);
		const IconPaperclip = svg(h("path", { d: "M5.5498 9.75V5H6.9502V9.75C6.9502 10.3299 7.4201 10.7998 8 10.7998C8.5799 10.7998 9.0498 10.3299 9.0498 9.75V4.5C9.0498 2.9536 7.7964 1.7002 6.25 1.7002C4.7036 1.7002 3.4502 2.9536 3.4502 4.5V9.75C3.4502 12.2629 5.4871 14.2998 8 14.2998C10.5129 14.2998 12.5498 12.2629 12.5498 9.75V4H13.9502V9.75C13.9502 13.0361 11.2861 15.7002 8 15.7002C4.71391 15.7002 2.0498 13.0361 2.0498 9.75V4.5C2.04981 2.1804 3.9304 0.299806 6.25 0.299805C8.5696 0.299805 10.4502 2.1804 10.4502 4.5V9.75C10.4502 11.1031 9.3531 12.2002 8 12.2002C6.6469 12.2002 5.5498 11.1031 5.5498 9.75Z", fill: "currentColor" }));
		const IconGlobe = svg(h("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M7.00018 0.353516C10.6708 0.353535 13.6468 3.32958 13.6469 7.00018C13.6468 10.6708 10.6708 13.6468 7.00018 13.6469C3.32957 13.6468 0.353535 10.6708 0.353516 7.00018C0.353535 3.32957 3.32957 0.353531 7.00018 0.353516ZM5.44643 7.59661C5.49463 8.97506 5.70762 10.191 6.02136 11.0793C6.20141 11.5891 6.40328 11.9585 6.59898 12.1889C6.79501 12.4196 6.93213 12.454 7.00018 12.454C7.06822 12.454 7.20533 12.4197 7.40138 12.1889C7.59708 11.9585 7.79895 11.589 7.979 11.0793C8.29274 10.191 8.50574 8.97506 8.55394 7.59661H5.44643ZM1.57861 7.59661C1.80785 9.70467 3.2386 11.4509 5.1715 12.1388C5.07135 11.9317 4.97972 11.7098 4.89746 11.477C4.53084 10.4391 4.30224 9.0828 4.25357 7.59661H1.57861ZM9.74679 7.59661C9.69813 9.0828 9.46952 10.4391 9.1029 11.477C9.0206 11.7099 8.92818 11.9316 8.82797 12.1388C10.7613 11.4511 12.1925 9.70496 12.4218 7.59661H9.74679ZM5.1706 1.8616C3.23814 2.54963 1.80876 4.29604 1.5795 6.40376H4.25357C4.30224 4.91756 4.53083 3.56129 4.89746 2.5234C4.97968 2.29066 5.07051 2.0686 5.1706 1.8616ZM7.00018 1.54637C6.93213 1.54638 6.79503 1.5807 6.59898 1.81145C6.40332 2.04177 6.20139 2.41058 6.02136 2.92012C5.70754 3.80851 5.49461 5.02499 5.44643 6.40376H8.55394C8.50575 5.025 8.29282 3.80851 7.979 2.92012C7.79898 2.41059 7.59705 2.04177 7.40138 1.81145C7.20531 1.58067 7.06823 1.54637 7.00018 1.54637ZM8.82887 1.8616C8.92902 2.0687 9.02064 2.29053 9.1029 2.5234C9.46953 3.56129 9.69812 4.91756 9.74679 6.40376H12.4209C12.1916 4.29575 10.7618 2.54943 8.82887 1.8616Z", fill: "currentColor" }), "0 0 14 14");
		// ── branch operations (DSH outline-16 set) ───────────────────────────────
		const IconBranchOp = svg(h("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M13.0762 1.37207C14.0846 1.37228 14.9021 2.19077 14.9023 3.19922C14.9022 4.20772 14.0847 5.02518 13.0762 5.02539C12.2967 5.02539 11.6325 4.53691 11.3701 3.84961H4.35547C4.79397 4.26458 5.15861 4.7644 5.41699 5.33496L7.10645 9.06738C7.88526 10.7875 9.55104 11.9228 11.4189 12.0371C11.7085 11.4109 12.3411 10.9756 13.0762 10.9756C14.0843 10.9759 14.9023 11.7936 14.9023 12.8018C14.9023 13.81 14.0843 14.6277 13.0762 14.6279C12.2534 14.6279 11.5574 14.0832 11.3291 13.335C8.9868 13.1879 6.89981 11.7612 5.92285 9.60352L4.23242 5.87109C3.67503 4.64033 2.44878 3.84961 1.09766 3.84961V2.54883C1.10665 2.54883 1.11601 2.54975 1.125 2.5498L11.3701 2.54883C11.6326 1.86151 12.2969 1.37207 13.0762 1.37207ZM13.0762 12.2764C12.7858 12.2764 12.5508 12.5114 12.5508 12.8018C12.5508 13.0921 12.7858 13.3281 13.0762 13.3281C13.3664 13.3279 13.6025 13.092 13.6025 12.8018C13.6025 12.5115 13.3664 12.2766 13.0762 12.2764ZM13.0762 2.67285C12.7855 2.67285 12.55 2.90861 12.5498 3.19922C12.5499 3.48987 12.7855 3.72559 13.0762 3.72559C13.3667 3.72538 13.6024 3.48975 13.6025 3.19922C13.6023 2.90874 13.3666 2.67306 13.0762 2.67285Z", fill: "currentColor" }));
		const IconPlus = svg(h("path", { d: "M8.64453 1.5V7.34961H14.5V8.65039H8.64453V14.5H7.34473V8.65039H1.5V7.34961H7.34473V1.5H8.64453Z", fill: "currentColor" }));
		const IconEdit = svg(h("path", { d: "M9.94076 1.34942C10.7047 0.90231 11.6503 0.902415 12.4143 1.34942C12.7061 1.52015 12.9688 1.79118 13.3104 2.13284C13.6521 2.47448 13.9231 2.73721 14.0939 3.02894C14.5408 3.79294 14.5409 4.73856 14.0939 5.50251C13.9231 5.79415 13.652 6.05704 13.3104 6.39861L6.65932 13.0497C6.28068 13.4284 6.00695 13.7108 5.66543 13.9097C5.32391 14.1085 4.94315 14.2074 4.42705 14.3498L3.24394 14.6761C2.77527 14.8054 2.34538 14.9262 2.00131 14.9684C1.65196 15.0112 1.17964 15.0013 0.810764 14.6325C0.441921 14.2637 0.432107 13.7913 0.47486 13.442C0.517035 13.0979 0.6379 12.668 0.767181 12.1993L1.09352 11.0162C1.23588 10.5001 1.33481 10.1193 1.5336 9.77784C1.7325 9.43632 2.0149 9.1626 2.39355 8.78395L9.04466 2.13284C9.38625 1.79126 9.64911 1.52016 9.94076 1.34942ZM15.5427 14.8398H7.55223L8.96707 13.425H15.5427V14.8398ZM3.39382 9.78422C2.965 10.213 2.84244 10.3436 2.75709 10.49C2.67183 10.6366 2.61862 10.8079 2.45733 11.3925L2.13099 12.5756C2.00183 13.0439 1.92194 13.3419 1.88863 13.5536C2.10041 13.5204 2.39872 13.4416 2.86764 13.3123L4.05075 12.9859C4.63544 12.8246 4.80669 12.7715 4.95323 12.6862C5.09968 12.6008 5.23022 12.4783 5.65905 12.0494L10.721 6.98644L8.45577 4.72121L3.39382 9.78422ZM11.7 2.57079C11.3774 2.38198 10.9777 2.38198 10.6551 2.57079C10.5602 2.62647 10.4487 2.72931 10.0449 3.13311L9.45604 3.72094L11.7213 5.98617L12.3102 5.39833C12.7139 4.99457 12.8168 4.88307 12.8725 4.78818C13.0613 4.46561 13.0612 4.06585 12.8725 3.74326C12.8169 3.64827 12.7146 3.53752 12.3102 3.13311C11.9057 2.72863 11.795 2.6264 11.7 2.57079Z", fill: "currentColor" }));
		const IconDownload = svg(h("path", { d: "M15.3695 11.411L15.1234 12.8866C14.8869 14.3042 13.6603 15.3436 12.223 15.3436H3.77673C2.33958 15.3434 1.1128 14.3042 0.876343 12.8866L0.630249 11.411L2.05408 11.1747L2.29919 12.6493C2.41973 13.3713 3.04475 13.9001 3.77673 13.9003H12.223C12.9551 13.9002 13.58 13.3713 13.7006 12.6493L13.9457 11.1747L15.3695 11.411ZM8.72205 8.994C8.77717 8.93934 8.83792 8.88106 8.90271 8.81627L12.4828 5.23424L13.5043 6.25572L9.92224 9.8358C9.6395 10.1185 9.38763 10.3732 9.15857 10.5575C8.91892 10.7503 8.63953 10.9224 8.2865 10.9784C8.09711 11.0083 7.90363 11.0083 7.71423 10.9784C7.36106 10.9224 7.0809 10.7503 6.84119 10.5575C6.61215 10.3732 6.36022 10.1185 6.07751 9.8358L2.49646 6.25572L3.51697 5.23424L7.09705 8.81627C7.16219 8.88142 7.22331 8.94006 7.27869 8.99498V1.3065H8.72205V8.994Z", fill: "currentColor" }));
		const IconRightUp = svg(h("path", { d: "M13.588429 5.147807C13.588429 4.739638 13.587271 4.403003 13.582013 4.118684L1.703098 15.99968L0.85155 15.148178L0 14.294485L11.878915 2.413442C11.594721 2.408199 11.257569 2.409154 10.849776 2.409154H2.400594V0.000001H10.849776C11.644471 0.000001 12.338899 -0.001059 12.901622 0.059909C13.486363 0.123352 14.071136 0.265493 14.598303 0.648292C14.886598 0.857751 15.141981 1.110984 15.351433 1.399281C15.734578 1.926807 15.876362 2.512925 15.939743 3.098105C16.000775 3.660718 15.99968 4.353347 15.99968 5.147807V13.599133H13.588429V5.147807Z", fill: "currentColor" }));
		// Search magnifier (DSH IconSearch16 path, 0 0 14 14).
		const IconSearch = svg(h("path", { d: "M7.18005 0.500031C4.02301 0.500031 1.45834 3.0647 1.45834 6.22173C1.45834 7.39019 1.84531 8.46901 2.49371 9.34823L0.346401 11.4955C-0.115467 11.9574 -0.115467 12.707 0.346401 13.1689C0.808269 13.6308 1.5579 13.6308 2.01976 13.1689L4.16707 11.0216C5.04629 11.67 6.12511 12.057 7.29357 12.057C10.4506 12.057 13.0153 9.49226 13.0153 6.33522C13.0153 3.17819 10.3371 0.500031 7.18005 0.500031ZM7.18005 2.33336C9.34635 2.33336 11.1819 4.05544 11.1819 6.22173C11.1819 8.38803 9.45986 10.1101 7.29357 10.1101C5.12727 10.1101 3.40519 8.38803 3.40519 6.22173C3.40519 4.05544 5.01375 2.33336 7.18005 2.33336Z", fill: "currentColor" }), "0 0 14 14");
		// Maximize (four corner brackets) for the panel fullscreen toggle.
		const IconMaximize = svg(h("path", { d: "M2 2h5v1.5H3.5V7H2V2zm12 0v5h-1.5V3.5H9V2h5zM2 14V9h1.5v3.5H7V14H2zm12 0H9v-1.5h3.5V9H14v5z", fill: "currentColor" }));
		// Push = send-up arrow (exact path from dsh-client-ui-primitives IconSendOutline16).
		const IconSend = svg(h("path", { d: "M8.3125 0.981587C8.66767 1.0545 8.97902 1.20558 9.2627 1.43374C9.48724 1.61438 9.73029 1.85933 9.97949 2.10854L14.707 6.83608L13.293 8.25014L9 3.95717V15.0431H7V3.95717L2.70703 8.25014L1.29297 6.83608L6.02051 2.10854C6.26971 1.85933 6.51277 1.61438 6.7373 1.43374C6.97662 1.24126 7.28445 1.04542 7.6875 0.981587C7.8973 0.94841 8.1031 0.956564 8.3125 0.981587Z", fill: "currentColor" }));
		// Warning triangle (exact paths from dsh-client-ui-primitives IconWarningOutline16, 0 0 14 14).
		const IconWarning = svg([h("path", { d: "M6.3002 3.32843L7.69986 3.32843L7.69986 7.79657H6.3002L6.3002 3.32843Z", fill: "currentColor" }), h("path", { d: "M6.3002 9.01935H7.69986V10.6711H6.3002V9.01935Z", fill: "currentColor" }), h("path", { d: "M12.6328 6.99976C12.6328 3.88874 10.111 1.36694 7 1.36694C3.88899 1.36695 1.3672 3.88875 1.36719 6.99976C1.36719 10.1108 3.88899 12.6326 7 12.6326C10.111 12.6326 12.6328 10.1108 12.6328 6.99976ZM13.8582 6.99976C13.8582 10.7873 10.7876 13.8579 7 13.8579C3.21244 13.8579 0.141846 10.7873 0.141846 6.99976C0.141857 3.2122 3.21245 0.141612 7 0.141602C10.7876 0.141602 13.8581 3.21219 13.8582 6.99976Z", fill: "currentColor" })], "0 0 14 14");
		// Loading spinner ring (exact path from dsh-client-ui-primitives IconLoadingOutline16).
		const IconLoading = svg(h("path", { d: "M2.871 13.1286C0.0387669 10.2962 0.0387669 5.70383 2.871 2.87141C5.70341 0.0390029 10.2957 0.0391154 13.1282 2.87141L12.1387 3.86094C9.85292 1.57538 6.1469 1.57596 3.86123 3.86163C1.57573 6.14732 1.57573 9.85269 3.86123 12.1384C6.1469 14.424 9.85292 14.4246 12.1387 12.1391L13.1282 13.1286C10.2957 15.9609 5.70341 15.961 2.871 13.1286Z", fill: "currentColor" }));
		// Check mark (filled, for success status) — exact path from primitives IconCheckOutline16.
		const IconCheckOk = svg(h("path", { d: "M15.0498 3.92579L8.49512 12.3818C8.25774 12.6881 8.04517 12.9645 7.84668 13.1689C7.63957 13.3823 7.38732 13.5841 7.04492 13.6719C6.86373 13.7183 6.6757 13.7346 6.48926 13.7197C6.13666 13.6915 5.8528 13.5355 5.6123 13.3604C5.38201 13.1926 5.12573 12.9567 4.83984 12.6953L1.03125 9.21289L1.96875 8.1875L5.77734 11.6699C6.08684 11.9529 6.27773 12.1249 6.43066 12.2363C6.50183 12.2882 6.54699 12.3135 6.57324 12.3252C6.58525 12.3305 6.59269 12.3322 6.5957 12.333C6.59802 12.3336 6.59961 12.334 6.59961 12.334C6.63317 12.3367 6.66758 12.3335 6.7002 12.3252C6.7002 12.3252 6.70211 12.3251 6.7041 12.3242C6.70698 12.3229 6.71348 12.319 6.72461 12.3115C6.74849 12.2956 6.78843 12.2642 6.84961 12.2012C6.98138 12.0654 7.13957 11.8628 7.39648 11.5313L13.9502 3.07422L15.0498 3.92579Z", fill: "currentColor" }));
		//#endregion

		//#region store
		// ── service bridges, filled by apply() ─────────────────────────────────
		let sessionsService = null;
		let workspacesService = null;

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
		const openReqStore = {
			req: null,
			listeners: new Set(),
			request(path) {
				this.req = { path, ts: Date.now() };
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
			// panel shell
			"panel.title": "文件与变更",
			"panel.suspend": "挂起（暂存退出）：面板向上滑出、保留当前状态，鼠标移到顶栏把手即展开；鼠标移出面板也会自动挂起",
			"panel.restore": "还原窗口",
			"panel.maximize": "全屏（四周留边）",
			"panel.close": "关闭（清空面板状态）",
			"panel.handle": "展开文件与变更面板（保持之前状态；鼠标移出面板也会自动挂起）",
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
			"file.searchAll": "搜索整个工作区的文件（含子目录）…",
			"file.searchDir": "搜索当前目录…",
			"file.recent": "最近搜索",
			"file.noHistory": "暂无搜索历史（输入关键词会自动记录）",
			"file.results": "搜索结果（{count}）· 整个工作区",
			"file.noMatch": "（无匹配文件）",
			"file.openFolder": "在文件资源管理器中打开当前目录",
			"file.openDirRow": "打开目录",
			"file.openDirRowTitle": "在文件资源管理器中打开所在目录",
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
			// preview actions
			"pv.preview": "预览",
			"pv.source": "源码",
			"pv.edit": "编辑",
			"pv.save": "保存",
			"pv.saving": "保存中…",
			"pv.openEditor": "在编辑器中打开",
			"pv.closePreview": "关闭预览",
			"pv.editHint": "在面板内编辑此文件",
			"pv.editTruncated": "文件超过 512KB，仅显示前 512KB，编辑将丢失其余内容",
			"pv.loadingEditor": "正在加载编辑器…",
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
			"git.clean": "工作区干净 ✨",
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
			"git.back": "← 返回",
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
			"hist.rowTitle": "点击查看该提交的变更文件；右键或 ⋯ 打开提交操作",
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
			"gv.ahead": "⬆ {count} 个提交待推送",
			"gv.behind": "⬇ {count} 个更新待拉取",
			"gv.noIdentity": "未配置 user.name/user.email",
			"gv.conflicts": "{count} 个冲突",
			"gv.opRunning": "{label}中…",
			"gv.opSuccess": "{label}成功",
			"gv.opFailed": "{label}失败",
			"gv.opClose": "关闭本次操作输出",
			"gv.opCloseAria": "关闭输出",
			// settings
			"set.title": "面板设置",
			"set.defaultOpen": "打开面板时默认：",
			"set.maximized": "全屏",
			"set.normal": "非全屏",
			"set.applyHint": "选择后立即应用于当前窗口，并作为下次打开面板的默认状态。",
			"set.current": "当前窗口：{cur} · 默认：{def}",
			"set.click": "点击「产物文件 / 文件链接」时：",
			"set.panelPreview": "用面板预览",
			"set.systemOpen": "系统应用打开",
			"set.previewHint": "开启后，点击对话里产生的文件（产物 / 文件提及）会用本面板展开并预览，不再调用本地应用；目录与「在文件夹中显示」始终使用系统打开。",
			"set.editorHint": "预览页的「在编辑器中打开」随时可用系统应用打开当前文件。",
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
			// editor (CodeMirror lazy loading)
			"editor.unknownPkg": "未知 CodeMirror 包：{pkg}",
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
			// panel shell
			"panel.title": "Files & Changes",
			"panel.suspend": "Suspend: the panel slides up, keeping all state; hover the top handle to expand, or it auto-suspends when the mouse leaves",
			"panel.restore": "Restore window",
			"panel.maximize": "Maximize (with margins)",
			"panel.close": "Close (clears panel state)",
			"panel.handle": "Expand Files & Changes (state preserved; auto-suspends when the mouse leaves)",
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
			"file.searchAll": "Search all workspace files…",
			"file.searchDir": "Search current directory…",
			"file.recent": "Recent searches",
			"file.noHistory": "No search history (terms are saved automatically)",
			"file.results": "Search results ({count}) · whole workspace",
			"file.noMatch": "(no matching files)",
			"file.openFolder": "Open current directory in file explorer",
			"file.openDirRow": "Open folder",
			"file.openDirRowTitle": "Open containing folder in file explorer",
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
			// preview actions
			"pv.preview": "Preview",
			"pv.source": "Source",
			"pv.edit": "Edit",
			"pv.save": "Save",
			"pv.saving": "Saving…",
			"pv.openEditor": "Open in editor",
			"pv.closePreview": "Close preview",
			"pv.editHint": "Edit this file in the panel",
			"pv.editTruncated": "File >512KB, only first 512KB shown; editing will drop the rest",
			"pv.loadingEditor": "Loading editor…",
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
			"git.clean": "Working tree clean ✨",
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
			"git.back": "← Back",
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
			"hist.rowTitle": "Click to view changed files; right-click or ⋯ for commit actions",
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
			"gv.ahead": "⬆ {count} commits to push",
			"gv.behind": "⬇ {count} updates to pull",
			"gv.noIdentity": "user.name/user.email not configured",
			"gv.conflicts": "{count} conflicts",
			"gv.opRunning": "{label}…",
			"gv.opSuccess": "{label} succeeded",
			"gv.opFailed": "{label} failed",
			"gv.opClose": "Close this operation output",
			"gv.opCloseAria": "Close output",
			// settings
			"set.title": "Panel settings",
			"set.defaultOpen": "When opening the panel, default to:",
			"set.maximized": "Maximized",
			"set.normal": "Normal",
			"set.applyHint": "Applies immediately and becomes the default for next time.",
			"set.current": "Current: {cur} · Default: {def}",
			"set.click": "When clicking produced files / file links:",
			"set.panelPreview": "Preview in panel",
			"set.systemOpen": "Open with system app",
			"set.previewHint": "When on, produced files / file mentions open in this panel instead of local apps; directories and “show in folder” always use the system.",
			"set.editorHint": "“Open in editor” always uses the system app for the current file.",
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
			// editor (CodeMirror lazy loading)
			"editor.unknownPkg": "Unknown CodeMirror package: {pkg}",
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
				() => (localeFace ? localeFace.getSnapshot() : { active: "zh", revision: 0 })
			);
			return t;
		}
		//#endregion

		//#region utils
		// ── RPC (standard client-request envelope, plain fetch) ──────────────────
		// Network-layer failures (host busy with a big git/ls op, connection
		// reset, host restart) are retried briefly with backoff; a single
		// transient hiccup must not surface as "Failed to fetch".
		async function rpc(base, method, payload, _attempt = 0) {
			let res;
			try {
				res = await fetch(`/${base}/${method}`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ type: "client-request", rpcId: crypto.randomUUID(), method, payload: payload ?? {} }),
					signal: AbortSignal.timeout(20000)
				});
			} catch (err) {
				if (_attempt < 2) {
					await new Promise((r) => setTimeout(r, 250 * (_attempt + 1)));
					return rpc(base, method, payload, _attempt + 1);
				}
				throw err;
			}
			if (!res.ok) throw new Error(`dsh-files-git: transport HTTP ${res.status}`);
			const data = await res.json();
			if (!data || data.type !== "server-response") throw new Error(t("rpc.badResponse"));
			if (!data.result.ok) {
				const err = new Error(data.result.error?.message ?? t("rpc.failed"));
				err.code = data.result.error?.code;
				throw err;
			}
			return data.result.value;
		}
		const gitRpc = (method, payload) => rpc("git-api", method, payload);

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
			title: opts.title,
			onClick: (e) => { e.preventDefault(); e.stopPropagation(); if (!opts.disabled && onClick) onClick(e); }
		}, opts.icon || null, label);
		const link = (text, onClick, muted) => h("button", { className: "dgp-link" + (muted ? " dgp-linkMuted" : ""), onClick: (e) => { e.preventDefault(); onClick(); } }, text);

		function fmtSize(bytes) {
			if (bytes == null) return "";
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
			return `${(bytes / 1048576).toFixed(1)} MB`;
		}
		//#endregion

		//#region triggers
		// ── Session-header trigger capsule (matches "Session log" styling) ──────
		function FileHeaderAction(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const compact = props?.wide === false; // sidebar collapsed rail: icon only
			const t = useT();
			if (suspended) return null; // while suspended the top-bar handle is the only entry
			return h("button", {
				type: "button",
				className: "dgp-trigger" + (compact ? " dgp-triggerCompact" : ""),
				title: t("trigger.title"),
				onClick: () => overlayStore.set(!open),
				"data-active": open ? "true" : "false"
			}, compact ? null : h("span", null, t("trigger.label")), h(IconFolderOpen, { size: 12 }));
		}

		// ── Blank-session trigger aligned to the hero workspace row ─────────────
		// DSH renders the session header (and our header button) only once a
		// conversation exists. In a fresh workspace with no chat yet the header is
		// hidden (`hideChrome`), and the composer shows its hero row — the line of
		// workspace/agent chips just above the input. We render our borderless
		// capsule as an absolutely-positioned overlay pinned to the RIGHT end of
		// that same hero row (measured at runtime), so it never becomes its own
		// extra row — and it disappears the moment the session engages (top bar
		// with its 文件与变更 button takes over).
		function InputDockTrigger(props) {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const suspended = useSyncExternalStore(subscribeHidden, getHidden);
			const session = props?.session;
			const blank = session?.blank === true && session?.composerPhase === "blank";
			const t = useT();
			const [offset, setOffset] = useState(null);
			useEffect(() => {
				if (!blank) { setOffset(null); return; }
				let alive = true;
				const measure = () => {
					const row = document.querySelector('[class*="heroWorkspaceRow"]');
					const stack = row?.parentElement;
					if (!row || !stack) return;
					const rr = row.getBoundingClientRect();
					const sr = stack.getBoundingClientRect();
					if (alive) setOffset({ top: rr.top - sr.top, height: rr.height });
				};
				measure();
				const t = setTimeout(measure, 250);
				window.addEventListener("resize", measure);
				return () => { alive = false; clearTimeout(t); window.removeEventListener("resize", measure); };
			}, [blank]);
			if (!blank || suspended) return null; // active session: header button is showing
			return h("div", {
				className: "dgp-dockRow",
				style: offset ? { top: offset.top, height: offset.height } : undefined
			},
				h("button", {
					type: "button",
					className: "dgp-trigger dgp-triggerGhost",
					title: t("trigger.title"),
					onClick: () => overlayStore.set(!open),
					"data-active": open ? "true" : "false"
				}, h("span", null, t("trigger.label")), h(IconFolderOpen, { size: 12 })));
		}
		//#endregion

		//#region hooks
		// ── git state hook ───────────────────────────────────────────────────────
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
			const [error, setError] = useState(null);
			// Operation record shown under the action bar: {label, status: "running"|"success"|"error", detail}.
			// Appears on every operation, persists after it finishes (success or error),
			// and is dismissed only via the close button (next operation shows it again).
			const [op, setOp] = useState(null);
			const mounted = useRef(true);
			const lastRefreshKey = useRef("");
			useEffect(() => () => { mounted.current = false; }, []);

			const refresh = useCallback(async (quiet) => {
				if (!quiet) setBusy("op.refresh");
				setError(null);
				try {
					const [st, lg, cfg, br] = await Promise.all([
						gitRpc("status", { repo: cwd }),
						gitRpc("log", { repo: cwd, count: 100 }),
						gitRpc("config", { repo: cwd }),
						gitRpc("branches", { repo: cwd })
					]);
					if (!mounted.current) return;
					// 5s 轮询每次都 setState 会触发整棵面板树重渲染（几百行变更 +
					// 历史），结果没变时跳过（引用不变 → React 不重渲）。
					const key = JSON.stringify([st, lg, cfg, br.branches]);
					if (lastRefreshKey.current === key) return;
					lastRefreshKey.current = key;
					setStatus(st); setLog(lg); setGitConfig(cfg); setBranches(br.branches);
					setIsRepo(true);
					setSelected((prev) => {
						const known = new Set([...st.staged, ...st.unstaged, ...st.untracked, ...st.conflicts].map((e) => e.path));
						const next = {};
						for (const [p, on] of Object.entries(prev)) if (on && known.has(p)) next[p] = true;
						return next;
					});
				} catch (err) {
					if (!mounted.current) return;
					if (err && (err.code === "not-a-git-repo" || /不是 Git 仓库|not a git repository/i.test(String(err.message || "")))) { setIsRepo(false); setError(null); }
					else setError(err.message);
				} finally {
					if (mounted.current && !quiet) setBusy(null);
				}
			}, [cwd]);

			useEffect(() => { refresh(); }, [refresh]);

			const runOp = useCallback(async (label, fn) => {
				setBusy(label); setError(null);
				setOp({ label, status: "running", detail: "" });
				try {
					const value = await fn();
					if (!mounted.current) return;
					const detail = value && typeof value.output === "string" && value.output.trim() ? value.output : t("commit.done");
					setOp({ label, status: "success", detail });
					await refresh();
				} catch (err) {
					if (mounted.current) setOp({ label, status: "error", detail: err.message });
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [refresh]);

			// Silent periodic refresh: keeps the change list / file badges in sync
			// with external edits without flashing the busy state. Pauses when the
			// tab is hidden or an operation is in flight.
			const busyRef = useRef(busy);
			busyRef.current = busy;
			useEffect(() => {
				const t = setInterval(() => {
					if (document.visibilityState === "visible" && busyRef.current === null) refresh(true);
				}, 5000);
				return () => clearInterval(t);
			}, [refresh]);

			const allPaths = useMemo(() => {
				if (!status) return [];
				return [...status.staged, ...status.unstaged, ...status.untracked, ...status.conflicts].map((e) => e.path);
			}, [status]);

			const togglePath = useCallback((path) => setSelected((p) => { const n = { ...p }; if (n[path]) delete n[path]; else n[path] = true; return n; }), []);
			const selectAll = useCallback(() => setSelected(Object.fromEntries(allPaths.map((p) => [p, true]))), [allPaths]);
			const clearAll = useCallback(() => setSelected({}), []);

			const showDiff = useCallback(async (path, staged) => {
				setBusy("op.diff"); setError(null);
				try {
					const v = await gitRpc("diff", { repo: cwd, staged, path });
					if (!mounted.current) return;
					setDiff({ kind: "work", path, staged, text: v.text, truncated: v.truncated });
				} catch (err) {
					if (mounted.current) setError(err.message);
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [cwd]);

			// Untracked files have no `git diff` output — read the file and
			// render it as a brand-new-file diff (all lines added).
			const showNewFile = useCallback(async (path) => {
				setBusy("op.read"); setError(null);
				try {
					const v = await gitRpc("read", { repo: cwd, path });
					if (!mounted.current) return;
					let text = "";
					if (!v.binary) {
						const lines = (v.text || "").split("\n");
						if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop(); // trailing newline
						text = ["diff --git a/" + path + " b/" + path, "new file mode 100644", "--- /dev/null", "+++ b/" + path, "@@ -0,0 +1," + lines.length + " @@", ...lines.map((l) => "+" + l)].join("\n");
					}
					setDiff({ kind: "work", path, staged: false, text, truncated: v.truncated });
				} catch (err) {
					if (mounted.current) setError(err.message);
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [cwd]);

			// Commit detail view (replaces the work area): {hash, subject, files,
			// file, text, truncated, loadingFile}. Opening it fetches the commit's
			// changed-file list, then auto-loads the first file's patch.
			const [commitDetail, setCommitDetail] = useState(null);
			const showCommit = useCallback(async (target, subject) => {
				setBusy("op.commitRead"); setError(null);
				try {
					const v = await gitRpc("show", { repo: cwd, target });
					if (!mounted.current) return;
					const files = Array.isArray(v.files) ? v.files : [];
					setCommitDetail({ hash: target, subject: subject || "", files, file: null, text: "", truncated: false, loadingFile: false });
					setDiff(null);
					if (files.length > 0) {
						const fv = await gitRpc("show", { repo: cwd, target, path: files[0].path });
						if (!mounted.current) return;
						setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, file: files[0].path, text: fv.text, truncated: fv.truncated, loadingFile: false } : cd);
					}
				} catch (err) {
					if (mounted.current) setError(err.message);
				} finally {
					if (mounted.current) setBusy(null);
				}
			}, [cwd]);
			const showCommitFile = useCallback(async (target, path) => {
				setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, file: path, loadingFile: true } : cd);
				try {
					const v = await gitRpc("show", { repo: cwd, target, path });
					if (!mounted.current) return;
					setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, text: v.text, truncated: v.truncated, loadingFile: false } : cd);
				} catch (err) {
					if (mounted.current) { setError(err.message); setCommitDetail((cd) => cd && cd.hash === target ? { ...cd, loadingFile: false } : cd); }
				}
			}, [cwd]);
			const closeCommitDetail = useCallback(() => setCommitDetail(null), []);

			// Commit with an explicit message: text/amend live in CommitBox's own
			// state so typing never re-renders the whole panel tree.
			const commitWith = useCallback(async (all, text, amendFlag) => {
				const msg = (text || "").trim();
				if (!msg) { setError(t("commit.msgRequired")); return; }
				const paths = all ? null : Object.keys(selected).filter((p) => selected[p]);
				if (!all && paths.length === 0) { setError(t("commit.noneSelected")); return; }
				await runOp(all ? "op.commitAll" : "op.commitSel", () => gitRpc("commit", { repo: cwd, message: msg, all: all || undefined, paths: all ? undefined : paths, amend: amendFlag || undefined }));
				setSelected({});
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
				cwd, isRepo, status, log, gitConfig, branches, diff, setDiff, commitDetail, showCommit, showCommitFile, closeCommitDetail, selected, rebase, setRebase, force, setForce, busy, error, setError, op, setOp, refresh, runOp, commitWith, showDiff, showNewFile, togglePath, selectAll, clearAll, allPaths, checkoutBranch, mergeBranch, updateBranch, renameBranch, stagePath, unstagePath, untrackPath, ignorePath
			}), [cwd, isRepo, status, log, gitConfig, branches, diff, commitDetail, showCommit, showCommitFile, closeCommitDetail, selected, rebase, force, busy, error, op, refresh, runOp, commitWith, showDiff, showNewFile, togglePath, selectAll, clearAll, allPaths, checkoutBranch, mergeBranch, updateBranch, renameBranch, stagePath, unstagePath, untrackPath, ignorePath]);
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
			const flush = () => {
				const n = Math.min(delBuf.length, addBuf.length);
				for (let k = 0; k < n; k++) {
					const segs = paired < 1500 ? wordSegs(delBuf[k], addBuf[k]) : null;
					paired++;
					rows.push({ key: `w-${k}`, cls: "dgp-diffDel", text: delBuf[k], segs: segs ? segs.filter((sg) => sg.t !== "add") : null });
					rows.push({ key: `w+${k}`, cls: "dgp-diffAdd", text: addBuf[k], segs: segs ? segs.filter((sg) => sg.t !== "del") : null });
				}
				for (let k = n; k < delBuf.length; k++) rows.push({ key: `wd${k}`, cls: "dgp-diffDel", text: delBuf[k] });
				for (let k = n; k < addBuf.length; k++) rows.push({ key: `wa${k}`, cls: "dgp-diffAdd", text: addBuf[k] });
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

		// Shared diff body renderer (stats chips + colored rows + word
		// highlights + truncation note) — used by work diff and commit files.
		const diffBody = (text, truncated) => {
			const parsed = diffRows(text);
			const MAX_DIFF_ROWS = 5000;
			const rows = parsed.rows.length > MAX_DIFF_ROWS ? parsed.rows.slice(0, MAX_DIFF_ROWS) : parsed.rows;
			const cut = parsed.rows.length > MAX_DIFF_ROWS;
			return h(React.Fragment, null,
				h("div", { className: "dgp-diffStats" },
					chip(`+${parsed.added}`, "success"),
					chip(`−${parsed.removed}`, "error")
				),
				rows.map((r) => h("div", { key: r.key, className: "dgp-diffLine" },
					h("span", { className: "dgp-diffSpan" + (r.cls ? " " + r.cls : "") },
						r.segs ? r.segs.map((sg, k) => h("span", { key: k, className: sg.t === "same" ? "dgp-diffWordSame" : sg.t === "add" ? "dgp-diffWordAdd" : "dgp-diffWordDel" }, sg.s)) : r.text
					)
				)),
				(truncated || cut) ? h("div", { className: "dgp-diffLine" }, h("span", { className: "dgp-diffSpan dgp-diffMeta" }, cut ? t("diff.truncatedRows", { count: MAX_DIFF_ROWS }) : t("diff.truncatedText"))) : null
			);
		};
		//#endregion

		//#region ui
		// ── memoized sub-views (isolate re-renders from unrelated state) ────────
		// One change-list row; memoized so toggling a checkbox / expanding a dir
		// only rebuilds the rows whose props actually changed.
		const ChangeRow = React.memo(function ChangeRow({ entry, stagedFlag, depth, checked, busy, conflict, onShowDiff, onShowNewFile, onTogglePath, onStage, onUnstage, onIgnore }) {
			const code = stagedFlag ? entry.code[0] : entry.code[1];
			const untracked = entry.code === "??";
			const busyOn = (label) => busy === label || busy === "op.refresh";
			const t = useT();
			const tone = conflict ? "error" : code === "A" ? "success" : code === "D" ? "error" : (code === "R" || code === "C") ? "warn" : undefined;
			return h("div", { className: "dgp-row dgp-treeRow" + (depth >= 2 ? " dgp-treeDeep" : ""), "data-clickable": "true", "data-selected": checked ? "true" : "false", style: { paddingLeft: 6 + depth * 12 }, onClick: () => (untracked ? onShowNewFile(entry.path) : onShowDiff(entry.path, stagedFlag)) },
				h("input", { type: "checkbox", className: "dgp-chk", checked, onChange: () => onTogglePath(entry.path), onClick: (e) => e.stopPropagation() }),
				h("span", { className: "dgp-badge", "data-tone": tone }, letterLabel(code)),
				h("span", { className: "dgp-rowPath", title: entry.path, style: { color: conflict ? "var(--dsw-alias-state-error-primary)" : undefined } }, entry.path),
				h("span", { className: "dgp-rowMeta" }, stagedFlag ? t("git.flagStaged") : untracked ? t("git.flagUntracked") : t("git.flagUnstaged")),
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
		const DirRow = React.memo(function DirRow({ name, count, depth, open, onToggle, actions, title }) {
			const t = useT();
			return h("div", { className: "dgp-row dgp-dirRow dgp-treeRow" + (depth >= 2 ? " dgp-treeDeep" : ""), "data-clickable": "true", title, onClick: onToggle, style: { paddingLeft: 6 + depth * 12 } },
				h(open ? IconChevronDown : IconChevronRight, { size: 12 }),
				h("span", { className: "dgp-fileIcon" }, h(IconFolderOpen, { size: 14 })),
				h("span", { className: "dgp-rowPath", style: { fontWeight: 500 } }, name),
				h("span", { className: "dgp-rowMeta" }, t("common.items", { count })),
				actions && actions.length > 0 ? h("span", { className: "dgp-rowActions" }, actions.map((a) => lbtn(a.label, (e) => { e.stopPropagation(); a.onClick(); }, { disabled: a.disabled, title: a.title }))) : null
			);
		});

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
			const buildTree = useCallback((entries) => {
				const root = { dirs: new Map(), files: [] };
				for (const e of entries) {
					const parts = e.path.split("/");
					let node = root;
					for (let d = 0; d < parts.length - 1; d++) {
						const seg = parts[d];
						if (!node.dirs.has(seg)) node.dirs.set(seg, { dirs: new Map(), files: [] });
						node = node.dirs.get(seg);
					}
					node.files.push(e);
				}
				return root;
			}, []);
			const treeCount = (node) => {
				let n = node.files.length;
				for (const child of node.dirs.values()) n += treeCount(child);
				return n;
			};
			// Tree render is cheap (small lists); rows themselves are memoized.
			// Directory-level actions differ per group:
			//   staged   → unstage (restore --staged), untrack (rm --cached -r)
			//   unstaged → stage (add), untrack
			//   untracked→ track (add), ignore (.gitignore) — untracked has no untrack
			const dirActions = (groupKind, dirPath) => {
				const busyOn = (label) => busy === label || busy === "op.refresh";
				if (groupKind === "s") return [
					{ label: busyOn("op.unstage") ? "…" : t("git.unstage"), onClick: () => onUnstage(dirPath), disabled: busy !== null, title: t("git.actUnstage", { path: dirPath }) },
					{ label: busyOn("op.untrack") ? "…" : t("git.untrack"), onClick: () => onUntrack(dirPath), disabled: busy !== null, title: t("git.actUntrack", { path: dirPath }) }
				];
				if (groupKind === "t") return [
					{ label: busyOn("op.stage") ? "…" : t("git.track"), onClick: () => onStage(dirPath), disabled: busy !== null, title: t("git.actTrack", { path: dirPath }) },
					{ label: busyOn("op.ignore") ? "…" : t("git.ignore"), onClick: () => onIgnore(dirPath), disabled: busy !== null, title: t("git.actIgnore", { path: dirPath }) }
				];
				return [
					{ label: busyOn("op.stage") ? "…" : t("git.stage"), onClick: () => onStage(dirPath), disabled: busy !== null, title: t("git.actStage", { path: dirPath }) },
					{ label: busyOn("op.untrack") ? "…" : t("git.untrack"), onClick: () => onUntrack(dirPath), disabled: busy !== null, title: t("git.actUntrack", { path: dirPath }) }
				];
			};
			const renderTree = (node, depth, groupKey, pathPrefix, groupKind) => {
				const out = [];
				for (const [name, child] of node.dirs) {
					const dirPath = pathPrefix ? `${pathPrefix}/${name}` : name;
					const key = `${groupKey}|${dirPath}`;
					const open = dirOpen(key);
					out.push(h("div", { key: `dir:${key}` },
						h(DirRow, { name, count: treeCount(child), depth, open, onToggle: () => toggleDir(key), actions: dirActions(groupKind, dirPath), title: t("common.expandCollapse", { path: dirPath }) })
					));
					if (open) out.push(...renderTree(child, depth + 1, groupKey, dirPath, groupKind));
				}
				for (const f of node.files) {
					const conflict = !!s?.conflicts?.some((c) => c.path === f.path);
					out.push(h(ChangeRow, { key: `${groupKind}:${f.path}`, entry: f, stagedFlag: groupKind === "s", depth, checked: !!selected[f.path], busy, conflict, onShowDiff, onShowNewFile, onTogglePath, onStage, onUnstage, onIgnore }));
				}
				return out;
			};
			// Tree structures only change when status changes (status is a fresh
			// object after refresh, but the memo comparison in ChangeRow then
			// prevents unchanged rows from re-rendering).
			const trees = useMemo(() => ({
				staged: buildTree(s.staged),
				unstaged: buildTree(s.unstaged),
				untracked: buildTree(s.untracked)
			}), [s, buildTree]);
			const allChecked = allPaths.length > 0 && allPaths.every((p) => !!selected[p]);
			return h("div", { className: "dgp-gitCard dgp-gitGrow" },
				h("div", { className: "dgp-sectionHead" },
					h("div", { className: "dgp-sectionTitle" }, t("git.changes", { count: allPaths.length })),
					h("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
						lbtn(t("git.allDiff"), () => onShowDiff("", false)),
						lbtn(allChecked ? t("git.deselectAll") : t("git.selectAll"), () => (allChecked ? onClearAll() : onSelectAll()), { active: allChecked }),
						lbtn(t("common.clear"), onClearAll, { tone: "default" }))
				),
				h("div", { className: "dgp-gitScroll" },
					s.conflicts?.length > 0 ? h("div", { style: { marginBottom: 6 } }, h("div", { className: "dgp-sectionTitle", style: { marginBottom: 4 } }, t("git.conflicts", { count: s.conflicts.length })), s.conflicts.map((e) => h("div", { key: `c:${e.path}`, className: "dgp-row", "data-clickable": "true", onClick: () => onShowDiff(e.path, false) }, h("span", { className: "dgp-badge", "data-tone": "error" }, letterLabel(e.code)), h("span", { className: "dgp-rowPath", style: { color: "var(--dsw-alias-state-error-primary)" } }, e.path)))) : null,
					s.staged.length > 0 ? h("div", { style: { marginBottom: 6 } }, h("div", { className: "dgp-sectionTitle", style: { marginBottom: 4 } }, t("git.staged", { count: s.staged.length })), renderTree(trees.staged, 0, "s", "", "s")) : null,
					s.unstaged.length > 0 ? h("div", { style: { marginBottom: 6 } }, h("div", { className: "dgp-sectionTitle", style: { marginBottom: 4 } }, t("git.unstaged", { count: s.unstaged.length })), renderTree(trees.unstaged, 0, "u", "", "u")) : null,
					s.untracked.length > 0 ? h("div", null, h("div", { className: "dgp-sectionTitle", style: { marginBottom: 4 } }, t("git.untracked", { count: s.untracked.length })), renderTree(trees.untracked, 0, "t", "", "t")) : null,
					allPaths.length === 0 ? h("div", { className: "dgp-empty" }, t("git.clean")) : null
				)
			);
		});

		// Commit message input (inline in the git action bar): isolated state so
		// typing never touches the rest of the panel tree.
		const CommitBox = React.memo(function CommitBox({ busy, commitWith, hasRepo }) {
			const [msg, setMsg] = useState("");
			const busyOn = (label) => busy === label || busy === "op.refresh";
			const t = useT();
			const submit = async (all) => { await commitWith(all, msg); setMsg(""); };
			// Inline commit row (merged into the git action bar): message input
			// sits left of the two commit buttons, which start from the far right.
			return h("div", { className: "dgp-commitInline" },
				h("input", { className: "dgp-commitInput", placeholder: t("commit.placeholder"), value: msg, onChange: (e) => setMsg(e.target.value), onKeyDown: (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submit(true); } }, title: t("commit.ctrlEnter") }),
				btn(busyOn("op.commitSel") ? t("commit.committing") : t("commit.sel"), () => submit(false), { disabled: busy !== null || !hasRepo }),
				btn(busyOn("op.commitAll") ? t("commit.committing") : t("commit.all"), () => submit(true), { disabled: busy !== null || !hasRepo, variant: "primary" })
			);
		});

		// Work-tree diff preview card (parsed rows memoized per diff text).
		const DiffPane = React.memo(function DiffPane({ diff, onShowDiff, onClose }) {
			const body = useMemo(() => (diff.text.trim() === "" ? null : diffBody(diff.text, diff.truncated)), [diff.text, diff.truncated]);
			const t = useT();
			const titleLabel = diff.path === "" ? (diff.staged ? t("diff.allStaged") : t("diff.allUnstaged")) : diff.path + (diff.staged ? t("diff.stagedSuffix") : "");
			return h("div", { className: "dgp-gitCard dgp-diffCard" },
				h("div", { className: "dgp-sectionHead" },
					h("div", { className: "dgp-sectionTitle", title: diff.path },
						t("diff.title", { label: titleLabel })),
					h("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
						diff.path === "" ? h(React.Fragment, null,
							lbtn(t("git.flagUnstaged"), () => onShowDiff("", false), { active: !diff.staged }),
							lbtn(t("git.flagStaged"), () => onShowDiff("", true), { active: diff.staged })
						) : lbtn(t("common.viewAll"), () => onShowDiff("", false)),
						lbtn(t("common.close"), onClose, { tone: "default" })
					)
				),
				body === null ? h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("diff.noContent"))
					: h("div", { className: "dgp-diff" }, body)
			);
		});

		// Commit detail view (replaces work area + history).
		const CommitDetailView = React.memo(function CommitDetailView({ commitDetail, onShowFile, onClose }) {
			const d = commitDetail;
			const t = useT();
			return h("div", { className: "dgp-commitView" },
				h("div", { className: "dgp-commitHead" },
					lbtn(t("git.back"), onClose),
					chip(d.hash.slice(0, 7)),
					h("span", { className: "dgp-sectionTitle", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: d.subject },
						d.subject || t("commit.title", { hash: d.hash.slice(0, 7) })),
					h("span", { className: "dgp-hint" }, t("commit.filesHint", { count: d.files.length }))
				),
				h("div", { className: "dgp-commitGrid" },
					h("div", { className: "dgp-gitCard" },
						h("div", { className: "dgp-sectionHead" }, h("div", { className: "dgp-sectionTitle" }, t("commit.files", { count: d.files.length }))),
						h("div", { className: "dgp-gitScroll" },
							d.files.length === 0 ? h("div", { className: "dgp-empty" }, t("commit.noFiles")) :
							d.files.map((f) => h("div", {
								key: `cf:${f.path}`, className: "dgp-row dgp-logRow", "data-clickable": "true",
								"data-active": d.file === f.path ? "true" : "false",
								title: f.path, onClick: () => onShowFile(d.hash, f.path)
							},
								h("span", { className: "dgp-badge", "data-tone": f.code === "A" ? "success" : f.code === "D" ? "error" : "warn" }, f.code),
								h("span", { className: "dgp-rowPath", style: { flex: 1, minWidth: 0 } }, f.path)
							))
						)
					),
					h("div", { className: "dgp-gitCard dgp-diffCard" },
						h("div", { className: "dgp-sectionHead" },
							h("div", { className: "dgp-sectionTitle", title: d.file }, d.file || t("commit.noFile"))
						),
						d.loadingFile ? h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("common.loading"))
							: (d.file && d.text.trim() !== "" ? h("div", { className: "dgp-diff" }, diffBody(d.text, d.truncated))
								: h("div", { className: "dgp-empty", style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, t("diff.empty")))
					)
				)
			);
		});

		// Commit history block: collapsed bar ⇄ expanded list with internal
		// scroll + auto-scroll-into-view; own limit/open state. The log context
		// menu lives HERE (not in GitView) so right-clicking a row only
		// re-renders this block, never the whole panel.
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
			if (!log?.lines?.length) return null;
			if (!histOpen) return h("button", { type: "button", className: "dgp-histBar", ref: histRef, onClick: () => setHistOpen(true), title: t("hist.title") },
				h(IconChevronRight, { size: 12 }),
				h("span", { className: "dgp-sectionTitle" }, t("hist.title")),
				h("span", { className: "dgp-hint" }, t("hist.recent", { count: log.lines.length })),
				h("span", { style: { flex: 1 } }),
				h("span", { className: "dgp-hint" }, t("hist.expand"))
			);
			return h(React.Fragment, null,
				h("div", { className: "dgp-gitCard dgp-histCard", ref: histRef },
					h("div", { className: "dgp-sectionHead" },
						h("div", { className: "dgp-sectionTitle" }, t("hist.title")),
						h("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
							log.lines.length > logLimit ? lbtn(t("hist.loadMore", { count: log.lines.length - logLimit }), () => setLogLimit((n) => n + 10)) : null,
							h("span", { className: "dgp-hint" }, `${Math.min(logLimit, log.lines.length)} / ${log.lines.length}`),
							lbtn(t("hist.collapse"), () => setHistOpen(false), { tone: "default" })
						)
					),
					h("div", { className: "dgp-gitScroll dgp-histList" }, log.lines.slice(0, logLimit).map((line) => {
						const sp = line.indexOf(" "); const hash = sp === -1 ? line : line.slice(0, sp); const subject = sp === -1 ? "" : line.slice(sp + 1);
						return h("div", {
							key: `log:${line}`, className: "dgp-row dgp-logRow", "data-clickable": "true",
							"data-active": currentHash === hash ? "true" : "false",
							title: t("hist.rowTitle"),
							onClick: () => onShowCommit(hash, subject),
							onContextMenu: (e) => { e.preventDefault(); setLogMenu({ hash, subject, x: e.clientX, y: Math.max(8, Math.min(e.clientY, window.innerHeight - 160)) }); }
						},
							chip(hash.slice(0, 7)),
							h("span", { className: "dgp-rowPath", style: { flex: 1, minWidth: 0 } }, subject),
							h("button", {
								type: "button", className: "dgp-logMenuBtn", title: t("hist.menuTitle"),
								onClick: (e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setLogMenu({ hash, subject, x: r.right, y: Math.max(8, Math.min(r.bottom + 4, window.innerHeight - 160)) }); }
							}, "⋯")
						);
					}))
				),
				logMenu ? ReactDOM.createPortal(h("div", { className: "dgp-logMenu", style: { top: logMenu.y, left: logMenu.x }, onClick: (e) => e.stopPropagation() },
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
		// ── Branch selector (integrated into the Git tab button) ────────────────
		// The Git tab button shows "Git · <branch>"; clicking the tab text switches
		// tabs, while the chevron at the tab's right edge opens this branch list.
		function BranchSelector({ git }) {
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
					lbtn(t("common.ok"), () => submitBranchInput(), false)
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
					className: "dgp-tabArrow",
					title: t("branch.arrowTitle", { l: locals.length, r: remotes.length }),
					onClick: (e) => {
						e.stopPropagation();
						if (!branchOpen) {
							const r = e.currentTarget.getBoundingClientRect();
							setBranchPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4) });
						}
						setBranchOpen((o) => !o);
					},
					"data-open": branchOpen ? "true" : "false"
				}, h(IconChevronDown, { size: 12 })),
				branchOpen && branchPos ? ReactDOM.createPortal(h("div", { className: "dgp-branchPop", style: { left: branchPos.left, top: branchPos.top }, onClick: (e) => e.stopPropagation() },
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
			if (!spec) return null;
			return h("div", { className: "dgp-confirm", onClick: onClose },
				h("div", { className: "dgp-confirmCard", onClick: (e) => e.stopPropagation() },
					h("div", { className: "dgp-confirmTitle", "data-danger": spec.danger ? "true" : "false" },
						spec.danger ? h(IconWarning, { size: 15 }) : h(IconBranchOp, { size: 15 }),
						spec.title),
					spec.message ? h("div", { className: "dgp-confirmMsg" }, spec.message) : null,
					h("div", { className: "dgp-confirmActions" },
						btn(t("common.cancel"), onClose),
						btn(spec.confirmLabel || t("common.ok"), () => { const fn = spec.onConfirm; onClose(); fn(); }, { variant: spec.danger ? "dangerFill" : "primary" })
					)
				)
			);
		}

		// ── Git tab ──────────────────────────────────────────────────────────────
		function GitView({ git }) {
			const busyOn = (label) => git.busy === label || git.busy === "op.refresh";
			const s = git.status;
			const t = useT();

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
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
			}, []);
			const resetDiffSplit = useCallback(() => setDiffFrac(null), []);
			const diffShare = diffFrac ?? 0.3;

			return h(React.Fragment, null,
				// ── top strip: status chips + sync actions + op output ──────────
				h("div", { className: "dgp-gitTop" },
					s ? h("div", { className: "dgp-chips" },
						s.ahead > 0 ? chip(t("gv.ahead", { count: s.ahead }), "primary") : null,
						s.behind > 0 ? chip(t("gv.behind", { count: s.behind }), "warn") : null,
						s.upstream ? chip(s.upstream) : null,
						git.gitConfig?.remote ? chip(git.gitConfig.remote) : null,
						git.gitConfig?.name || git.gitConfig?.email ? chip(`${git.gitConfig.name ?? ""} <${git.gitConfig.email ?? ""}>`.trim()) : chip(t("gv.noIdentity"), "warn"),
						s.conflicts?.length > 0 ? chip(t("gv.conflicts", { count: s.conflicts.length }), "error") : null
					) : null,
					// Action bar + inline commit row, separated by a vertical rule:
					// left = sync ops, right = commit message input + commit buttons.
					h("div", { className: "dgp-opBar" },
						h("div", { className: "dgp-actions" },
							btn(busyOn("op.pull") ? t("gv.pullBusy") : t("gv.pull"), () => git.runOp("op.pull", () => gitRpc("pull", { repo: git.cwd, rebase: git.rebase || undefined })), { disabled: git.busy !== null || !s, icon: h(IconRefresh, { size: 12 }), title: t("gv.pullTitle") }),
							btn(busyOn("op.push") ? t("gv.pushBusy") : t("gv.push"), () => {
								const doPush = () => git.runOp("op.push", () => gitRpc("push", { repo: git.cwd, force: git.force || undefined }));
								if (git.force) setConfirm({
									title: t("gv.forceTitle2"),
									message: t("gv.forceMsg", { upstream: git.status?.upstream ? t("gv.forceUpstream", { name: git.status.upstream }) : "" }),
									confirmLabel: t("gv.forceConfirm"),
									danger: true,
									onConfirm: doPush
								});
								else doPush();
							}, { disabled: git.busy !== null || !s, variant: "primary", icon: h(IconSend, { size: 12 }), title: t("gv.pushTitle") }),
							btn(busyOn("op.fetch") ? t("gv.fetchBusy") : t("gv.fetch"), () => git.runOp("op.fetch", () => gitRpc("fetch", { repo: git.cwd })), { disabled: git.busy !== null || !s, icon: h(IconDownload, { size: 12 }), title: t("gv.fetchTitle") }),
							h("label", { className: "dgp-chkLbl", title: t("gv.rebaseTitle") }, h("input", { type: "checkbox", className: "dgp-chk", checked: git.rebase, onChange: (e) => git.setRebase(e.target.checked) }), t("gv.rebase")),
							h("label", { className: "dgp-chkLbl", title: t("gv.forceTitle") }, h("input", { type: "checkbox", className: "dgp-chk", checked: git.force, onChange: (e) => git.setForce(e.target.checked) }), t("gv.force")),
							git.busy !== null ? h("span", { className: "dgp-hint" }, t("gv.busy", { op: t(git.busy) })) : null
						),
						h("div", { className: "dgp-opDivider" }),
						h(CommitBox, { busy: git.busy, commitWith: git.commitWith, hasRepo: !!s })
					),
					// Command output module: shown under the action bar whenever an
					// operation runs; stays visible after success/error until closed.
					git.op ? h("div", { className: "dgp-op", "data-status": git.op.status },
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
					) : null
				),
				// ── main: a commit detail view REPLACES the work area + history
				// (left = the commit's changed files, right = first file's diff);
				// otherwise the work area is a vertical stack — changes list →
				// commit box — collapsing to a 2:8 master-detail when a diff opens.
				git.commitDetail ? h(CommitDetailView, { commitDetail: git.commitDetail, onShowFile: git.showCommitFile, onClose: git.closeCommitDetail })
				: h(React.Fragment, null,
				h("div", { className: "dgp-gitWork", "data-diff": git.diff ? "true" : "false", ref: diffRef, style: git.diff ? { gridTemplateColumns: `minmax(0,${diffShare.toFixed(3)}fr) 8px minmax(0,${(1 - diffShare).toFixed(3)}fr)` } : undefined },
					// left column: working-tree changes (commit row now lives in
					// the action bar above, so the list reaches down to history)
					h("div", { className: "dgp-gitCol" },
						s ? h(ChangeList, {
							status: s, allPaths: git.allPaths, selected: git.selected, busy: git.busy,
							onShowDiff: git.showDiff, onShowNewFile: git.showNewFile, onTogglePath: git.togglePath,
							onStage: git.stagePath, onUnstage: git.unstagePath, onUntrack: git.untrackPath, onIgnore: git.ignorePath,
							onSelectAll: git.selectAll, onClearAll: git.clearAll
						}) : null
					),
					// right pane: working-tree diff preview, split by a draggable
					// gutter (default left 3 : right 7; double-click resets)
					git.diff ? h(React.Fragment, null,
						h("div", { className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onDiffGutterDown, onDoubleClick: resetDiffSplit }),
						h(DiffPane, { diff: git.diff, onShowDiff: git.showDiff, onClose: () => git.setDiff(null) })
					) : null
				),
				// ── commit history: a full-width horizontal bar, collapsed by
				// default (IDEA-style). Expanding does not squeeze the work area
				// above — the list takes a capped height and scrolls internally,
				// and the block auto-scrolls to the middle of the panel.
				git.log?.lines?.length > 0 ? h(HistoryBlock, { log: git.log, currentHash: git.commitDetail?.hash ?? null, onShowCommit: git.showCommit, setConfirm, runOp: git.runOp, cwd: git.cwd }) : null
				),
				git.error ? h("div", { className: "dgp-error" }, h("span", { style: { flex: 1 } }, git.error), lbtn(t("common.close"), () => git.setError(null), { tone: "default" })) : null,
				h(ConfirmDialog, { spec: confirm, onClose: () => setConfirm(null) })
			);
		}
		//#endregion

		//#region editor
		// ── CodeMirror 6 editor (lazy-loaded from CDN, zero bundle weight) ───────
		// The editing feature must not bloat the single-file bundle, so the
		// editor core + language packs are imported on demand from a CDN at
		// first "编辑" click. Two CDNs are tried in order (esm.sh, jsdelivr) so
		// a blocked mirror still works; the language pack is fetched per file
		// extension. Failure is reported to the caller, never thrown blindly.
		const CM_PKGS = {
			state: "@codemirror/state@6",
			view: "@codemirror/view@6",
			commands: "@codemirror/commands@6",
			language: "@codemirror/language@6",
			search: "@codemirror/search@6",
			autocomplete: "@codemirror/autocomplete@6",
			"theme-one-dark": "@codemirror/theme-one-dark@6",
			"lang-javascript": "@codemirror/lang-javascript@6",
			"lang-json": "@codemirror/lang-json@6",
			"lang-markdown": "@codemirror/lang-markdown@6",
			"lang-python": "@codemirror/lang-python@6",
			"lang-java": "@codemirror/lang-java@6",
			"lang-go": "@codemirror/lang-go@6",
			"lang-rust": "@codemirror/lang-rust@6",
			"lang-cpp": "@codemirror/lang-cpp@6",
			"lang-php": "@codemirror/lang-php@6",
			"lang-sql": "@codemirror/lang-sql@6",
			"lang-yaml": "@codemirror/lang-yaml@6",
			"lang-css": "@codemirror/lang-css@6",
			"lang-sass": "@codemirror/lang-sass@6",
			"lang-less": "@codemirror/lang-less@6",
			"lang-html": "@codemirror/lang-html@6",
			"lang-xml": "@codemirror/lang-xml@6"
		};
		const CM_CDNS = [
			(pkg) => `https://esm.sh/${pkg}`,
			(pkg) => `https://cdn.jsdelivr.net/npm/${pkg}/+esm`
		];
		const cmPkgCache = new Map();
		async function cmImport(pkg) {
			if (cmPkgCache.has(pkg)) return cmPkgCache.get(pkg);
			const spec = CM_PKGS[pkg];
			const promise = (async () => {
				if (!spec) throw new Error(t("editor.unknownPkg", { pkg }));
				let lastErr;
				for (const build of CM_CDNS) {
					try { return await import(build(spec)); }
					catch (err) { lastErr = err; }
				}
				throw lastErr || new Error(t("editor.loadFailed", { spec }));
			})();
			// A transient CDN failure must not poison the cache forever: drop the
			// rejected promise so the next "编辑" click retries the load.
			cmPkgCache.set(pkg, promise);
			promise.catch(() => { if (cmPkgCache.get(pkg) === promise) cmPkgCache.delete(pkg); });
			return promise;
		}
		// CodeMirror language extension factory per file extension (best effort;
		// unknown extensions simply get no highlighting).
		const CM_LANG_FOR_EXT = {
			js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript", ts: "javascript", tsx: "javascript", vue: "javascript",
			json: "json", jsonc: "json",
			md: "markdown", markdown: "markdown",
			py: "python",
			java: "java", kt: "java",
			go: "go",
			rs: "rust",
			c: "cpp", h: "cpp", cc: "cpp", cpp: "cpp", cxx: "cpp", hpp: "cpp",
			php: "php",
			rb: "javascript",   // Ruby has no official lang pack; fall back to JS highlighting
			sql: "sql",
			yaml: "yaml", yml: "yaml",
			css: "css", scss: "sass", sass: "sass", less: "less",
			html: "html", htm: "html",
			xml: "xml"
		};
		const CM_LANG_FACTORY = {
			javascript: "javascript", json: "json", markdown: "markdown", python: "python",
			java: "java", go: "go", rust: "rust", cpp: "cpp", php: "php",
			sql: "sql", yaml: "yaml", css: "css", sass: "sass", less: "less", html: "html", xml: "xml"
		};
		async function cmLangExtension(ext) {
			const name = CM_LANG_FOR_EXT[ext];
			if (!name) return null;
			try {
				const mod = await cmImport(`lang-${name}`);
				const factory = mod[CM_LANG_FACTORY[name]];
				return typeof factory === "function" ? factory() : null;
			} catch { return null; }
		}
		// One shared core bundle (state/view/commands/language/search/autocomplete),
		// fetched once per page load.
		let cmCorePromise = null;
		function cmCore() {
			if (!cmCorePromise) {
				cmCorePromise = Promise.all([
					cmImport("state"), cmImport("view"), cmImport("commands"),
					cmImport("language"), cmImport("search"), cmImport("autocomplete")
				]).then(([state, view, commands, language, search, autocomplete]) => ({
					state, view, commands, language, search, autocomplete
				}));
			}
			return cmCorePromise;
		}
		/**
		 * Create a CodeMirror editor inside `hostEl`. opts: { doc, ext, dark,
		 * onChange }. Returns the EditorView. The one-dark theme is applied for
		 * dsh's dark mode; the default light theme otherwise.
		 */
		async function cmCreateEditor(hostEl, opts) {
			const { state, view, commands, language, search, autocomplete } = await cmCore();
			const langExt = await cmLangExtension(opts.ext || "");
			const themeExt = opts.dark ? (await cmImport("theme-one-dark")).oneDark : [];
			const viewInst = new view.EditorView({
				state: state.EditorState.create({
					doc: opts.doc || "",
					extensions: [
						view.lineNumbers(),
						view.highlightActiveLineGutter(),
						view.highlightActiveLine(),
						view.drawSelection(),
						view.dropCursor(),
						language.indentUnit.of("  "),
						language.bracketMatching(),
						language.syntaxHighlighting(language.defaultHighlightStyle, { fallback: true }),
						commands.history(),
						search.highlightSelectionMatches(),
						autocomplete.autocompletion(),
						...(langExt ? [langExt] : []),
						view.keymap.of([
							...commands.defaultKeymap,
							...commands.historyKeymap,
							...search.searchKeymap,
							...autocomplete.completionKeymap,
							commands.indentWithTab
						]),
						...themeExt,
						view.EditorView.updateListener.of((u) => {
							if (u.docChanged && typeof opts.onChange === "function") opts.onChange(u.state.doc.toString());
						})
					]
				}),
				parent: hostEl
			});
			return viewInst;
		}
		//#endregion

		//#region filebrowser
		// ── file browser tab ─────────────────────────────────────────────────────
		function gitBadgeOf(status, path) {
			if (!status) return null;
			if (status.conflicts?.some((e) => e.path === path)) return { label: "file.badgeConflict", tone: "error" };
			const staged = status.staged?.find((e) => e.path === path);
			const unstaged = status.unstaged?.find((e) => e.path === path);
			if (status.untracked?.some((e) => e.path === path)) return { label: "file.badgeUntracked" };
			if (staged && unstaged) return { label: "file.badgeStagedMod", tone: "warn" };
			if (staged) return { label: "file.badgeStaged", tone: "success" };
			if (unstaged) return { label: "file.badgeModified", tone: "warn" };
			return null;
		}

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
		function iconForFile(name) {
			const ext = extOf(name);
			if (WEB_EXTS.has(ext)) return IconGlobe;
			if (CODE_EXTS.has(ext)) return IconCode;
			if (DATA_EXTS.has(ext)) return IconData;
			if (DOC_EXTS.has(ext)) return IconListPen;
			if (IMG_EXTS.has(ext)) return IconPaperclip;
			return IconPaperclip;
		}
		const MD_EXTS = new Set(["md", "markdown"]);

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
			r = r.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m2, alt, u) => /^(https?:)/.test(u) ? `<img src="${escHtml(u)}" alt="${escHtml(alt)}" />` : escHtml(alt || "(image)"));
			r = r.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m2, t, u) => /^(https?:|mailto:|#)/.test(u) ? `<a href="${escHtml(u)}" target="_blank" rel="noreferrer">${t}</a>` : t);
			return r;
		}
		function renderMarkdown(src) {
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
					html += `<pre class="dgp-mdPre"><code>` + (lang ? highlightCode(body, lang) : escHtml(body)) + `</code></pre>\n`;
					continue;
				}
				const hd = t.match(/^(#{1,6})\s+(.*)$/);
				if (hd) { const n = hd[1].length; html += `<h${n}>` + inlineMd(hd[2]) + `</h${n}>\n`; i++; continue; }
				if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { html += "<hr>\n"; i++; continue; }
				if (t.startsWith(">")) {
					const buf = [];
					while (i < lines.length && lines[i].trim().startsWith(">")) { buf.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
					html += `<blockquote>` + renderMarkdown(buf.join("\n")) + `</blockquote>\n`;
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
		const FileRow = React.memo(function FileRow({ entry, path, selected, status, onSelect, onOpenDir, onOpenPreview, onOpenFolder, onCopyPath, onCopyName }) {
			const isDir = entry.type === "dir";
			const badge = isDir ? null : gitBadgeOf(status, entry.path);
			const Icon = isDir ? IconFolderOpen : iconForFile(entry.name);
			const [copied, setCopied] = useState(null);   // "path" | "name" | null
			const copiedTimer = useRef(null);
			const t = useT();
			const flash = (kind) => {
				setCopied(kind);
				clearTimeout(copiedTimer.current);
				copiedTimer.current = setTimeout(() => setCopied(null), 1200);
			};
			return h("div", { className: "dgp-row", "data-clickable": "true", "data-selected": selected ? "true" : "false", title: entry.path, onClick: onSelect, onDoubleClick: () => (isDir ? onOpenDir(path, entry.path) : onOpenPreview(path, entry.path)) },
				h("span", { className: "dgp-fileIcon" }, h(Icon, { size: isDir ? 15 : 14 })),
				h("span", { className: "dgp-treeName", style: isDir ? { fontWeight: 500 } : { fontFamily: "var(--dsw-font-mono,monospace)", fontSize: 12 } }, entry.name),
				badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null,
				!isDir && entry.size != null ? h("span", { className: "dgp-rowMeta" }, fmtSize(entry.size)) : null,
				h("span", { className: "dgp-fileActs" },
					lbtn(t("file.openDirRow"), (e) => { e.stopPropagation(); onOpenFolder(entry.path, isDir); }, { title: t("file.openDirRowTitle") }),
					lbtn(copied === "path" ? t("file.copied") : t("file.copyPath"), (e) => { e.stopPropagation(); onCopyPath(entry.path, isDir).then((ok) => ok && flash("path")); }, { title: t("file.copyPathTitle") }),
					lbtn(copied === "name" ? t("file.copied") : t("file.copyName"), (e) => { e.stopPropagation(); onCopyName(entry.name).then((ok) => ok && flash("name")); }, { title: t("file.copyNameTitle") })
				)
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
						const bytes = Uint8Array.from(atob(v.base64), (c) => c.charCodeAt(0));
						url = URL.createObjectURL(new Blob([bytes], { type: p.mime || "application/octet-stream" }));
						if (alive) { setState({ url, error: null }); onUrl?.(url); }
					} catch (err) {
						if (alive) setState({ url: null, error: String(err?.message ?? err) });
					}
				})();
				return () => { alive = false; if (url) { URL.revokeObjectURL(url); onUrl?.(null); } };
			}, [cwd, p.path, p.abs, p.mime, onUrl]);
			const sysOpen = () => {
				const target = p.abs ? p.abs : `${cwd.replace(/[\\/]+$/, "")}/${p.path}`;
				rpc("api", "host.openPath", { path: target }).catch(() => {});
			};
			if (state.error) return h("div", { className: "dgp-paneEmpty" },
				h("div", null, t("pv.mediaFail", { msg: state.error })),
				h("div", { style: { marginTop: 8 } }, lbtn(t("pv.openEditor"), sysOpen, { tone: "default" }))
			);
			if (!state.url) return h("div", { className: "dgp-paneEmpty" }, t("pv.mediaLoading"));
			if (p.kind === "image") return h("div", { className: "dgp-mediaBody" }, h("img", { src: state.url, alt: p.name }));
			return h("iframe", { className: "dgp-pdfFrame", src: state.url, title: p.name });
		}

		function FileBrowser({ cwd, status, refreshTick, onEdited }) {
			// `dirs`: rel-path → entries; `leftPath`/`rightPath`: the two panes;
			// `preview`: {path,name,text,truncated,binary,size,kind} when previewing.
			const [dirs, setDirs] = useState({});
			const [leftPath, setLeftPath] = useState(null);   // null ⇒ single list
			const [rightPath, setRightPath] = useState("");   // current list (root = "")
			const [preview, setPreview] = useState(null);
			// Blob URL of the media file being previewed (image/pdf) — reported
			// by MediaView so the preview header's「在浏览器打开」button can
			// window.open it; null when no media preview is active.
			const [mediaUrl, setMediaUrl] = useState(null);
			const [sel, setSel] = useState(null);
			const [query, setQuery] = useState("");   // file list name filter
			// Inline editing (CodeMirror 6, lazy CDN): `pvEdit` toggles the
			// editor inside the preview pane; `editBusy` covers load+save; the
			// EditorView instance lives in editorRef (destroyed on unmount).
			const [pvEdit, setPvEdit] = useState(false);
			const [editBusy, setEditBusy] = useState(false);
			const [editErr, setEditErr] = useState(null);
			const t = useT();
			const editorHostRef = useRef(null);
			const editorRef = useRef(null);
			// Preview render mode: "source" (default — plain text, no highlight /
			// markdown render, no head-cut) vs "preview" (rendered: markdown /
			// syntax highlight, rendered in full — code highlighted in chunks so
			// huge files stream in without freezing the UI). Reset to source on
			// every file open.
			const [pvMode, setPvMode] = useState("source");
			// Chunked highlight output for preview mode (code kind); null while
			// still rendering, "" when the file has no text.
			const [pvRendered, setPvRendered] = useState(null);
			// Chunked markdown output for preview mode: {html, pct} — html grows
			// chunk by chunk (content streams in top-down) and pct is the render
			// progress 0..100 shown as a thin bar on top of the preview body.
			// null = not started, {html:"", pct:0} = first chunk pending.
			const [mdRendered, setMdRendered] = useState(null);
			// Recent search terms (whole-workspace box), persisted locally so the
			// user can jump straight back to a file they searched before.
			const [histOpen, setHistOpen] = useState(false);
			const [history, setHistory] = useState(() => {
				try { return JSON.parse(localStorage.getItem("dsh-files-git.searchHistory")) || []; }
				catch { return []; }
			});
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
			useEffect(() => { if (panelHidden) setHistOpen(false); }, [panelHidden]);
			// Whole-workspace file index (git ls-files): fetched once per cwd,
			// null while loading or when cwd is not a git repo (falls back to
			// filtering the current directory only).
			const [allFiles, setAllFiles] = useState(null);
			useEffect(() => {
				let alive = true;
				setAllFiles(null);
				gitRpc("search", { repo: cwd })
					.then((v) => { if (alive) setAllFiles(Array.isArray(v.files) ? v.files : null); })
					.catch(() => { if (alive) setAllFiles(null); });
				return () => { alive = false; };
			}, [cwd]);
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

			const loadDir = useCallback(async (rel) => {
				setDirs((d) => ({ ...d, [rel]: "loading" }));
				try {
					const v = await gitRpc("list", { repo: cwd, path: rel });
					setDirs((d) => ({ ...d, [rel]: v.entries }));
				} catch (err) {
					setBrowseError(err.message);
					setDirs((d) => ({ ...d, [rel]: [] }));
				}
			}, [cwd]);

			useEffect(() => { setDirs({}); setLeftPath(null); setRightPath(""); setPreview(null); setSel(null); setBrowseError(null); loadDir(""); }, [loadDir]);
			useEffect(() => { if (refreshTick > 0) { loadDir(""); if (leftPath) loadDir(leftPath); loadDir(rightPath); } }, [refreshTick, leftPath, rightPath, loadDir]);
			useEffect(() => { const cur = dirs[rightPath]; if (cur === undefined || cur === "loading") loadDir(rightPath); }, [rightPath, dirs, loadDir]);
			// Left pane auto-load: external open requests set leftPath to the
			// file's grandparent directory (never loaded on its own) — without
			// this, that pane would show "加载中…" forever.
			useEffect(() => { if (leftPath === null) return; const cur = dirs[leftPath]; if (cur === undefined || cur === "loading") loadDir(leftPath); }, [leftPath, dirs, loadDir]);

			const parentOf = (p) => { const i = p.lastIndexOf("/"); return i === -1 ? "" : p.slice(0, i); };
			const baseName = (p) => p === "" ? "" : p.split("/").pop();
			const rootName = (() => { const s = cwd.replace(/[\\/]+$/, "").split(/[\\/]/); return s[s.length - 1] || cwd; })();

			// Double-click a folder in pane `panePath` → cascade: the pane's list
			// moves to the left, the folder's contents become the right list.
			const openDir = useCallback((panePath, entryPath) => {
				setPreview(null);
				setSel(entryPath);
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
			const openPreview = useCallback(async (panePath, entryPath) => {
				setBrowseError(null);
				const kind = classifyOf(entryPath);
				const name = entryPath.split("/").pop();
				setLeftPath((lp) => (lp === null ? panePath : lp));   // promote single list to left pane
				if (kind === "image" || kind === "pdf") {
					// Media preview: no text read at all — the media view fetches
					// base64 via readBlob and owns a blob URL.
					setPvMode("preview");
					setPreview({ path: entryPath, name, text: "", truncated: false, binary: true, size: null, kind, mime: MIME_FROM_EXT[extOf(entryPath)] });
					return;
				}
				try {
					const v = await gitRpc("read", { repo: cwd, path: entryPath });
					const effKind = v.binary ? "binary" : kind;
					const lang = LANG_FROM_EXT[extOf(entryPath)] || "js";
					setPvMode(defaultModeOf(effKind));
					setPreview({ path: entryPath, name, text: v.text, truncated: v.truncated, binary: v.binary, size: v.size, kind: effKind, lang });
				} catch (err) { setBrowseError(err.message); }
			}, [cwd]);

			// Closing the preview: if it was opened from the single list, the list
			// was promoted to the left pane (leftPath === rightPath, both the same
			// directory) — collapse back to a single list instead of mirroring it.
			const closePreview = useCallback(() => {
				setPreview(null);
				setLeftPath((lp) => (lp !== null && lp === rightPath ? null : lp));
			}, [rightPath]);
			const openInEditor = useCallback(async (rel) => {
				try { await rpc("api", "host.openPath", { path: `${cwd.replace(/[\\/]+$/, "")}/${rel}` }); }
				catch (err) { setBrowseError(err.message); }
			}, [cwd]);
			// System-open an ABSOLUTE path (used for files previewed from outside
			// the workspace, where the cwd-relative form is meaningless).
			const openInEditorAbs = useCallback(async (abs) => {
				try { await rpc("api", "host.openPath", { path: abs }); }
				catch (err) { setBrowseError(err.message); }
			}, []);
			// Row quick actions: absolute-path helpers shared by copy/open.
			const absOf = useCallback((rel) => `${cwd.replace(/[\\/]+$/, "")}/${rel.replace(/^\/+/, "")}`, [cwd]);
			// Open the entry's folder in the system file explorer (for a file:
			// its parent directory; for a directory: itself).
			const onOpenFolder = useCallback(async (rel, isDir) => {
				try {
					const target = isDir ? absOf(rel) : absOf(parentOf(rel));
					await rpc("api", "host.openPath", { path: target });
				} catch (err) { setBrowseError(err.message); }
			}, [absOf]);
			const onCopyPath = useCallback((rel, isDir) => copyText(absOf(rel)), [absOf]);
			const onCopyName = useCallback((name) => copyText(name), []);

			// Consume an external open request: navigate to the file's directory
			// and open a preview. Defined here (after loadDir/openPreview) so the
			// dependency array never touches a const before initialization.
			useEffect(() => {
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
					if (dir === "") { setLeftPath(null); setRightPath(""); }
					else { setLeftPath(parentOf(dir)); setRightPath(dir); }
					loadDir(dir);
					openPreview(dir, rel);
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
					(async () => {
						try {
							const fname = absSlash.split("/").pop() || abs;
							const ext = extOf(fname);
							const kind = classifyOf(fname);
							if (kind === "image" || kind === "pdf") {
								setPvMode("preview");
								setPreview({ path: fname, abs, name: fname, text: "", truncated: false, binary: true, size: null, kind, mime: MIME_FROM_EXT[ext] });
								return;
							}
							const v = await gitRpc("readPath", { repo: cwd, path: abs });
							const effKind = v.binary ? "binary" : kind;
							const lang = LANG_FROM_EXT[ext] || "js";
							setPvMode(defaultModeOf(effKind));
							setPreview({ path: fname, abs, name: fname, text: v.text, truncated: v.truncated, binary: v.binary, size: v.size, kind: effKind, lang });
						} catch {
							setExtOpen({ abs });
						}
					})();
				}
			}, [openReq, cwd, loadDir, openPreview]);

			// Breadcrumb: root ▸ a ▸ b ▸ (file). Clicking a segment jumps there.
			// For a file previewed from OUTSIDE the workspace (abs set) the crumb
			// chain shows the file's own absolute path segments instead of the
			// workspace-relative rightPath — those segments are display-only
			// (the external directory is not navigable inside this panel).
			const navTo = useCallback((target) => {
				setPreview(null);
				if (target === "") { setLeftPath(null); setRightPath(""); }
				else { setLeftPath(parentOf(target)); setRightPath(target); }
			}, []);
			// The crumb chain doubles as the panel's path display (the header
			// shows no cwd line): in-workspace paths are clickable segments, an
			// external preview shows the file's absolute path, read-only.
			// Rightmost button opens the current crumb directory in the system
			// file explorer (works for both in-workspace and external paths).
			const openCrumbDir = useCallback(() => {
				if (preview?.abs) {
					// External file: its parent directory, normalized back to
					// native separators for the system explorer call.
					const absNative = preview.abs.replace(/\//g, "\\");
					const i = absNative.lastIndexOf("\\");
					openInEditorAbs(i === -1 ? absNative : absNative.slice(0, i) || absNative);
				} else {
					openInEditorAbs(rightPath === "" ? cwd : absOf(rightPath));
				}
			}, [preview, rightPath, cwd, openInEditorAbs, absOf]);
			const extCrumbs = preview?.abs ? preview.abs.replace(/\\/g, "/").split("/").filter(Boolean) : null;
			const segs = rightPath === "" ? [] : rightPath.split("/");
			const crumbs = h("div", { className: "dgp-crumbs" },
				extCrumbs
					? extCrumbs.map((seg, i) => h(React.Fragment, { key: i },
						h("span", { className: "dgp-crumbSep" }, i === 0 ? "" : " / "),
						h("span", { className: "dgp-crumb dgp-crumbStatic" + (i === extCrumbs.length - 1 ? " dgp-crumbActive" : ""), title: preview.abs }, seg)
					))
					: h(React.Fragment, null,
						h("button", { className: "dgp-crumb" + (segs.length === 0 && !preview ? " dgp-crumbActive" : ""), onClick: () => navTo(""), title: cwd }, h(IconFolderOpen, { size: 12 }), rootName),
						segs.map((seg, i) => h(React.Fragment, { key: i },
							h("span", { className: "dgp-crumbSep" }, " / "),
							h("button", { className: "dgp-crumb" + (i === segs.length - 1 && !preview ? " dgp-crumbActive" : ""), onClick: () => navTo(segs.slice(0, i + 1).join("/")) }, seg)
						)),
						preview ? h(React.Fragment, null,
							h("span", { className: "dgp-crumbSep" }, " / "),
							h("span", { className: "dgp-crumb dgp-crumbActive" }, preview.name)
						) : null
					),
				h("button", { type: "button", className: "dgp-crumbDir", title: t("file.openFolder"), onClick: openCrumbDir },
					h(IconFolderOpen, { size: 13 }),
					h("span", null, t("common.openDir")))
			);

			// One list pane (folders first, then files). Single click selects,
			// double click on a folder drills in, on a file previews.
			const renderList = (path, opts = {}) => {
				const entries = dirs[path];
				if (entries === undefined || entries === "loading") return h("div", { className: "dgp-paneEmpty" }, t("common.loading"));
				const q = query.trim().toLowerCase();
				const items = entries.filter((e) => e.name !== ".git" && (!q || e.name.toLowerCase().includes(q)));
				const dirItems = items.filter((e) => e.type === "dir");
				const fileItems = items.filter((e) => e.type !== "dir");
				const row = (entry) => h(FileRow, { key: entry.path, entry, path, selected: sel === entry.path, status, onSelect: () => setSel(entry.path), onOpenDir: openDir, onOpenPreview: openPreview, onOpenFolder, onCopyPath, onCopyName });
				return h(React.Fragment, null,
					h("div", { className: "dgp-paneTitle", title: path === "" ? cwd : path }, opts.title ?? (path === "" ? rootName : baseName(path))),
					dirItems.map(row),
					fileItems.map(row),
					items.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("common.emptyDir")) : null
				);
			};

			// Preview body: source mode shows the plain text (no highlight /
			// markdown render, so even 512 KB files are cheap and NOT head-cut);
			// preview mode renders markdown / syntax-highlighted code IN FULL —
			// no truncation. Code is highlighted chunk-by-chunk (see effect
			// below) so a 500 KB file streams in progressively instead of
			// blocking the main thread. Memoized by preview + mode + chunked html.
			// Leaving a preview (new file, close, cwd change) exits edit mode.
			useEffect(() => { setPvEdit(false); setEditErr(null); }, [preview]);
			// Editor lifecycle: while editing, mount CodeMirror into the host
			// element; destroy it on exit/unmount. Recreated per file open.
			useEffect(() => {
				if (!pvEdit || !preview || !editorHostRef.current) return;
				let alive = true;
				setEditBusy(true);
				setEditErr(null);
				const dark = typeof document !== "undefined" && document.body.hasAttribute("data-ds-dark-theme");
				cmCreateEditor(editorHostRef.current, {
					doc: preview.text || "",
					ext: extOf(preview.name),
					dark,
					onChange: () => {}
				}).then((view) => {
					if (!alive) { view.destroy(); return; }
					editorRef.current = view;
					setEditBusy(false);
				}).catch((err) => {
					if (!alive) return;
					setEditErr(t("pv.editFail", { msg: err?.message ?? err }));
					setEditBusy(false);
				});
				return () => {
					alive = false;
					if (editorRef.current) { editorRef.current.destroy(); editorRef.current = null; }
				};
			}, [pvEdit, preview]);
			// Save the edited content back to disk. Works for workspace-relative
			// paths (containment-checked by the host) and absolute paths for
			// files outside the workspace. On success the preview text is
			// refreshed and the parent is told to re-pull git status.
			const saveEdit = useCallback(async () => {
				const view = editorRef.current;
				const p = preview;
				if (!view || !p) return;
				const content = view.state.doc.toString();
				setEditBusy(true);
				setEditErr(null);
				try {
					const payload = p.abs ? { repo: cwd, abs: p.abs, content } : { repo: cwd, path: p.path, content };
					await gitRpc("write", payload);
					setPreview((prev) => (prev && prev.path === p.path && prev.abs === p.abs ? { ...prev, text: content, size: new TextEncoder().encode(content).length, truncated: false } : prev));
					setPvEdit(false);
					if (typeof onEdited === "function") onEdited();
				} catch (err) {
					setEditErr(err.message);
				} finally {
					setEditBusy(false);
				}
			}, [preview, cwd, onEdited]);
			const cancelEdit = useCallback(() => { setPvEdit(false); setEditErr(null); }, []);
			const PREVIEW_CHARS = 60000;
			useEffect(() => {
				if (!preview || preview.kind !== "code" || pvMode !== "preview") { setPvRendered(null); return; }
				let alive = true;
				setPvRendered(null);
				const text = preview.text || "";
				if (text === "") { setPvRendered(""); return; }
				const CHUNK = 30000;
				const chunks = [];
				for (let i = 0; i < text.length; i += CHUNK) chunks.push(text.slice(i, i + CHUNK));
				let out = "";
				let k = 0;
				const step = () => {
					if (!alive) return;
					out += highlightCode(chunks[k], preview.lang);
					k++;
					if (k < chunks.length) setTimeout(step, 0);
					else setPvRendered(out);
				};
				step();
				return () => { alive = false; };
			}, [preview, pvMode]);
			// Markdown preview uses the SAME chunked async pipeline: a large
			// document would otherwise render synchronously inside useMemo and
			// freeze the whole panel (double-click → minutes of nothing). The
			// source is split at SAFE top-level boundaries only — never inside
			// a fenced code block (inFence tracking), and only at a blank line
			// once the chunk has enough lines — so every chunk renders exactly
			// the same blocks the whole-document pass would produce. Each
			// finished chunk is appended to the HTML: content streams in
			// top-down and a thin progress bar shows pct.
			useEffect(() => {
				if (!preview || preview.kind !== "md" || pvMode !== "preview") { setMdRendered(null); return; }
				let alive = true;
				setMdRendered({ html: "", pct: 0 });
				const lines = (preview.text || "").replace(/\r\n/g, "\n").split("\n");
				if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) { setMdRendered({ html: "", pct: 100 }); return; }
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
				let out = "";
				let k = 0;
				const step = () => {
					if (!alive) return;
					out += renderMarkdown(chunks[k]);
					k++;
					setMdRendered({ html: out, pct: Math.round((k / chunks.length) * 100) });
					if (k < chunks.length) setTimeout(step, 0);
				};
				step();
				return () => { alive = false; };
			}, [preview, pvMode]);
			const previewBody = useMemo(() => {
				if (!preview) return null;
				const p = preview;
				// Media kinds always render (no mode switch, no text pipeline).
				if (p.kind === "image" || p.kind === "pdf") return { kind: p.kind };
				if (p.kind === "html") {
					// Preview mode renders the HTML in a sandboxed iframe (no
					// scripts, no same-origin); source mode falls through to the
					// plain-text branch below.
					if (pvMode === "preview") return { kind: "html", text: p.text || "" };
					return { kind: "text", text: (p.text || "") + (p.truncated ? t("file.truncatedNote") : "") };
				}
				if (p.kind === "binary") return { kind: "binary" };
				if (pvMode === "source") {
					const note = p.truncated ? t("file.truncatedNote") : "";
					return { kind: "text", text: (p.text || "") + note };
				}
				if (p.kind === "md") return { kind: "md", html: mdRendered?.html ?? "", pct: mdRendered?.pct ?? 0 };
				if (p.kind === "code") return { kind: "code", html: pvRendered, pending: pvRendered === null };
				return { kind: "text", text: p.text || "" };
			}, [preview, pvMode, pvRendered, mdRendered]);

			const previewView = () => {
				const p = preview;
				let body;
				if (!previewBody) return null;
				if (pvEdit) {
					// Inline CodeMirror editing replaces the rendered body.
					body = h(React.Fragment, null,
						editErr ? h("div", { className: "dgp-error" },
							h("span", { style: { flex: 1 } }, editErr),
							lbtn(t("common.retry"), () => { setEditErr(null); setPvEdit(false); setTimeout(() => setPvEdit(true), 0); }, { tone: "default" }),
							lbtn(t("common.close"), () => setEditErr(null), { tone: "default" })) : null,
						h("div", { className: "dgp-editorHost", ref: editorHostRef }, editBusy ? h("div", { className: "dgp-paneEmpty" }, t("pv.loadingEditor")) : null)
					);
				} else if (previewBody.kind === "binary") {
					body = h("div", { className: "dgp-paneEmpty" }, t("file.binary"));
				} else if (previewBody.kind === "image" || previewBody.kind === "pdf") {
					// Media (image / PDF): MediaView fetches base64 → blob URL.
					body = h(MediaView, { cwd, p, onUrl: setMediaUrl });
				} else if (previewBody.kind === "html") {
					// Sandboxed static render: sandbox="" disables scripts, forms
					// and same-origin — a compromised HTML file cannot touch the
					// panel or the DSH app around it.
					body = h("iframe", { className: "dgp-htmlFrame", srcDoc: previewBody.text, sandbox: "", title: p.name });
				} else if (previewBody.kind === "md") {
					// Chunked rendering: nothing done yet → centered hint with
					// percent; partial/done → content (streams top-down) with a
					// thin progress bar pinned above it until 100%.
					body = previewBody.html === "" && previewBody.pct < 100
						? h("div", { className: "dgp-paneEmpty" }, h(IconLoading, { size: 16 }), h("span", { style: { marginLeft: 8 } }, t("pv.renderMd", { pct: previewBody.pct })))
						: h(React.Fragment, null,
							previewBody.pct < 100 ? h("div", { className: "dgp-mdProg", role: "progressbar", "aria-valuenow": previewBody.pct, "aria-valuemin": 0, "aria-valuemax": 100 },
								h("div", { className: "dgp-mdProgBar", style: { width: `${previewBody.pct}%` } })) : null,
							h("div", { className: "dgp-md" }, h("div", { dangerouslySetInnerHTML: { __html: previewBody.html } }))
						);
				} else if (previewBody.kind === "code") {
					body = previewBody.pending ? h("div", { className: "dgp-paneEmpty" }, t("pv.renderHighlight")) : h("pre", { className: "dgp-pre" }, h("code", { dangerouslySetInnerHTML: { __html: previewBody.html } }));
				} else {
					body = h("pre", { className: "dgp-pre" }, previewBody.text);
				}
				const editable = !p.binary && !p.truncated;
				const isFrame = previewBody.kind === "pdf" || previewBody.kind === "html";
				return h(React.Fragment, null,
					h("div", { className: "dgp-previewHead" },
						h("span", { className: "dgp-fileIcon" }, h(iconForFile(p.name), { size: 15 })),
						h("span", { className: "dgp-previewName", title: p.abs || p.path }, p.name),
						p.size != null ? h("span", { className: "dgp-rowMeta" }, fmtSize(p.size)) : null,
						!pvEdit && SWITCHABLE_KINDS.has(p.kind) ? h(React.Fragment, null,
							h("span", { className: "dgp-pvSwitch", role: "group", "aria-label": t("pv.modeAria") },
								lbtn(t("pv.preview"), () => setPvMode("preview"), { active: pvMode === "preview" }),
								lbtn(t("pv.source"), () => setPvMode("source"), { active: pvMode === "source", tone: "default" }))
						) : null,
						h("span", { style: { flex: 1 } }),
						pvEdit
							? h(React.Fragment, null,
								lbtn(t("pv.save"), saveEdit, { disabled: editBusy, title: editBusy ? t("pv.saving") : t("pv.save") }),
								lbtn(t("common.cancel"), cancelEdit, { tone: "default" }))
							: h(React.Fragment, null,
								(p.kind === "html" || ((p.kind === "image" || p.kind === "pdf") && mediaUrl)) ? lbtn(t("pv.openBrowser"), () => {
								if (p.kind === "html") { p.abs ? openInEditorAbs(p.abs) : openInEditor(p.path); return; }
								window.open(mediaUrl, "_blank");   // blob URL → real browser tab
							}, { title: t("pv.openBrowserTitle") }) : null,
								editable ? lbtn(t("pv.edit"), () => setPvEdit(true), { title: p.truncated ? t("pv.editTruncated") : t("pv.editHint") }) : null,
								lbtn(t("pv.openEditor"), () => (p.abs ? openInEditorAbs(p.abs) : openInEditor(p.path))),
								lbtn(t("pv.closePreview"), closePreview, { tone: "default" }))
					),
					h("div", { className: "dgp-previewBody" + (pvEdit ? " dgp-editBody" : "") + (isFrame ? " dgp-frameBody" : "") }, body)
				);
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
				const up = () => { setDragging(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
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
				globalResults.length === 0 ? h("div", { className: "dgp-paneEmpty" }, t("file.noMatch")) :
				globalResults.map((p) => {
					const badge = gitBadgeOf(status, p);
					return h("div", { key: p, className: "dgp-row", "data-clickable": "true", "data-selected": sel === p ? "true" : "false", title: `${p}\n${t("common.doubleClick")}`, onClick: () => setSel(p), onDoubleClick: () => openPreview("", p) },
						h("span", { className: "dgp-fileIcon" }, h(iconForFile(p), { size: 14 })),
						h("span", { className: "dgp-treeName", style: { fontFamily: "var(--dsw-font-mono,ui-monospace,monospace)", fontSize: 12 } }, p),
						badge ? h("span", { className: "dgp-badge", "data-tone": badge.tone }, t(badge.label)) : null
					);
				})
			);

			return h(React.Fragment, null,
				// The crumb chain is the panel's path display (the header no
				// longer shows a cwd line), so it stays visible in every state —
				// single list, split, preview, and external-file preview alike.
				// Only whole-workspace search replaces it with the result count.
				!globalSearch ? crumbs : null,
				h("div", { className: "dgp-searchRow" },
					h("span", { className: "dgp-searchIcon" }, h(IconSearch, { size: 12 })),
					h("input", { className: "dgp-search", placeholder: allFiles ? t("file.searchAll") : t("file.searchDir"), value: query, onChange: (e) => setQuery(e.target.value), onFocus: () => openHist(true), onBlur: () => { if (query.trim()) rememberQuery(query); setTimeout(() => setHistOpen(false), 120); }, onKeyDown: (e) => { if (e.key === "Enter") rememberQuery(query); }, spellCheck: false }),
					lbtn(t("common.history"), () => openHist(!histOpen), { active: histOpen, tone: "default" }),
					query ? lbtn(t("common.clear"), () => setQuery(""), { tone: "default" }) : null,
					histOpen && query.trim() === "" && histPos ? ReactDOM.createPortal(h("div", { className: "dgp-searchHist", style: { left: histPos.left, top: histPos.top, width: histPos.width } },
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
					), document.querySelector(".dgp-root")) : null
				),
				browseError ? h("div", { className: "dgp-error" }, h("span", { style: { flex: 1 } }, browseError), lbtn(t("common.close"), () => setBrowseError(null), { tone: "default" })) : null,
				extOpen ? h("div", { className: "dgp-error" },
					h("span", { style: { flex: 1 } }, `${t("file.cantPreview", { path: extOpen.abs })}`),
					lbtn(t("file.openSystem"), () => { rpc("api", "host.openPath", { path: extOpen.abs }).catch((err) => setBrowseError(err.message)); setExtOpen(null); }),
					lbtn(t("common.close"), () => setExtOpen(null), { tone: "default" })
				) : null,
				globalSearch
					? (preview
						? h("div", { className: "dgp-split", ref: splitRef, "data-dragging": dragging ? "true" : "false", style: { gridTemplateColumns: gridCols } },
							h("div", { className: "dgp-pane" }, globalList()),
							h("div", { className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onGutterDown, onDoubleClick: resetSplit }),
							h("div", { className: "dgp-pane" }, previewView()))
						: h("div", { className: "dgp-split", "data-dragging": "false", style: { gridTemplateColumns: "1fr" } },
							h("div", { className: "dgp-pane" }, globalList())))
					: h("div", { className: "dgp-split", ref: splitRef, "data-dragging": dragging ? "true" : "false", style: { gridTemplateColumns: gridCols } },
						split ? h("div", { className: "dgp-pane" }, renderList(leftPath)) : null,
						(split || preview) ? h("div", { className: "dgp-gutter", title: t("file.gutter"), onPointerDown: onGutterDown, onDoubleClick: resetSplit }) : null,
						preview ? h("div", { className: "dgp-pane" }, previewView()) : h("div", { className: "dgp-pane" }, renderList(rightPath))
					)
			);
		}

		// Settings page (a real tab — clicking the tab switches the body, no popover).
		const SettingsView = React.memo(function SettingsView({ maximized, onSetMax }) {
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
			return h("div", { className: "dgp-settingsPage" },
				h("div", { className: "dgp-settingsTitle" }, t("set.title")),
				h("div", { className: "dgp-settingsCard" },
					h("div", { className: "dgp-settingsRow" }, t("set.defaultOpen")),
					h("div", { className: "dgp-settingsOpts" },
						h("button", { type: "button", className: "dgp-settingsOpt", "data-active": defaultMax ? "true" : "false", onClick: () => pick(true) }, t("set.maximized")),
						h("button", { type: "button", className: "dgp-settingsOpt", "data-active": defaultMax ? "false" : "true", onClick: () => pick(false) }, t("set.normal"))
					),
					h("div", { className: "dgp-settingsHint" }, t("set.applyHint")),
					h("div", { className: "dgp-settingsHint" }, t("set.current", { cur: maximized ? t("set.maximized") : t("set.normal"), def: defaultMax ? t("set.maximized") : t("set.normal") }))
				),
				h("div", { className: "dgp-settingsCard" },
					h("div", { className: "dgp-settingsRow" }, t("set.click")),
					h("div", { className: "dgp-settingsOpts" },
						h("button", { type: "button", className: "dgp-settingsOpt", "data-active": previewOpen ? "true" : "false", onClick: () => setPreviewOpenFlag(true) }, t("set.panelPreview")),
						h("button", { type: "button", className: "dgp-settingsOpt", "data-active": previewOpen ? "false" : "true", onClick: () => setPreviewOpenFlag(false) }, t("set.systemOpen"))
					),
					h("div", { className: "dgp-settingsHint" }, t("set.previewHint")),
					h("div", { className: "dgp-settingsHint" }, t("set.editorHint"))
				)
			);
		});
		//#endregion

		//#region overlay
		// ── panel body: header + tabs ────────────────────────────────────────────
		const FilePanelBody = React.memo(function FilePanelBody({ cwd, maximized = false, onToggleMax, onSetMax, onSuspend }) {
			const git = useGit(cwd);
			const [tab, setTab] = useState("files");
			const [refreshTick, setRefreshTick] = useState(0);
			const t = useT();
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
			const refreshAll = useCallback(() => { git.refresh(); setRefreshTick((t) => t + 1); }, [git.refresh]);
			const tabBtn = (id, label, icon) => h("button", { className: "dgp-tab", "data-active": tab === id ? "true" : "false", onClick: () => setTab(id) }, icon, label);
			// Git tab is a split control: text switches tabs, the chevron opens the
			// branch list (BranchSelector) — both stay visually one tab button.
			// Hidden entirely when cwd is not a git repository.
			const gitTab = git.isRepo === false ? null : h("div", { className: "dgp-tab dgp-tabSplit", "data-active": tab === "git" ? "true" : "false" },
				h("button", { className: "dgp-tabMain", "data-active": tab === "git" ? "true" : "false", onClick: () => setTab("git") },
					h(IconBranch, { size: 14 }),
					h("span", null, `Git${git.status ? ` · ${git.status.branch}` : ""}`)),
				h(BranchSelector, { git })
			);
			useEffect(() => { if (git.isRepo === false && tab === "git") setTab("files"); }, [git.isRepo, tab]);
			return h(React.Fragment, null,
				h("div", { className: "dgp-header" },
					h("div", { className: "dgp-titleWrap" },
						h("h2", { className: "dgp-title" }, t("panel.title"))
					),
					btn(null, refreshAll, { disabled: git.busy !== null, icon: h(IconRefresh, { size: 14 }), title: t("common.refresh") }),
					btn(null, onSuspend, { icon: h(IconChevronUp, { size: 14 }), title: t("panel.suspend") }),
					btn(null, onToggleMax, { icon: h(IconMaximize, { size: 14 }), title: maximized ? t("panel.restore") : t("panel.maximize") }),
					h("button", { className: "dgp-close", title: t("panel.close"), onClick: () => overlayStore.set(false), "aria-label": t("panel.close") }, h(IconClose, { size: 16 }))
				),
				h("div", { className: "dgp-tabs" },
					tabBtn("files", `${t("tab.files")}${git.status ? ` · ${git.allPaths.length}` : ""}`, h(IconFolderOpen, { size: 14 })),
					gitTab,
					tabBtn("settings", t("tab.settings"), h("span", { style: { fontSize: 13, lineHeight: 1 } }, "⚙"))
				),
				h("div", { className: "dgp-body", "data-tab": tab, style: { overflow: "auto", padding: "12px 16px 16px", gap: 10 } },
					tab === "settings" ? h(SettingsView, { maximized, onSetMax })
						: (tab === "files" || git.isRepo === false ? h(FileBrowser, { cwd, status: git.status, refreshTick, onEdited: () => { git.refresh(); setRefreshTick((t) => t + 1); } }) : h(GitView, { git }))
				)
			);
		});

		// ── overlay modal (mirrors DSH Modal visual language) ────────────────────
		function FilePanelOverlay() {
			const open = useSyncExternalStore(subscribeOverlay, getOverlay);
			const hidden = useSyncExternalStore(subscribeHidden, getHidden);
			const overlayRef = useRef(null);
			const t = useT();
			// Suspended (hide): the panel keeps ALL its state (tab, preview file,
			// scroll, search…) and slides out of the viewport, leaving a handle at
			// the top bar; hovering the handle slides it back in instantly.
			const hideTimer = useRef(null);
			const mousePos = useRef({ x: 0, y: 0 });
			// Track the cursor globally: when the cursor leaves the panel and stays
			// out (350ms debounce), suspend automatically — no need to click the
			// suspend button. The handle hot zone (top-center, where hovering the
			// handle just expanded the panel) is exempt, otherwise the panel would
			// instantly re-hide while the cursor still rests on the handle spot.
			useEffect(() => {
				const onMove = (e) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
				document.addEventListener("mousemove", onMove, { passive: true });
				return () => { document.removeEventListener("mousemove", onMove); clearTimeout(hideTimer.current); };
			}, []);
			const cancelHide = useCallback(() => clearTimeout(hideTimer.current), []);
			// Any click inside the panel (e.g. the fullscreen toggle, which
			// resizes the dialog and can momentarily leave the cursor outside its
			// new bounds) grants a short exemption window so the auto-suspend
			// debounce does not fire right after a deliberate in-panel click.
			const lastPanelClick = useRef(0);
			const scheduleHide = useCallback(() => {
				clearTimeout(hideTimer.current);
				hideTimer.current = setTimeout(() => {
					const m = mousePos.current;
					// Handle hot zone (top-center) — where hovering the handle
					// just expanded the panel.
					if (m.y <= 40 && Math.abs(m.x - window.innerWidth / 2) <= 110) return;
					// Cursor is currently back inside the dialog or a popup.
					const el = document.elementFromPoint(m.x, m.y);
					if (el && el.closest?.(".dgp-dialog, .dgp-searchHist, .dgp-branchPop, .dgp-logMenu")) return;
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
			// Workspace list: hero state (no session yet) still lets the panel open
			// on the most recently created workspace directory.
			const wsSnapshot = useSyncExternalStore(
				(cb) => (workspacesService ? workspacesService.list.subscribe(cb) : () => {}),
				() => (workspacesService ? workspacesService.list.getSnapshot() : { items: [], phase: "pending" })
			);
			useEffect(() => {
				if (!open || hidden) return;
				const prevFocus = document.activeElement;
				const FOCUSABLE = 'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
				const onKey = (e) => {
					if (e.key === "Escape") { overlayStore.set(false); return; }
					if (e.key !== "Tab") return;
					const el = overlayRef.current;
					if (!el) return;
					const nodes = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
					if (nodes.length === 0) { e.preventDefault(); return; }
					const first = nodes[0], last = nodes[nodes.length - 1];
					const active = document.activeElement;
					if (e.shiftKey) {
						if (active === first || !el.contains(active)) { e.preventDefault(); last.focus(); }
					} else {
						if (active === last || !el.contains(active)) { e.preventDefault(); first.focus(); }
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
			const current = snapshot?.current;
			const summary = current !== undefined ? snapshot?.byId?.[current] : undefined;
			let cwd = typeof summary?.cwd === "string" && summary.cwd !== "" ? summary.cwd : null;
			if (cwd === null && wsSnapshot?.phase === "ready" && wsSnapshot.items.length > 0) {
				const recent = wsSnapshot.items.find((w) => typeof w?.path === "string" && w.path !== "") ?? null;
				cwd = recent?.path ?? null;
			}
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
			useEffect(() => {
				if (!open) openReqStore.clear();
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
			// real mouse input (hover on the suspend handle, clicking the mask)
			// would never reach it. On body, z 1050 sits above dsh's root (z 1000).
			return ReactDOM.createPortal(
				h("div", { className: "dgp-root", ref: overlayRef, role: "presentation", "data-hidden": hidden ? "true" : "false" },
					h("div", { className: "dgp-mask", "aria-hidden": "true", "data-hidden": hidden ? "true" : "false", onClick: suspend }),
					h("div", { className: "dgp-dialog", role: "dialog", "aria-modal": "true", "aria-label": t("panel.aria"), "data-max": maximized ? "true" : "false", style: hidden ? { transform: "translateY(-112%)" } : undefined,
						onClickCapture: () => { lastPanelClick.current = Date.now(); },
						onMouseEnter: cancelHide,
						onMouseLeave: (e) => {
							// Moving into a portaled popup (branch list, search
							// history, log menu) is still "inside the panel".
							const t = e.relatedTarget;
							if (t && (t.closest?.(".dgp-searchHist") || t.closest?.(".dgp-branchPop") || t.closest?.(".dgp-logMenu"))) return;
							scheduleHide();
						}
					}, content),
					hidden ? h("div", { className: "dgp-handle", role: "button", tabIndex: 0, title: t("panel.handle"), onMouseEnter: () => hiddenStore.set(false), onClick: () => hiddenStore.set(false), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hiddenStore.set(false); } } },
						h(IconChevronDown, { size: 12 }),
						h("span", null, t("trigger.label"))
					) : null
				), document.body);
		}
		//#endregion

		//#region index
		/** Required client services: slot registry, session runtime, workspace list, locale (i18n). */
		const inject = ["slots", "sessions", "workspaces", "locale"];

		/** Setting key: route produced-file/link clicks into the panel preview. */
		const PREVIEW_OPEN_KEY = "dsh-files-git.previewOpenPath";
		const previewOpenEnabled = () => {
			try { return localStorage.getItem(PREVIEW_OPEN_KEY) === "1"; } catch { return false; }
		};

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
			const openPath = workspacesService?.openPath?.bind(workspacesService);
			if (typeof openPath === "function") {
				workspacesService.openPath = async (path) => {
					if (previewOpenEnabled() && typeof path === "string" && path.trim() !== "" && path !== "." && !/[\\/]$/.test(path)) {
						try {
							const st = await gitRpc("stat", { repo: cwdOf(), path: path.trim() });
							if (st?.type === "file") {
								overlayStore.set(true);
								// Also slide the panel back in if it was suspended:
								// a produced-file click must always surface the preview.
								hiddenStore.set(false);
								openReqStore.request(path.trim());
								return;
							}
						} catch { /* stat unreachable / foreign: fall through to the system opener */ }
					}
					return openPath(path);
				};
			}
			// Trigger A: conversation.session.header.utilities (list, session-scope),
			// order -1 so it renders just LEFT of the "Session log" capsule (order 0).
			ctx.slots.inject("conversation.session.header.utilities", () =>
				ctx.slots.register({ name: "conversation.session.header.utilities", id: "files-git", order: -1 }, FileHeaderAction));
			// Trigger B: conversation.input.dock (list, session-scope) — the session
			// header does not render before a conversation exists (blank session,
			// hero state), so this borderless capsule renders in the row right
			// ABOVE the composer input (right-aligned to the input card) and
			// self-hides once the session engages (header button takes over).
			ctx.slots.inject("conversation.input.dock", () =>
				ctx.slots.register({ name: "conversation.input.dock", id: "files-git" }, InputDockTrigger));
			// Modal: shell.overlay (list, root-scope, additive — no conflict).
			ctx.slots.inject("shell.overlay", () =>
				ctx.slots.register({ name: "shell.overlay", id: "files-git" }, FilePanelOverlay));
		}

		/** Absolute path of the active session's workspace (mirrors overlay cwd resolution). */
		function cwdOf() {
			const snapshot = sessionsService?.list?.getSnapshot?.() ?? null;
			const current = snapshot?.current;
			const summary = current !== undefined ? snapshot?.byId?.[current] : undefined;
			if (typeof summary?.cwd === "string" && summary.cwd !== "") return summary.cwd;
			const ws = workspacesService?.list?.getSnapshot?.();
			if (Array.isArray(ws?.items) && ws.items.length > 0) {
				const recent = ws.items.find((w) => typeof w?.path === "string" && w.path !== "") ?? null;
				if (recent) return recent.path;
			}
			return "";
		}

		exports.FileHeaderAction = FileHeaderAction;
		exports.FilePanelOverlay = FilePanelOverlay;
		exports.apply = apply;
		exports.inject = inject;
		//#endregion
		return module.exports;
	}
});
