(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/app/gradient.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Gradient": (()=>Gradient)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function Gradient() {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Gradient.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            let width = window.innerWidth;
            let height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            // Create more points for a richer animation
            const points = [];
            for(let i = 0; i < 6; i++){
                points.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 6.0,
                    vy: (Math.random() - 0.5) * 6.0,
                    radius: Math.random() * 300 + 200
                });
            }
            const animate = {
                "Gradient.useEffect.animate": ()=>{
                    ctx.clearRect(0, 0, width, height);
                    // Update points
                    points.forEach({
                        "Gradient.useEffect.animate": (point)=>{
                            point.x += point.vx;
                            point.y += point.vy;
                            // Bounce off edges with padding
                            if (point.x < -100 || point.x > width + 100) point.vx *= -1;
                            if (point.y < -100 || point.y > height + 100) point.vy *= -1;
                        }
                    }["Gradient.useEffect.animate"]);
                    // Create multiple overlapping gradients
                    points.forEach({
                        "Gradient.useEffect.animate": (point, index)=>{
                            const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius);
                            // Create different color combinations for each point
                            const colors = [
                                [
                                    '#003B5C',
                                    '#0077b6',
                                    '#003B5C'
                                ],
                                [
                                    '#0077b6',
                                    '#003B5C',
                                    '#0077b6'
                                ],
                                [
                                    '#003B5C',
                                    '#0077b6',
                                    '#003B5C'
                                ],
                                [
                                    '#0077b6',
                                    '#003B5C',
                                    '#0077b6'
                                ],
                                [
                                    '#003B5C',
                                    '#0077b6',
                                    '#003B5C'
                                ],
                                [
                                    '#0077b6',
                                    '#003B5C',
                                    '#0077b6'
                                ]
                            ];
                            gradient.addColorStop(0, colors[index][0]);
                            gradient.addColorStop(0.5, colors[index][1]);
                            gradient.addColorStop(1, colors[index][2]);
                            ctx.globalAlpha = 0.3;
                            ctx.fillStyle = gradient;
                            ctx.fillRect(0, 0, width, height);
                        }
                    }["Gradient.useEffect.animate"]);
                    ctx.globalAlpha = 1.0;
                    requestAnimationFrame(animate);
                }
            }["Gradient.useEffect.animate"];
            animate();
            const resizeHandler = {
                "Gradient.useEffect.resizeHandler": ()=>{
                    width = window.innerWidth;
                    height = window.innerHeight;
                    canvas.width = width;
                    canvas.height = height;
                }
            }["Gradient.useEffect.resizeHandler"];
            window.addEventListener('resize', resizeHandler);
            return ({
                "Gradient.useEffect": ()=>{
                    window.removeEventListener('resize', resizeHandler);
                    ctx.clearRect(0, 0, width, height);
                }
            })["Gradient.useEffect"];
        }
    }["Gradient.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        id: "gradient-canvas",
        ref: canvasRef
    }, void 0, false, {
        fileName: "[project]/app/gradient.tsx",
        lineNumber: 99,
        columnNumber: 10
    }, this);
}
_s(Gradient, "UJgi7ynoup7eqypjnwyX/s32POg=");
_c = Gradient;
var _c;
__turbopack_context__.k.register(_c, "Gradient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=app_gradient_tsx_82cfc3fd._.js.map