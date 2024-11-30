import {
    _decorator,
    Button,
    Component,
    EventTouch,
    Graphics,
    instantiate,
    Label,
    macro,
    Node,
    Prefab,
    ScrollView,
    UITransform,
} from "cc";
const { ccclass, property } = _decorator;

/** 案例 */
const CASES = [
    ["drawDot", "点"],
    ["drawLine", "线"],
    ["drawPolyLine", "折线"],
    ["drawDotLine", "点线"],
    ["drawDashLine", "虚线"],
    ["drawWaveLine", "波浪线"],
    ["drawTriangle", "三角形"],
    ["drawRect", "矩形"],
    ["drawRoundRect", "圆角矩形"],
    ["drawPolygon", "多边形"],
    ["drawArc", "弧形"],
    ["drawEclipse", "椭圆"],
    ["drawCircle", "圆"],
    ["drawWaitCircle", "转圈"],
    ["drawQuadraticCurve", "三点曲线"],
    ["drawCubicCurve", "四点曲线"],
    ["drawFreeBezier2Curve", "自由三点曲线"],
    ["drawFreeBezier3Curve", "自由四点曲线"],
];

/** 页面 */
enum Page {
    /** 主页 */
    Main,
    /** 绘制页 */
    Draw,
}

/**
 * 获取二次贝塞尔曲线上的点
 * @param t 进度 [0, 1]
 * @param x0 起点x
 * @param y0 起点y
 * @param x1 控制点x
 * @param y1 控制点y
 * @param x2 终点x
 * @param y2 终点y
 * @returns
 */
function GetQuadraticCurvePoint(t: number, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) {
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * x1 + t ** 2 * x2;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * y1 + t ** 2 * y2;
    return [x, y];
}

/**
 * 获取三次贝塞尔曲线上的点
 * @param t 进度 [0, 1]
 * @param x0 起点x
 * @param y0 起点y
 * @param x1 控制点（一）x
 * @param y1 控制点（一）y
 * @param x2 控制点（二）x
 * @param y2 控制点（二）y
 * @param x3 终点x
 * @param y3 终点2
 * @returns
 */
function GetCubicCurvePoint(
    t: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
) {
    const x = (1 - t) ** 3 * x0 + 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3 * x3;
    const y = (1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3 * y3;
    return [x, y];
}

/** 随机十六进制通道色值 */
function RandomHexColorChannel() {
    return (((Math.random() * 0xff) | 0) + 1).toString(16).padStart(2, "0");
}

/** 随机十六进制色值 */
function RandomHexColor(alpha: boolean = false) {
    let s = "#";
    let r = RandomHexColorChannel();
    let g = RandomHexColorChannel();
    let b = RandomHexColorChannel();
    s += r + g + b;
    if (alpha) {
        s += RandomHexColorChannel();
    }
    return s;
}

@ccclass("PlayGraphics")
export class PlayGraphics extends Component {
    @property(Prefab)
    GItem: Prefab;

    @property(ScrollView)
    View: ScrollView;

    @property(Button)
    BtnBack: Button;

    @property(Label)
    Title: Label;

    @property(Graphics)
    DrawBoard: Graphics;

    @property(Graphics)
    Painter: Graphics;

    private _toDeletes: Node[];

    start() {
        this.showPage(Page.Main);
        CASES.forEach(([name, label]) => {
            const node = instantiate(this.GItem);
            node.name = name;
            // @ts-ignore
            node.title = label;
            node.getChildByName("Title").getComponent(Label).string = label;
            node.on("click", this.showCase, this);
            node.setParent(this.View.content);
        });
    }

    protected onEnable(): void {
        this.BtnBack.node.on("click", this.onBack, this);
    }

    protected onDisable(): void {
        this.BtnBack.node.off("click", this.onBack, this);
    }

    private showPage(page: Page, title: string = "") {
        this.View.node.active = page === Page.Main;
        this.BtnBack.node.active = page === Page.Draw;
        if (page === Page.Main) {
            this.Title.string = "玩转 Graphics";
        } else {
            this.Title.string = title;
        }
    }

    private onBack() {
        this.showPage(Page.Main);
        this.DrawBoard.clear();
        this.Painter.clear();
        this.unscheduleAllCallbacks();
        this.removeToDeletes();
    }

    private removeToDeletes() {
        if (this._toDeletes) {
            this._toDeletes.forEach((node) => node.destroy());
            this._toDeletes = null;
        }
    }

    private showCase(event: EventTouch) {
        const draw = event.target.name;
        const title = event.target.title;
        this.showPage(Page.Draw, title);
        this.DrawBoard.clear();
        this.Painter.clear();
        if (this[draw]) {
            console.log(title);
            this[draw].call(this);
        }
    }

    private drawDot() {
        const G = this.DrawBoard;
        const R = 5;
        G.lineWidth = 1;

        G.fillColor.fromHEX("#ff0000");
        G.circle(-50, -50, R);
        G.fill();

        G.fillColor.fromHEX("#00ff00");
        G.circle(50, -50, R);
        G.fill();

        G.fillColor.fromHEX("#0000ff");
        G.circle(0, 50, R);
        G.fill();
    }

    private drawLine() {
        const G = this.DrawBoard;
        const R = 5;

        G.lineWidth = 2;
        G.strokeColor.fromHEX("#ffff00");
        G.moveTo(-50, -50);
        G.lineTo(50, -50);
        G.lineTo(0, 50);
        G.close();
        G.stroke();

        G.lineWidth = 1;

        G.fillColor.fromHEX("#ff0000");
        G.circle(-50, -50, R);
        G.fill();

        G.fillColor.fromHEX("#00ff00");
        G.circle(50, -50, R);
        G.fill();

        G.fillColor.fromHEX("#0000ff");
        G.circle(0, 50, R);
        G.fill();
    }

    private drawTriangle() {
        const G = this.DrawBoard;
        G.lineWidth = 5;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#fa6a0a");
        G.moveTo(-50, -50);
        G.lineTo(50, -50);
        G.lineTo(0, 50);
        G.close();
        G.stroke();
        G.fill();
    }

    private drawRect() {
        const G = this.DrawBoard;
        G.lineWidth = 5;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#ff00ff");
        G.rect(-50, -50, 100, 100);
        G.stroke();
        G.fill();
    }

    private drawRoundRect() {
        const G = this.DrawBoard;
        G.lineWidth = 5;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#ff00ff");
        G.roundRect(-50, -50, 100, 100, 5);
        G.stroke();
        G.fill();
    }

    private drawArc() {
        const G = this.DrawBoard;
        G.lineWidth = 5;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#ff00ff");
        G.arc(0, 0, 100, 0, Math.PI / 2, false);
        G.close();
        G.stroke();
        G.fill();

        G.fillColor.fromHEX("#ff00ff");
        G.strokeColor.fromHEX("#4680c8");
        G.arc(5, 5, 100, 0, Math.PI / 2, true);
        G.close();
        G.stroke();
        G.fill();
    }

    private drawEclipse() {
        const G = this.DrawBoard;
        G.lineWidth = 5;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#ff00ff");
        G.ellipse(0, 0, 100, 30);
        G.stroke();
        G.fill();
    }

    private drawCircle() {
        const G = this.DrawBoard;
        G.lineWidth = 5;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#ff00ff");
        G.circle(0, 0, 100);
        G.stroke();
        G.fill();
    }

    private drawPolygon() {
        const G = this.DrawBoard;
        G.lineWidth = 5;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#ff00ff");
        const points = [-100, -50, 100, -50, 50, 50, -50, 50];
        G.moveTo(points[0], points[1]);
        for (let i = 2, l = points.length; i < l; i += 2) {
            G.lineTo(points[i], points[i + 1]);
        }
        G.close();
        G.stroke();
        G.fill();
    }

    private drawPolyLine() {
        const G = this.DrawBoard;
        G.lineWidth = 5;
        G.strokeColor.fromHEX("#ff00ff");
        G.fillColor.fromHEX("#4680c8");
        const points = [-100, -100, -50, -50, -20, 40, 50, 20, 100, -100];
        G.moveTo(points[0], points[1]);
        for (let i = 2, l = points.length; i < l; i += 2) {
            G.lineTo(points[i], points[i + 1]);
            G.stroke();
        }
        for (let i = 0, l = points.length; i < l; i += 2) {
            G.circle(points[i], points[i + 1], 5);
            G.fill();
        }
    }

    private drawDashLine() {
        const G = this.DrawBoard;
        G.lineWidth = 4;
        G.strokeColor.fromHEX("#ff00ff");
        G.fillColor.fromHEX("#4680c8");

        let x1 = -100,
            y1 = -100,
            x2 = 100,
            y2 = 120;
        let dx = x2 - x1,
            dy = y2 - y1;
        let steps = (Math.sqrt(dx * dx + dy * dy) / 20) | 0; // 20 代表空白距离
        let xInc = dx / steps,
            yInc = dy / steps;
        let x = x1,
            y = y1;
        for (let i = 0; i < steps; i += 2) {
            G.moveTo(x, y);
            x += xInc;
            y += yInc;
            G.lineTo(x, y);
            G.stroke();
            x += xInc;
            y += yInc;
        }

        G.fillColor.fromHEX("#4680c8");
        G.circle(x1, y1, 5);
        G.fill();
        G.circle(x2, y2, 5);
        G.fill();
    }

    private drawDotLine() {
        const G = this.DrawBoard;
        G.lineWidth = 2;
        G.fillColor.fromHEX("#ff00ff");
        let x1 = -100,
            y1 = -100,
            x2 = 100,
            y2 = 120;
        let dx = x2 - x1,
            dy = y2 - y1;
        let steps = (Math.sqrt(dx * dx + dy * dy) / 20) | 0; // 20 代表空白距离
        let xInc = dx / steps,
            yInc = dy / steps;
        let x = x1,
            y = y1;
        for (let i = 1; i < steps; i++) {
            x += xInc;
            y += yInc;
            G.circle(x, y, 2);
            G.fill();
        }

        G.fillColor.fromHEX("#4680c8");
        G.circle(x1, y1, 2);
        G.fill();
        G.circle(x2, y2, 2);
        G.fill();
    }

    private drawQuadraticCurve() {
        const G = this.DrawBoard;
        G.lineWidth = 5;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#ff00ff");

        let x0 = -400,
            y0 = 0,
            x1 = 40,
            y1 = 200,
            x2 = 400,
            y2 = -240;
        G.moveTo(x0, y0);
        G.quadraticCurveTo(x1, y1, x2, y2);
        G.stroke();

        G.strokeColor.fromHEX("#ffff00");
        G.moveTo(x0, y0);
        G.lineTo(x2, y2);
        G.stroke();

        G.fillColor.fromHEX("#4680c8");
        G.circle(x0, y0, 5);
        G.fill();
        G.circle(x1, y1, 5);
        G.fill();
        G.circle(x2, y2, 5);
        G.fill();

        G.fillColor.fromHEX("#00ff00");
        const [cx1, cy1] = GetQuadraticCurvePoint(0.25, x0, y0, x1, y1, x2, y2);
        const [cx2, cy2] = GetQuadraticCurvePoint(0.75, x0, y0, x1, y1, x2, y2);
        G.circle(cx1, cy1, 5);
        G.circle(cx2, cy2, 5);
        G.fill();

        let rate = 0;
        const self = this;
        const P = this.Painter;
        P.lineWidth = 5;
        P.fillColor.fromHEX(RandomHexColor());
        P.strokeColor.fromHEX(RandomHexColor());
        function update() {
            rate += 0.001;
            if (rate > 1) {
                rate = 0;
                self.unschedule(update);
                P.clear();
                return;
            }
            const [cx, cy] = GetQuadraticCurvePoint(rate, x0, y0, x1, y1, x2, y2);
            P.clear();
            P.moveTo(x0, y0);
            P.lineTo(cx, cy);
            P.stroke();
            P.moveTo(x2, y2);
            P.lineTo(cx, cy);
            P.stroke();
            P.circle(cx, cy, 5);
            P.fill();
        }
        this.schedule(update, 0.01, macro.REPEAT_FOREVER);
    }

    private drawCubicCurve() {
        const G = this.DrawBoard;
        G.lineWidth = 4;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#ff00ff");

        let x0 = -200,
            y0 = -100,
            x1 = 30,
            y1 = 200,
            x2 = 200,
            y2 = 300,
            x3 = 300,
            y3 = -250;
        G.moveTo(x0, y0);
        G.bezierCurveTo(x1, y1, x2, y2, x3, y3);
        G.stroke();

        G.strokeColor.fromHEX("#ffff00");
        G.moveTo(x0, y0);
        G.lineTo(x3, y3);
        G.stroke();

        G.fillColor.fromHEX("#4680c8");
        G.circle(x0, y0, 5);
        G.fill();
        G.circle(x1, y1, 5);
        G.fill();
        G.circle(x2, y2, 5);
        G.fill();
        G.circle(x3, y3, 5);
        G.fill();

        const [cx1, cy1] = GetCubicCurvePoint(0.25, x0, y0, x1, y1, x2, y2, x3, y3);
        const [cx2, cy2] = GetCubicCurvePoint(0.75, x0, y0, x1, y1, x2, y2, x3, y3);
        G.fillColor.fromHEX("#00ff00");
        G.circle(cx1, cy1, 5);
        G.fill();
        G.fillColor.fromHEX("#00ffff");
        G.circle(cx2, cy2, 5);
        G.fill();

        let rate = 0;
        const self = this;
        const P = this.Painter;
        P.lineWidth = 5;
        P.fillColor.fromHEX(RandomHexColor());
        P.strokeColor.fromHEX(RandomHexColor());
        function update() {
            rate += 0.001;
            if (rate > 1) {
                rate = 0;
                self.unschedule(update);
                P.clear();
                return;
            }
            const [cx, cy] = GetCubicCurvePoint(rate, x0, y0, x1, y1, x2, y2, x3, y3);
            P.clear();
            P.moveTo(x0, y0);
            P.lineTo(cx, cy);
            P.stroke();
            P.moveTo(x3, y3);
            P.lineTo(cx, cy);
            P.stroke();
            P.circle(cx, cy, 5);
            P.fill();
        }
        this.schedule(update, 0.01, macro.REPEAT_FOREVER);
    }

    private drawWaveLine() {
        const G = this.DrawBoard;
        G.lineWidth = 4;
        G.fillColor.fromHEX("#4680c8");
        G.strokeColor.fromHEX("#ff00ff");

        let x1 = -100,
            y1 = 0,
            x2 = 100,
            y2 = 0;
        let w = 16;
        let px1 = 0,
            py1 = 0,
            px2 = 0,
            py2 = 0,
            cx = 0,
            cy = 0;
        let segments = Math.ceil((x2 - x1) / w);
        for (let i = 0; i < segments; i++) {
            px1 = x1 + i * w;
            px2 = px1 + w;
            cx = px1 + w / 2;
            cy = w * 0.618;
            G.moveTo(px1, py1);
            G.quadraticCurveTo(cx, cy, px2, py2);
        }
        G.stroke();

        G.circle(x1, y1, 2);
        G.fill();
        G.circle(x2, y2, 2);
        G.fill();
    }

    private drawWaitCircle() {
        const G = this.DrawBoard;
        G.lineWidth = 4;

        let rate = 0;
        this.schedule(
            () => {
                rate -= 0.1;
                if (rate <= 0) {
                    rate = 2 * Math.PI + rate;
                }
                G.clear();
                G.strokeColor.fromHEX("#3f3f3f");
                G.arc(0, 0, 24, rate, Math.PI * 0.5 + rate, false);
                G.stroke();
                G.strokeColor.fromHEX("#8f8f8f");
                G.arc(0, 0, 24, rate, Math.PI * 1.5 + rate, true);
                G.stroke();
            },
            0.01,
            macro.REPEAT_FOREVER
        );
    }

    private drawFreeBezier2Curve() {
        let px1 = -200,
            py1 = 0,
            px2 = 200,
            py2 = 0,
            cx1 = 0,
            cy1 = 200;

        const P = this.Painter;
        const FILLS = {
            p1: "#ff0000",
            c1: "#00ff00",
            p2: "#0000ff",
        };
        P.lineWidth = 4;
        P.fillColor.fromHEX("#ff00ff");

        const render = () => {
            P.clear();
            P.moveTo(px1, py1);
            P.quadraticCurveTo(cx1, cy1, px2, py2);
            P.stroke();
        };

        const createDot = (name: string, x: number, y: number) => {
            const dot = new Node(name);
            const ut = dot.addComponent(UITransform);
            const g = dot.addComponent(Graphics);
            this.node.addChild(dot);
            dot.on(
                Node.EventType.TOUCH_MOVE,
                (evt: EventTouch) => {
                    let x = evt.getDeltaX();
                    let y = evt.getDeltaY();
                    let { x: dx, y: dy } = dot.getPosition();
                    dot.setPosition(x + dx, y + dy);
                    if (name == "p1") {
                        px1 = x + dx;
                        py1 = y + dy;
                    } else if (name == "c1") {
                        cx1 = x + dx;
                        cy1 = y + dy;
                    } else if (name == "p2") {
                        px2 = x + dx;
                        py2 = y + dy;
                    }
                    render();
                },
                this
            );
            dot.setPosition(x, y);
            ut.setContentSize(20, 20);
            g.fillColor.fromHEX(FILLS[name]);
            g.circle(0, 0, 10);
            g.fill();
            return dot;
        };

        const p1 = createDot("p1", px1, py1);
        const c1 = createDot("c1", cx1, cy1);
        const p2 = createDot("p2", px2, py2);
        this._toDeletes = [p1, c1, p2];

        render();
    }

    private drawFreeBezier3Curve() {
        let px1 = -200,
            py1 = 0,
            px2 = 200,
            py2 = 0,
            cx1 = -50,
            cy1 = 200,
            cx2 = 50,
            cy2 = 200;

        const P = this.Painter;
        const FILLS = {
            p1: "#ff0000",
            c1: "#00ff00",
            c2: "#ffff00",
            p2: "#0000ff",
        };
        P.lineWidth = 4;
        P.strokeColor.fromHEX("#000000");

        const render = () => {
            P.clear();
            P.moveTo(px1, py1);
            P.bezierCurveTo(cx1, cy1, cx2, cy2, px2, py2);
            P.stroke();
        };

        const createDot = (name: string, x: number, y: number) => {
            const dot = new Node(name);
            const ut = dot.addComponent(UITransform);
            const g = dot.addComponent(Graphics);
            this.node.addChild(dot);
            dot.on(
                Node.EventType.TOUCH_MOVE,
                (evt: EventTouch) => {
                    let x = evt.getDeltaX();
                    let y = evt.getDeltaY();
                    let { x: dx, y: dy } = dot.getPosition();
                    dot.setPosition(x + dx, y + dy);
                    if (name == "p1") {
                        px1 = x + dx;
                        py1 = y + dy;
                    } else if (name == "c1") {
                        cx1 = x + dx;
                        cy1 = y + dy;
                    } else if (name == "c2") {
                        cx2 = x + dx;
                        cy2 = y + dy;
                    } else if (name == "p2") {
                        px2 = x + dx;
                        py2 = y + dy;
                    }
                    render();
                },
                this
            );
            dot.setPosition(x, y);
            ut.setContentSize(20, 20);
            g.fillColor.fromHEX(FILLS[name]);
            g.circle(0, 0, 10);
            g.fill();
            return dot;
        };

        const p1 = createDot("p1", px1, py1);
        const c1 = createDot("c1", cx1, cy1);
        const c2 = createDot("c2", cx2, cy2);
        const p2 = createDot("p2", px2, py2);
        this._toDeletes = [p1, c1, c2, p2];

        render();
    }
}
