"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

const MERMAID_URL: string = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
const ELK_URL: string =
  "https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk/dist/mermaid-layout-elk.esm.min.mjs";

type MermaidApi = {
  registerLayoutLoaders: (loaders: unknown) => void;
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
};

type MermaidModule = { default: MermaidApi };
type ElkModule = { default: unknown };

const loadModule = (url: string): Promise<MermaidModule> =>
  import(/* webpackIgnore: true */ url) as Promise<MermaidModule>;

const loadElk = (url: string): Promise<ElkModule> =>
  import(/* webpackIgnore: true */ url) as Promise<ElkModule>;

let mermaidReady: Promise<MermaidApi> | null = null;

const getMermaid = (): Promise<MermaidApi> => {
  if (!mermaidReady) {
    mermaidReady = (async () => {
      const [{ default: mermaid }, { default: elkLayouts }] = await Promise.all([
        loadModule(MERMAID_URL),
        loadElk(ELK_URL),
      ]);
      mermaid.registerLayoutLoaders(elkLayouts);
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        look: "classic",
        layout: "elk",
        themeVariables: {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "15px",
          primaryColor: "#1a2c52",
          primaryBorderColor: "#7aa5ff",
          primaryTextColor: "#dbe6f7",
          secondaryColor: "#123a3a",
          secondaryBorderColor: "#4fd1c5",
          secondaryTextColor: "#dbe6f7",
          tertiaryColor: "#3a2c14",
          tertiaryBorderColor: "#e8a33d",
          tertiaryTextColor: "#dbe6f7",
          lineColor: "#8fa3c4",
          clusterBkg: "#0e1a30",
          clusterBorder: "#64748b",
          noteBkgColor: "#3a2c14",
          noteTextColor: "#dbe6f7",
          noteBorderColor: "#e8a33d",
        },
      });
      return mermaid;
    })();
  }
  return mermaidReady;
};

type DiagramActions = {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
  one: () => void;
  expand: () => void;
  panBy: (dx: number, dy: number) => void;
};

/**
 * Interactive Mermaid diagram. Renders client-side from a CDN-loaded Mermaid;
 * crawlers and no-JS readers get the <details> text twin rendered next to it
 * in the article, so the figure never depends on this component for meaning.
 */
export default function MermaidDiagram({ source, label }: { source: string; label: string }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<DiagramActions | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [zoomText, setZoomText] = useState("loading");
  const safeId = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;

    const geom = { zoom: 1, panX: 0, panY: 0, w: 0, h: 0, mode: "fit" };
    const PAD = 24;

    const apply = () => {
      const svg = canvas.querySelector("svg");
      if (!svg || !geom.w) return;
      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const rw = geom.w * geom.zoom;
      const rh = geom.h * geom.zoom;
      geom.panX =
        rw + PAD * 2 <= vw
          ? (vw - rw) / 2
          : Math.min(PAD, Math.max(vw - rw - PAD, geom.panX));
      geom.panY =
        rh + PAD * 2 <= vh
          ? (vh - rh) / 2
          : Math.min(PAD, Math.max(vh - rh - PAD, geom.panY));
      svg.style.width = `${rw}px`;
      svg.style.height = `${rh}px`;
      canvas.style.transform = `translate(${geom.panX}px, ${geom.panY}px)`;
      setZoomText(`${Math.round(geom.zoom * 100)}% — ${geom.mode}`);
    };

    const fit = () => {
      if (!geom.w) return;
      const vw = Math.max(80, viewport.clientWidth - PAD * 2);
      const vh = Math.max(80, viewport.clientHeight - PAD * 2);
      geom.zoom = Math.min(1.8, Math.max(0.08, Math.min(vw / geom.w, vh / geom.h)));
      geom.mode = "fit";
      geom.panX = (viewport.clientWidth - geom.w * geom.zoom) / 2;
      geom.panY = (viewport.clientHeight - geom.h * geom.zoom) / 2;
      apply();
    };

    const zoomAt = (factor: number, cx: number, cy: number) => {
      if (!geom.w) return;
      const next = Math.min(6.5, Math.max(0.08, geom.zoom * factor));
      const ratio = next / geom.zoom;
      geom.panX = cx - ratio * (cx - geom.panX);
      geom.panY = cy - ratio * (cy - geom.panY);
      geom.zoom = next;
      geom.mode = "custom";
      apply();
    };

    const zoomCenter = (factor: number) =>
      zoomAt(factor, viewport.clientWidth / 2, viewport.clientHeight / 2);

    actionsRef.current = {
      zoomIn: () => zoomCenter(1.2),
      zoomOut: () => zoomCenter(1 / 1.2),
      fit,
      one: () => {
        geom.zoom = 1;
        geom.mode = "1:1";
        geom.panX = (viewport.clientWidth - geom.w) / 2;
        geom.panY = (viewport.clientHeight - geom.h) / 2;
        apply();
      },
      expand: () => {
        const svg = canvas.querySelector("svg");
        if (!svg) return;
        const clone = svg.cloneNode(true) as SVGSVGElement;
        clone.removeAttribute("style");
        const page =
          `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">` +
          `<meta name="viewport" content="width=device-width, initial-scale=1.0">` +
          `<title>Diagram</title><style>body{margin:0;min-height:100vh;display:flex;` +
          `align-items:center;justify-content:center;background:#0f172a;padding:40px;` +
          `box-sizing:border-box}svg{max-width:100%;max-height:90vh;height:auto}` +
          `</style></head><body>${clone.outerHTML}</body></html>`;
        const url = URL.createObjectURL(new Blob([page], { type: "text/html" }));
        const tab = window.open(url, "_blank", "noopener");
        if (!tab) URL.revokeObjectURL(url);
      },
      panBy: (dx, dy) => {
        if (!geom.w) return;
        geom.panX += dx;
        geom.panY += dy;
        geom.mode = "custom";
        apply();
      },
    };

    const onResize = () => {
      if (geom.w) {
        if (geom.mode === "fit") fit();
        else apply();
      }
    };
    window.addEventListener("resize", onResize);

    viewport.addEventListener("dblclick", fit);

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      zoomAt(
        event.deltaY < 0 ? 1.2 : 1 / 1.2,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      baseX = geom.panX;
      baseY = geom.panY;
      viewport.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      // On touch, a mostly-vertical swipe is a page scroll — hand it back.
      if (event.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx) * 1.5) {
        dragging = false;
        return;
      }
      event.preventDefault();
      geom.panX = baseX + dx;
      geom.panY = baseY + dy;
      apply();
    };
    const onPointerUp = () => {
      dragging = false;
    };
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);

    getMermaid()
      .then((mermaid) => mermaid.render(`mermaid-${safeId}`, source))
      .then(({ svg }) => {
        if (cancelled) return;
        const parsed = new DOMParser().parseFromString(svg, "text/html");
        const node = parsed.body.querySelector("svg");
        if (!node) {
          setPhase("error");
          return;
        }
        canvas.replaceChildren(document.adoptNode(node));
        const svgNode = canvas.querySelector("svg");
        if (!svgNode) {
          setPhase("error");
          return;
        }
        let w = 0;
        let h = 0;
        if (svgNode.viewBox?.baseVal?.width > 0) {
          w = svgNode.viewBox.baseVal.width;
          h = svgNode.viewBox.baseVal.height;
        }
        if (!w) {
          const rect = svgNode.getBoundingClientRect();
          w = rect.width || 1000;
          h = rect.height || 700;
        }
        if (!svgNode.getAttribute("viewBox")) {
          svgNode.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }
        svgNode.removeAttribute("height");
        svgNode.style.maxWidth = "none";
        svgNode.style.display = "block";
        geom.w = w;
        geom.h = h;
        setPhase("ready");
        fit();
      })
      .catch(() => {
        if (!cancelled) {
          mermaidReady = null;
          setPhase("error");
        }
      });

    return () => {
      cancelled = true;
      actionsRef.current = null;
      window.removeEventListener("resize", onResize);
      viewport.removeEventListener("dblclick", fit);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
    };
  }, [source, safeId]);

  const call = (fn: (actions: DiagramActions) => void) => () => {
    if (actionsRef.current) fn(actionsRef.current);
  };

  const onViewportKeyDown = (event: KeyboardEvent) => {
    const step = 40;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[event.key];
    if (!move || !actionsRef.current) return;
    event.preventDefault();
    actionsRef.current.panBy(move[0], move[1]);
  };

  const controlsDisabled = phase !== "ready";

  return (
    <div className="blog-diagram" role="group" aria-label={label}>
      <div className="blog-diagram-controls">
        <button
          type="button"
          onClick={call((a) => a.zoomIn())}
          title="Zoom in"
          aria-label="Zoom in"
          disabled={controlsDisabled}
        >
          +
        </button>
        <button
          type="button"
          onClick={call((a) => a.zoomOut())}
          title="Zoom out"
          aria-label="Zoom out"
          disabled={controlsDisabled}
        >
          −
        </button>
        <button
          type="button"
          onClick={call((a) => a.fit())}
          title="Fit to box"
          aria-label="Fit diagram to box"
          disabled={controlsDisabled}
        >
          ⤾
        </button>
        <button
          type="button"
          onClick={call((a) => a.one())}
          title="Actual size"
          aria-label="Show diagram at actual size"
          disabled={controlsDisabled}
        >
          1:1
        </button>
        <button
          type="button"
          onClick={call((a) => a.expand())}
          title="Open full size"
          aria-label="Open diagram full size in a new tab"
          disabled={controlsDisabled}
        >
          ⤢
        </button>
        <span className="blog-diagram-zoom" aria-live="polite">
          {phase === "ready" ? zoomText : phase === "loading" ? "Loading…" : "Could not load"}
        </span>
      </div>
      <div
        ref={viewportRef}
        className="blog-diagram-viewport"
        tabIndex={0}
        aria-label={`${label}. Use arrow keys to pan the diagram.`}
        onKeyDown={onViewportKeyDown}
      >
        <div ref={canvasRef} className="blog-diagram-canvas" aria-hidden="true" />
        {phase === "loading" && (
          <p className="blog-diagram-status">Loading the interactive diagram…</p>
        )}
        {phase === "error" && (
          <p className="blog-diagram-status">
            The interactive diagram could not load (it needs network access to the diagram
            library). The full text version follows below the figure.
          </p>
        )}
      </div>
    </div>
  );
}
