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
