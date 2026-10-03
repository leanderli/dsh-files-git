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
.dgp-trigger[data-suspended="true"]{position:relative;border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 38%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 8%,var(--dsw-alias-bg-base))}
.dgp-trigger[data-suspended="true"]::after{content:"";width:6px;height:6px;margin-left:2px;border-radius:50%;background:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,transparent)}
.dgp-trigger[data-suspended="true"]:hover{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 14%,var(--dsw-alias-bg-base))}
.dgp-trigger:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dgp-dockRow{position:absolute;left:0;right:0;z-index:6;display:flex;justify-content:flex-end;align-items:center;box-sizing:border-box;padding-right:var(--dsh-composer-side-clearance,16px);pointer-events:none}
.dgp-dockRow button{pointer-events:auto}
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
.dgp-dialog{position:relative;z-index:1;display:flex;flex-direction:column;width:1280px;max-width:94vw;height:820px;max-height:90vh;background:color-mix(in srgb,var(--dsw-alias-bg-base) 97%,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:24px;overflow:hidden;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.1);animation:dgp-scale .16s cubic-bezier(.2,.8,.2,1);transition:transform .28s cubic-bezier(.2,.8,.2,1);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family)}
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
.dgp-settingsTitle{font-size:15px;font-weight:600;line-height:22px;color:var(--dsw-alias-label-primary);margin-bottom:6px}
/* Settings rows: statement label (+hint) LEFT, dropdown control RIGHT,
   separated by hairline rules — replaces the old tiled option cubes */
.dgp-setRow{border-bottom:.5px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0}
.dgp-setRowMain{display:flex;flex-direction:column;gap:2px;min-width:0}
.dgp-setRowMainFull{flex:1;min-width:0}
.dgp-setRowLabel{font-size:14px;font-weight:400;line-height:22px;color:var(--dsw-alias-label-primary)}
.dgp-setRowHint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
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
.dgp-ddBtn{box-sizing:border-box;font:inherit;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);cursor:pointer;background:var(--dsw-alias-bg-base);border:.5px solid var(--dsw-alias-border-l2);border-radius:18px;padding:8px 14px;min-width:120px;display:inline-flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 1px 2px rgba(0,0,0,.04);transition:background-color .12s}
.dgp-ddBtn:hover,.dgp-ddBtn[data-open="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-ddBtn svg{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-ddLabel{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dgp-ddMenu{position:absolute;top:calc(100% + 6px);right:0;z-index:40;min-width:100%;background:rgba(247,247,249,.85);border:.5px solid var(--dsw-alias-border-l2);border-radius:14px;box-shadow:0 0 1px rgba(0,0,0,.2),0 6px 20px rgba(0,0,0,.1);padding:6px;display:flex;flex-direction:column;gap:2px;animation:dgp-scale .12s cubic-bezier(.2,.8,.2,1);transform-origin:top right}
body[data-ds-dark-theme] .dgp-ddMenu{background:rgba(38,39,43,.85)}
.dgp-ddItem{box-sizing:border-box;font:inherit;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:none;border-radius:10px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:16px;white-space:nowrap;text-align:left}
.dgp-ddItem:hover,.dgp-ddItem[data-cursor="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-ddItem[data-selected="true"] svg{color:var(--dsw-alias-label-primary)}
/* Theme preview: full-width strip directly under the theme row, split 1:1
   into two equal sample-code panes (light | dark); palette driven inline */
.dgp-themeSplit{display:flex;gap:10px;width:100%}
.dgp-themeSplit .dgp-themePreview{flex:1 1 0;min-width:0;min-height:150px}
.dgp-themePreview{box-sizing:border-box;border-radius:12px;outline:.5px solid var(--dsw-alias-border-l4);padding:12px 14px;overflow:hidden;font-family:ui-monospace,SFMono-Regular,Consolas,"Courier New",monospace;font-size:11px;line-height:18px;white-space:pre;user-select:none}
.dgp-titleWrap{flex:0 1 auto;width:max-content;min-width:0;display:flex;align-items:center;gap:7px;max-width:260px}
.dgp-title{margin:0;font-size:14px;font-weight:600;line-height:20px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
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
.dgp-tab{border:none;background:0 0;cursor:pointer;font-family:var(--dsw-font-family);font-size:12px;font-weight:500;line-height:18px;padding:5px 10px;color:var(--dsw-alias-label-secondary);border-bottom:2px solid transparent;margin-bottom:-1px;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.dgp-tab:hover{color:var(--dsw-alias-label-primary)}
.dgp-tab[data-active="true"]{color:var(--dsw-alias-state-business-primary);border-bottom-color:var(--dsw-alias-state-business-primary)}
.dgp-tabSplit{padding:0;gap:0;position:relative}
.dgp-tabSplit .dgp-tabMain{border:none;background:0 0;cursor:pointer;font-family:var(--dsw-font-family);font-size:12px;font-weight:500;line-height:18px;padding:5px 3px 5px 10px;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.dgp-tabSplit .dgp-tabMain:hover{color:var(--dsw-alias-label-primary)}
.dgp-tabSplit .dgp-tabMain[data-active="true"]{color:var(--dsw-alias-state-business-primary)}
.dgp-tabSplit[data-active="true"]{background:transparent}
.dgp-tabArrow{border:none;background:0 0;cursor:pointer;padding:5px 10px 5px 2px;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;flex:none}
.dgp-tabArrow:hover{color:var(--dsw-alias-label-primary)}
.dgp-tabArrow[data-open="true"]{color:var(--dsw-alias-label-primary)}
.dgp-body{flex:1;min-height:0;overflow:hidden;padding:12px 16px 16px;display:flex;flex-direction:column;gap:10px}
.dgp-body[data-tab="settings"]{overflow-y:auto}
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
.dgp-chk{margin:0;cursor:pointer;accent-color:var(--dsw-alias-state-business-primary);width:14px;height:14px;flex:none;vertical-align:middle}
.dgp-chkLbl{display:inline-flex;gap:4px;align-items:center;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dgp-chip{display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border-radius:999px;font-size:11px;line-height:18px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap}
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
.dgp-branchSelName{font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);font-weight:600;max-width:440px;min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:var(--dsw-font-mono,ui-monospace,monospace)}
.dgp-branchSelArrow{display:inline-flex;align-items:center;color:var(--dsw-alias-label-secondary);flex:none;transition:transform .14s ease}
.dgp-branchSelArrow[data-open="true"]{transform:rotate(180deg);color:var(--dsw-alias-label-primary)}
.dgp-branchTab{position:relative;display:inline-flex;align-items:center;flex:none}
.dgp-branchPop{position:fixed;left:0;top:0;z-index:60;width:460px;max-width:90vw;background:color-mix(in srgb,var(--dsw-alias-bg-base) 96%,transparent);backdrop-filter:blur(18px) saturate(1.35);-webkit-backdrop-filter:blur(18px) saturate(1.35);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.1);display:flex;flex-direction:column;gap:6px;padding:8px;animation:dgp-scale .14s cubic-bezier(.2,.8,.2,1);will-change:transform}
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
/* Icon-only ghost button: square-ish hit target. min-height pins it to the
   labelled variant's 24px so a mixed row shares ONE baseline (an SVG-only
   button would otherwise collapse to icon+padding ≈ 18-19px). */
.dgp-lbtn[data-icon-only="true"]{padding:1px 5px;min-height:24px}
.dgp-rows{display:flex;flex-direction:column;gap:1px}
.dgp-row{display:flex;align-items:center;gap:8px;padding:3px 6px;border-radius:6px;font-size:13px;line-height:22px}
.dgp-row[data-clickable="true"]{cursor:pointer}
.dgp-row[data-clickable="true"]:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-row[data-selected="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-row[data-current="true"] .dgp-rowPath{font-weight:600}
.dgp-row[data-current="true"]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 6%,transparent)}
.dgp-rowPath{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px}
.dgp-rowMeta{color:var(--dsw-alias-label-secondary);font-size:11px;white-space:nowrap}
/* ── File listing card (mock-up: 名称/修改时间/大小 columned table card) ──
   The card wraps the rows of one directory; the header row's paddings mirror
   the leading controls of a body row (@-ref 22px + gap 8 + icon 15 + gap 8 +
   card padding) so 名称 sits over the file names, and 修改时间/大小 right-align
   over their columns. */
.dgp-fileCard{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-base);padding:4px 6px;display:flex;flex:1 1 0;min-height:0;flex-direction:column;gap:1px;overflow:hidden}
.dgp-fileHead{display:flex;flex:none;align-items:center;gap:8px;padding:6px 14px 6px 8px;margin-bottom:2px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);user-select:none}
.dgp-fileRows{flex:1 1 0;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.dgp-fileHeadName{flex:1;min-width:0;padding-left:45px}
.dgp-fileHeadTime{width:118px;flex:none;text-align:right}
.dgp-fileHeadSize{width:56px;flex:none;text-align:right}
.dgp-fileCard .dgp-row{padding:5px 8px;border-radius:8px}
.dgp-fileCard .dgp-rowTime{width:118px;flex:none;text-align:right;color:var(--dsw-alias-label-secondary);font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums}
.dgp-fileCard .dgp-rowMeta{width:56px;flex:none;text-align:right}
.dgp-row:hover .dgp-rowTime,.dgp-row:hover .dgp-rowMeta{color:var(--dsw-alias-label-primary)}
.dgp-fileActs{display:none;gap:6px;align-items:center;flex:none}
.dgp-row:hover .dgp-fileActs{display:inline-flex}
/* Row reference button: ALWAYS visible (the user's explicit requirement — not
   hover-gated like .dgp-fileActs) so one click points the agent at the entry.
   Muted at rest to keep a long listing calm, accent on hover. 18px box inside
   the row's 22px line box, so adding it never changes the row height. */
.dgp-refBtn{flex:none;width:18px;height:18px;padding:0;border:none;border-radius:5px;background:0 0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:color-mix(in srgb,var(--dsw-alias-label-primary) 32%,transparent)}
.dgp-refBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-business-primary)}
.dgp-row[data-ignored="true"] .dgp-refBtn{opacity:.6}
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
.dgp-pre{margin:0;font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px;line-height:18px;white-space:pre}
.dgp-preWrap{white-space:pre-wrap;word-break:break-all}
.dgp-diff{display:flex;flex-direction:column;flex:1;min-height:0;font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px;line-height:19px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:auto;contain:content}
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
   inline status + actions → op output → work area (changes + commit box; collapses to
   2:8 master-detail when a diff opens) → history (collapsed bar by default). */
.dgp-gitTop{display:flex;flex-direction:column;gap:10px;flex:none;min-height:0}
.dgp-gitState{display:flex;align-items:center;gap:6px;flex:none}
.dgp-repoInfo{position:relative;display:inline-flex;align-items:center;flex:none}
.dgp-repoInfo>summary{list-style:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dgp-repoInfo>summary::-webkit-details-marker{display:none}
.dgp-repoInfo>summary:hover,.dgp-repoInfo[open]>summary{color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dgp-repoInfoPop{position:absolute;left:0;top:calc(100% + 6px);z-index:45;width:min(440px,calc(100vw - 32px));box-sizing:border-box;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 94%,transparent);box-shadow:0 8px 24px rgba(0,0,0,.16);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.dgp-repoInfoRow{display:grid;grid-template-columns:76px minmax(0,1fr);gap:10px;padding:6px 0;font-size:12px;line-height:18px}
.dgp-repoInfoRow+.dgp-repoInfoRow{border-top:1px solid var(--dsw-alias-border-l1)}
.dgp-repoInfoLabel{color:var(--dsw-alias-label-secondary)}
.dgp-repoInfoValue{min-width:0;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;user-select:text}
.dgp-gitWork{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:12px}
.dgp-gitWork[data-diff="true"]{display:grid;grid-template-columns:minmax(260px,3fr) minmax(0,7fr)}
.dgp-gitCol{display:flex;flex-direction:column;gap:12px;min-height:0;min-width:0}
.dgp-gitCard{display:flex;flex-direction:column;min-height:0;background:color-mix(in srgb,var(--dsw-alias-bg-base) 97%,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:10px 12px}
.dgp-changePanel{display:flex;flex-direction:column;min-width:0;min-height:0;gap:6px}
.dgp-changeHead{flex:none;min-height:29px;margin:0;padding:0 8px}
.dgp-changeScroll{background:color-mix(in srgb,var(--dsw-alias-bg-base) 97%,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:8px 10px}
.dgp-gitGrow{flex:1}
.dgp-gitScroll{flex:1;min-height:0;overflow-y:auto;contain:content}
.dgp-diffCard{min-height:0;min-width:0;align-self:stretch;background:transparent;border:0;border-radius:0;padding:0}
.dgp-histBar{flex:none;display:flex;align-items:center;gap:8px;width:100%;border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-base);cursor:pointer;padding:8px 12px;font:inherit;color:var(--dsw-alias-label-primary);text-align:left}
.dgp-histBar:hover{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dgp-histBar>svg{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-histCard{flex:none}
.dgp-histList{max-height:min(300px,38vh)}
.dgp-commitView{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.dgp-commitHead{display:flex;align-items:center;gap:8px;flex:none;min-width:0}
.dgp-commitGrid{flex:1;min-height:0;display:grid;grid-template-columns:minmax(260px,3fr) minmax(0,7fr);gap:12px}
/* History rows: two-line layout — main line (hash + refs + subject + menu),
   meta line (committer <email> · local time). Column so the meta line spans
   the full row width under the subject. */
/* Commit-detail file rows: simple flex row (badge + path inline). */
.dgp-logRow{display:flex;align-items:center;gap:8px}
/* History entries: two-line layout — main line (hash + refs + subject +
   menu), meta line (committer <email> · local time). OWN class: the
   commit-detail rows reuse .dgp-logRow, so the column layout must not
   leak into them (a stretched full-width badge). */
.dgp-histEntry{align-items:stretch;gap:10px;padding-top:5px;padding-bottom:5px}
.dgp-histBody{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
/* git graph column: one SVG tile per row (vertically stretched — lines and
   merge curves tolerate it, non-scaling-stroke keeps 2px) + a DOM commit dot
   that never distorts. Lane colors are a FIXED palette via panel vars
   (theme-reactive, not tied to the editor theme). */
.dgp-logGraph{position:relative;flex:none;align-self:stretch}
.dgp-logGraph svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.dgp-graphDot{position:absolute;top:50%;width:9px;height:9px;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 2px var(--dsw-alias-bg-base)}
.dgp-graphDotHead{box-shadow:0 0 0 2px var(--dsw-alias-bg-base),0 0 0 4px var(--dsw-alias-state-business-primary)}
.dgp-root{--dsw-graph-c0:#2f6bed;--dsw-graph-c1:#1a7f37;--dsw-graph-c2:#9a6700;--dsw-graph-c3:#8250df;--dsw-graph-c4:#1b7c83;--dsw-graph-c5:#cf222e}
body[data-ds-dark-theme] .dgp-root{--dsw-graph-c0:#4c8dff;--dsw-graph-c1:#3fb950;--dsw-graph-c2:#d29922;--dsw-graph-c3:#bc8cff;--dsw-graph-c4:#39c5cf;--dsw-graph-c5:#ff7b72}
.dgp-logMain{display:flex;align-items:center;gap:8px;min-width:0}
.dgp-logRefs{max-width:42%;display:inline-block;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}
.dgp-logMeta{display:flex;align-items:center;gap:8px;padding-left:1px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden}
.dgp-logAuthor{color:var(--dsw-alias-label-primary);font-weight:500}
.dgp-logEmail{font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Consolas,monospace)}
.dgp-logDate{font-variant-numeric:tabular-nums}
.dgp-dirRow{color:var(--dsw-alias-label-primary);font-weight:500}
.dgp-dirRow>svg{flex:none;color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent)}
/* Compact Codex-style change tree: slim disclosure rows, indent guides, and
   smaller action controls keep more room for deep file names. */
.dgp-treeRow{position:relative;padding-top:1px;padding-bottom:1px;line-height:20px;gap:4px}
.dgp-treeRow::before{content:"";position:absolute;z-index:0;left:22px;top:0;bottom:0;width:var(--tree-guide-width,0);background-image:repeating-linear-gradient(to right,color-mix(in srgb,var(--dsw-alias-border-l1) 72%,transparent) 0 1px,transparent 1px 8px);pointer-events:none}
.dgp-treeRow .dgp-rowPath{font-size:11.5px}
.dgp-treeRow .dgp-rowActions{gap:3px}
.dgp-treeRow .dgp-rowActions .dgp-lbtn{padding:1px 5px;font-size:11px}
/* .gitignore-dimmed entries: name + icon drop to secondary text so ignored
   files read as "background noise" at a glance. */
.dgp-row[data-ignored="true"] .dgp-treeName,
.dgp-row[data-ignored="true"] .dgp-fileIcon{color:var(--dsw-alias-label-secondary);opacity:.55}
.dgp-logMenuBtn{border:none;background:0 0;cursor:pointer;color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent);width:22px;height:22px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0;font:inherit;font-size:14px;line-height:1}
.dgp-logMenuBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-logMenu{position:fixed;z-index:1300;min-width:224px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 96%,transparent);backdrop-filter:blur(18px) saturate(1.35);-webkit-backdrop-filter:blur(18px) saturate(1.35);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 0 1px rgba(0,0,0,.2),0 0 4px rgba(0,0,0,.02),0 12px 32px rgba(0,0,0,.14);padding:4px;display:flex;flex-direction:column;animation:dgp-logmenu-in .12s cubic-bezier(.2,.8,.2,1);will-change:transform}
/* Default anchor = the menu's LEFT edge, so it opens to the RIGHT of the
   click. Near the right viewport edge [data-flip] right-anchors it instead
   (opens leftward) rather than overflowing off-screen. */
@keyframes dgp-logmenu-in{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes dgp-logmenu-in-flip{from{transform:translateX(-100%) scale(.96);opacity:0}to{transform:translateX(-100%) scale(1);opacity:1}}
.dgp-logMenu[data-flip="true"]{transform:translateX(-100%);animation-name:dgp-logmenu-in-flip}
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
.dgp-searchToolbar{height:30px;display:flex;align-items:center;gap:8px;flex:none;min-width:0}
.dgp-searchRow{box-sizing:border-box;height:30px;display:flex;flex:1 1 auto;flex-wrap:nowrap;align-items:center;gap:4px;min-width:0;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:0 6px;position:relative}
.dgp-searchRow>.dgp-lbtn{font-size:12px;line-height:18px;padding:1px 7px}
.dgp-searchRow:focus-within{border-color:var(--dsw-alias-state-business-primary)}
.dgp-toolbarActions{display:flex;align-items:center;gap:4px;flex:none}
.dgp-toolbarActionDivider{margin:0 3px}
.dgp-crumbsInline{flex:0 1 auto;min-width:0;max-width:min(36vw,380px);flex-wrap:nowrap;overflow:hidden;white-space:nowrap;padding:0 2px;gap:1px}
.dgp-crumbsInline .dgp-crumb{flex:0 1 auto;min-width:0;max-width:180px;overflow:hidden;padding:2px 4px}
.dgp-crumbsInline .dgp-crumbRoot{flex:none;width:24px;justify-content:center;padding:2px 0}
.dgp-crumbsInline .dgp-crumb>svg{flex:none}
.dgp-crumbsInline .dgp-crumbLabel{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-crumbsInline .dgp-crumbSep{flex:none}
.dgp-crumbsInline .dgp-crumbEllipsis{flex:none;min-width:28px;justify-content:center;font-weight:600;letter-spacing:1px}
.dgp-toolbarDivider{height:18px;flex:none;border-left:1px solid var(--dsw-alias-border-l2);margin:0 2px}
.dgp-toolbarFolder{width:22px;height:22px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dgp-toolbarFolder:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dgp-crumbMenu{position:fixed;z-index:61;min-width:180px;max-width:min(360px,88vw);max-height:min(42vh,360px);overflow:auto;background:color-mix(in srgb,var(--dsw-alias-bg-base) 97%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 0 1px rgba(0,0,0,.2),0 4px 16px rgba(0,0,0,.08);padding:6px;display:flex;flex-direction:column;gap:2px;animation:dgp-scale .12s cubic-bezier(.2,.8,.2,1)}
.dgp-crumbMenuItem{display:flex;align-items:center;gap:8px;width:100%;min-width:0;padding:6px 8px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;text-align:left;cursor:pointer}
.dgp-crumbMenuItem:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dgp-crumbMenuItem>svg{flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-crumbMenuLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-searchIcon{display:inline-flex;flex:none;color:color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent)}
.dgp-search{border:none;background:0 0;outline:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:24px;min-width:0;flex:1}
.dgp-search::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-primary) 45%,transparent)}
.dgp-searchHist{position:fixed;left:0;top:0;z-index:60;background:color-mix(in srgb,var(--dsw-alias-bg-base) 97%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 0 1px rgba(0,0,0,.2),0 4px 16px rgba(0,0,0,.08);padding:6px;display:flex;flex-direction:column;gap:2px;animation:dgp-scale .12s cubic-bezier(.2,.8,.2,1);will-change:transform}
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
.dgp-pane{min-width:0;min-height:0;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 98%,transparent);padding:6px;display:flex;flex-direction:column;gap:1px;transition:background .2s;contain:content}
.dgp-pane[data-flat="true"]{border:0;border-radius:0;background:transparent;padding:0}
.dgp-paneTitle{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);padding:2px 6px 4px;font-weight:500;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dgp-globalList{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.dgp-paneEmpty{color:var(--dsw-alias-label-secondary);font-size:12px;padding:10px 8px}
.dgp-fileIcon{display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--dsw-alias-label-secondary)}
.dgp-fileIcon--dir{border-radius:5px;color:var(--dsw-alias-label-secondary);transition:color .12s ease,background-color .12s ease}
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
.dgp-previewName{font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:13px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.dgp-previewBody{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:12px 14px;overscroll-behavior:contain;contain:content}
/* Markdown chunked-render progress: thin bar above the streaming content. */
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
.dgp-md pre{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px 12px;overflow-x:auto;overflow-y:hidden;margin:0 0 12px}
.dgp-md pre code{background:0 0;padding:0;font-size:12px;line-height:1.6}
.dgp-md a{color:var(--dsw-alias-state-business-primary);text-decoration:none}
.dgp-md a:hover{text-decoration:underline}
.dgp-md blockquote{margin:0 0 12px;padding:4px 12px;border-left:3px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-radius:0 8px 8px 0}
.dgp-md hr{border:none;border-top:1px solid var(--dsw-alias-border-l1);margin:14px 0}
.dgp-md table{border-collapse:collapse;margin:0 0 12px;font-size:12px;width:100%}
.dgp-md th,.dgp-md td{border:1px solid var(--dsw-alias-border-l2);padding:5px 10px;text-align:left}
.dgp-md th{background:var(--dsw-alias-bg-layer-1);font-weight:500}
.dgp-md img{max-width:100%}
/* ── upload / export status row + multi-select bar + row checkbox ── */
.dgp-noteRow{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 8%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-state-business-primary) 45%,transparent);border-radius:8px;padding:6px 10px;color:var(--dsw-alias-label-primary);font-size:13px;display:flex;align-items:center;gap:8px}
.dgp-multiBar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:5px 8px}
.dgp-rowCheck{width:16px;height:16px;flex:none;border:1px solid var(--dsw-alias-border-l2);border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;line-height:1;color:#fff;cursor:pointer;user-select:none;background:var(--dsw-alias-bg-base)}
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
/* !important: .dgp-body carries inline padding from FilePanelBody. */
.dgp-root[data-narrow="true"] .dgp-body{padding:8px 10px calc(12px + env(safe-area-inset-bottom,0px)) !important}
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
/* Narrow width: the 修改时间 column + its header drop out (size stays). */
.dgp-root[data-narrow="true"] .dgp-rowTime,.dgp-root[data-narrow="true"] .dgp-fileHeadTime{display:none}
.dgp-root[data-narrow="true"] .dgp-fileHeadName{padding-left:0}
/* Single-bar header on a phone: let the workspace title shrink and keep the
   inline tabs swipeable. */
.dgp-root[data-narrow="true"] .dgp-titleWrap{max-width:140px}
@keyframes dgp-sheet-in{from{transform:translateY(28px);opacity:0}to{transform:none;opacity:1}}
`;
			document.head.appendChild(style);
		}
