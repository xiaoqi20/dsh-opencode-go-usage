// Client half of the dsh-opencode-go-usage plugin.
// Hand-written browser bundle in the lazy-CJS format the client module loader
// expects: it only REGISTERS the factory; the body runs at materialization.
// It mounts the opencodeUsage Remote, registers a settings.section sidebar
// entry ("OpenCode Go"), and renders the usage page.
window.__ModuleLoader__.load({
  id: "dsh-opencode-go-usage",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");

    const NS = "settings.opencodeGoUsage";
    const inject = ["slots", "locale", "remote"];

    const zh = {
      nav: "OpenCode Go",
      title: "OpenCode Go 用量",
      loading: "查询中…",
      notInModels: "尚未在「设置 → 模型」中添加 opencode-go。请先添加后再查询。",
      noApiKey: "未找到 OpenCode Go API Key（OPENCODE_GO_API_KEY / auth.json）。",
      unauthorized: "API Key 无效或已过期（401）。",
      network: "网络请求失败，请稍后重试。",
      httpError: "接口返回 HTTP {status}。",
      badJson: "接口响应解析失败。",
      refresh: "刷新",
      rolling: "5 小时滚动",
      weekly: "每周",
      monthly: "每月",
      limit: "限额",
      reset: "重置",
      status: "状态",
      unknown: "未知",
    };
    const en = {
      nav: "OpenCode Go",
      title: "OpenCode Go usage",
      loading: "Loading…",
      notInModels: "opencode-go is not added under Settings → Models yet. Add it first.",
      noApiKey: "No OpenCode Go API key found (OPENCODE_GO_API_KEY / auth.json).",
      unauthorized: "API key is invalid or expired (401).",
      network: "Network request failed, try again later.",
      httpError: "HTTP {status} from the usage endpoint.",
      badJson: "Failed to parse the usage response.",
      refresh: "Refresh",
      rolling: "5h rolling",
      weekly: "Weekly",
      monthly: "Monthly",
      limit: "limit",
      reset: "resets",
      status: "status",
      unknown: "unknown",
    };

    // Client-side Remote contribution. The result codec is a pass-through
    // parser: the Host already validates the business result against its own
    // zod schema before it crosses the wire, and this side only needs the
    // descriptor's strict shape to mount and call.
    const TYPERT_REMOTE = {
      package: "dsh-opencode-go-usage",
      descriptors: [
        {
          id: "dsh-opencode-go-usage#opencodeUsage/usage",
          service: "opencodeUsage",
          namespace: "opencodeUsage",
          method: "usage",
          invocation: { kind: "direct" },
          parameters: [],
          result: {
            mode: "strict",
            typeSymbol: "dsh-opencode-go-usage#OpencodeUsageResult",
            schema: { parse(value) { return value; } },
          },
        },
      ],
    };

    const LIMITS = { rolling: "$12", weekly: "$30", monthly: "$60" };

    const styles = {
      wrap: { maxWidth: 720, display: "flex", flexDirection: "column", gap: 14, padding: "8px 0" },
      title: { fontSize: 16, fontWeight: 600, margin: 0 },
      hint: { color: "var(--dsw-alias-label-tertiary)", fontSize: 13, lineHeight: 1.6, margin: 0 },
      error: { color: "var(--dsw-alias-state-error-primary)", fontSize: 13, lineHeight: 1.6, margin: 0 },
      card: { border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-3)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 },
      cardHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 },
      cardName: { fontSize: 14, fontWeight: 600, margin: 0 },
      cardMeta: { color: "var(--dsw-alias-label-tertiary)", fontSize: 12, margin: 0 },
      barTrack: { height: 8, borderRadius: 4, background: "var(--dsw-alias-bg-layer-1)", overflow: "hidden" },
      barFill: { height: "100%", borderRadius: 4, background: "var(--dsw-alias-state-business-primary)", transition: "width .2s ease" },
      row: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--dsw-alias-label-secondary)", gap: 8 },
      button: { alignSelf: "flex-start", border: "1px solid var(--dsw-alias-border-l2)", color: "var(--dsw-alias-label-primary)", font: "inherit", cursor: "pointer", background: "transparent", borderRadius: 6, padding: "5px 12px" },
    };

    // Compact readout for the composer dock (the band below the input box).
    const dockStyles = {
      pill: { position: "relative", display: "flex", alignItems: "center", gap: 6, fontSize: 11, lineHeight: "16px", color: "var(--dsw-alias-label-tertiary)", cursor: "pointer", userSelect: "none", padding: "2px 8px", borderRadius: 8, whiteSpace: "nowrap" },
      dot: { width: 6, height: 6, borderRadius: "50%", flex: "none" },
      dotOk: { background: "var(--dsw-alias-state-success-primary)" },
      dotWarn: { background: "var(--dsw-alias-state-warn-primary)" },
      dotErr: { background: "var(--dsw-alias-state-error-primary)" },
      text: { fontVariantNumeric: "tabular-nums" },
      panel: { position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 60, background: "color-mix(in srgb, var(--dsw-specific-menu) 88%, transparent)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 12, boxShadow: "var(--dsw-shadow-lv3)", padding: "10px 14px", minWidth: 280, maxWidth: "min(420px, calc(100vw - 48px))", fontSize: 12 },
      pRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, lineHeight: "20px" },
      pLabel: { color: "var(--dsw-alias-label-secondary)" },
      pValue: { fontVariantNumeric: "tabular-nums", color: "var(--dsw-alias-label-primary)", fontWeight: 500 },
      pBar: { height: 5, borderRadius: 3, background: "var(--dsw-alias-bg-layer-1)", overflow: "hidden", marginTop: 2 },
      pFill: { height: "100%", borderRadius: 3, background: "var(--dsw-alias-state-business-primary)", transition: "width .2s ease" },
      err: { color: "var(--dsw-alias-state-error-primary)" },
    };

    function dockDot(percent) {
      if (percent === null) return dockStyles.dotErr;
      if (percent >= 80) return dockStyles.dotErr;
      if (percent >= 50) return dockStyles.dotWarn;
      return dockStyles.dotOk;
    }

    const WINDOW_KEYS = [
      { key: "rolling", labelKey: "rolling", limit: LIMITS.rolling, short: "5h" },
      { key: "weekly", labelKey: "weekly", limit: LIMITS.weekly, short: "周" },
      { key: "monthly", labelKey: "monthly", limit: LIMITS.monthly, short: "月" },
    ];

    function fmtReset(resetsAt, t) {
      if (!resetsAt) return t("unknown");
      const d = new Date(resetsAt);
      if (Number.isNaN(d.getTime())) return resetsAt;
      return d.toLocaleString();
    }

    function WindowCard(props) {
      const { name, limit, windowData, t } = props;
      const percent = windowData && typeof windowData.percent === "number" ? windowData.percent : null;
      const pct = percent === null ? 0 : Math.max(0, Math.min(100, percent));
      return React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardHead },
          React.createElement("h3", { style: styles.cardName }, name),
          React.createElement("p", { style: styles.cardMeta }, t("limit") + ": " + limit)
        ),
        React.createElement("div", { style: styles.barTrack },
          React.createElement("div", { style: { ...styles.barFill, width: pct + "%" } })
        ),
        React.createElement("div", { style: styles.row },
          React.createElement("span", null, percent === null ? t("unknown") : percent + "%"),
          React.createElement("span", null, t("reset") + ": " + fmtReset(windowData && windowData.resetsAt, t))
        )
      );
    }

    function UsagePanel(props) {
      const { query, t, close } = props;
      const [state, setState] = React.useState({ kind: "loading" });

      const load = React.useCallback(() => {
        setState({ kind: "loading" });
        Promise.resolve()
          .then(() => query())
          .then((result) => {
            if (!result || result.ok === false) {
              setState({ kind: "failure", message: (result && result.error && result.error.message) || "remote failed" });
              return;
            }
            setState({ kind: "done", value: result.value });
          })
          .catch((e) => setState({ kind: "failure", message: String((e && e.message) || e) }));
      }, [query]);

      React.useEffect(() => { load(); }, [load]);

      if (state.kind === "loading") {
        return React.createElement("div", { style: styles.wrap },
          React.createElement("p", { style: styles.hint }, t("loading"))
        );
      }
      if (state.kind === "failure") {
        return React.createElement("div", { style: styles.wrap },
          React.createElement("p", { style: styles.error }, state.message),
          React.createElement("button", { style: styles.button, onClick: load }, t("refresh"))
        );
      }

      const value = state.value || {};
      if (value.configured !== true) {
        const msg = value.reason === "no-api-key" ? t("noApiKey") : t("notInModels");
        return React.createElement("div", { style: styles.wrap },
          React.createElement("p", { style: styles.error }, msg),
          React.createElement("button", { style: styles.button, onClick: load }, t("refresh"))
        );
      }
      if (value.error) {
        let msg = value.error;
        if (value.error === "unauthorized") msg = t("unauthorized");
        else if (value.error === "network") msg = t("network");
        else if (value.error === "bad-json") msg = t("badJson");
        else if (value.error.startsWith("http-")) msg = t("httpError").replace("{status}", value.error.slice(5));
        return React.createElement("div", { style: styles.wrap },
          React.createElement("p", { style: styles.error }, msg),
          React.createElement("button", { style: styles.button, onClick: load }, t("refresh"))
        );
      }

      const usage = value.usage || {};
      return React.createElement("div", { style: styles.wrap },
        React.createElement("h2", { style: styles.title }, t("title")),
        React.createElement(WindowCard, { name: t("rolling"), limit: LIMITS.rolling, windowData: usage.rolling, t }),
        React.createElement(WindowCard, { name: t("weekly"), limit: LIMITS.weekly, windowData: usage.weekly, t }),
        React.createElement(WindowCard, { name: t("monthly"), limit: LIMITS.monthly, windowData: usage.monthly, t }),
        React.createElement("button", { style: styles.button, onClick: load }, t("refresh"))
      );
    }

    // One-line usage readout rendered in the composer dock (below the input
    // box, next to the shipped stats line). Collapsed it shows the three
    // windows' percent used; clicking toggles a small glass panel with bars.
    function DockPill(props) {
      const { query, t } = props;
      const [state, setState] = React.useState({ kind: "loading" });
      const [open, setOpen] = React.useState(false);

      const load = React.useCallback(() => {
        setState((prev) => (prev.kind === "done" ? prev : { kind: "loading" }));
        Promise.resolve()
          .then(() => query())
          .then((result) => {
            if (!result || result.ok === false) {
              setState({ kind: "failure", message: (result && result.error && result.error.message) || "remote failed" });
              return;
            }
            setState({ kind: "done", value: result.value });
          })
          .catch((e) => setState({ kind: "failure", message: String((e && e.message) || e) }));
      }, [query]);

      React.useEffect(() => {
        load();
        const id = setInterval(load, 60000);
        return () => clearInterval(id);
      }, [load]);

      const value = state.kind === "done" ? state.value || {} : null;
      const windows = value && value.configured === true && !value.error && value.usage ? value.usage : null;

      let label = "OC-GO …";
      let dotStyle = dockStyles.dotErr;
      if (windows) {
        const parts = WINDOW_KEYS.map(({ key, short }) => {
          const w = windows[key];
          const pct = w && typeof w.percent === "number" ? Math.round(w.percent) : null;
          return short + (pct === null ? "–" : pct + "%");
        });
        label = "OC-GO " + parts.join(" · ");
        const worst = Math.max(0, ...WINDOW_KEYS.map(({ key }) => (windows[key] && typeof windows[key].percent === "number" ? windows[key].percent : 0)));
        dotStyle = dockDot(worst);
      } else if (value && value.configured === true && value.error) {
        label = "OC-GO " + t("unknown");
      }

      return React.createElement("div", { style: dockStyles.pill }, [
        open
          ? React.createElement("div", { key: "panel", style: dockStyles.panel },
            React.createElement("div", { style: dockStyles.pRow },
              React.createElement("span", { style: dockStyles.pLabel }, t("title")),
              React.createElement("span", { style: { ...dockStyles.dot, ...dotStyle } })
            ),
            windows
              ? WINDOW_KEYS.map(({ key, labelKey, limit }) => {
                  const w = windows[key];
                  const pct = w && typeof w.percent === "number" ? Math.max(0, Math.min(100, w.percent)) : 0;
                  const pctShow = w && typeof w.percent === "number" ? Math.round(w.percent) + "%" : t("unknown");
                  return React.createElement("div", { key, style: { marginTop: 6 } },
                    React.createElement("div", { style: dockStyles.pRow },
                      React.createElement("span", { style: dockStyles.pLabel }, t(labelKey) + " · " + limit),
                      React.createElement("span", { style: dockStyles.pValue }, pctShow)
                    ),
                    React.createElement("div", { style: dockStyles.pBar },
                      React.createElement("div", { style: { ...dockStyles.pFill, width: pct + "%" } })
                    )
                  );
                })
              : React.createElement("div", { style: { ...dockStyles.err, marginTop: 4 } }, t("loading")),
          )
          : null,
        React.createElement("span", {
          key: "label",
          style: dockStyles.text,
          onClick: () => setOpen(!open),
          title: t("title"),
          "aria-expanded": open,
        }, label),
      ]);
    }

    function apply(ctx) {
      const mountReady = ctx.remote.$mount(TYPERT_REMOTE);
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "opencode-go-usage: dictionaries");
      const t = ctx.locale.bind(NS);

      const query = async () => {
        await mountReady;
        const api = ctx.get("remote.opencodeUsage");
        if (!api) throw new Error("opencodeUsage remote is unavailable");
        return api.usage();
      };
      const injected = () => ({ query, t });

      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section",
        id: "opencode-go",
        order: 40,
        label: () => t("nav"),
        locale: NS,
        inject: injected,
      }, UsagePanel));

      // Also surface the same quota in the composer dock (the band below the
      // input box), so it is visible without opening Settings.
      ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
        name: "conversation.composer.dock",
        id: "oc-usage",
        order: 120,
        inject: injected,
      }, DockPill));
    }

    exports.NS = NS;
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
