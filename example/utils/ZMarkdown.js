import * as hmUI from "@zos/ui";
import * as zosPage from "@zos/page";
import { px } from "@zos/utils";

const DEFAULT_TEXT_SIZE = 24;
const DEFAULT_TEXT_COLOR = 0xffffff;
const DEFAULT_TEXT_STYLE = hmUI.text_style.NONE;

export class ZMarkdown {
	constructor() {}
	static createWidget(widgetObj, STYLE) {
		// TODO: 缩放倍率
		this.layout = {
			x: STYLE.x,
			y: STYLE.y,
			w: STYLE.w,
			h: STYLE.h,
			offset: STYLE.x,
			getMaxWidth: (x, width) => {
				if (width > this.layout.w - x) {
					return this.layout.w - x;
				} else {
					return width;
				}
			},
		};

		console.log("layout:", JSON.stringify(this.layout));
		this.style = STYLE;
		this.originText = STYLE.text;

		const lines = this.originText.split("\n");

		for (let i = 0; i < lines.length; i++) {
			const text = lines[i];
			let matched = false;

			for (let type in this.Types) {
				const match = text.match(this.Types[type].Pattern);
				if (match) {
					this.Types[type].createWidget(match);
					matched = true;
					break;
				}
			}

			if (!matched) {
				const { width, height } = hmUI.getTextLayout(text, {
					text_size: ZMarkdown.style.text_size,
					text_width: ZMarkdown.layout.w,
				});

				hmUI.createWidget(hmUI.widget.TEXT, {
					x: ZMarkdown.layout.x,
					y: ZMarkdown.layout.y + ZMarkdown.layout.offset,
					w: width,
					h: height,
					color: ZMarkdown.style.color || DEFAULT_TEXT_COLOR,
					text_size: ZMarkdown.style.text_size,
					align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
					align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
					text_style:
						ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
					text: text,
				});

				ZMarkdown.layout.offset += height;
			}
		}
	}
	static Types = {
		Headings: {
			createWidget(match) {
				const level = match[1].length;
				const text = match[2].trim();

				console.log("layout:", JSON.stringify(ZMarkdown.layout));
				const { width, height } = hmUI.getTextLayout(text, {
					text_size: this.Style["H" + level].text_size,
					text_width: ZMarkdown.layout.w,
				});

				hmUI.createWidget(hmUI.widget.TEXT, {
					x: ZMarkdown.layout.x,
					y: ZMarkdown.layout.y + ZMarkdown.layout.offset,
					w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
					h: height,
					color: 0xffffff || 0xffffff,
					text_size: this.Style["H" + level].text_size,
					align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
					align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
					text_style:
						ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
					text: text,
				});
				ZMarkdown.layout.offset += height;
			},
			Pattern: "^(#{1,6})\\s+(.*)$",
			Style: {
				H1: {
					text_size: DEFAULT_TEXT_SIZE + 14,
				},
				H2: {
					text_size: DEFAULT_TEXT_SIZE + 10,
				},
				H3: {
					text_size: DEFAULT_TEXT_SIZE + 8,
				},
				H4: {
					text_size: DEFAULT_TEXT_SIZE + 6,
				},
				H5: {
					text_size: DEFAULT_TEXT_SIZE + 4,
				},
				H6: {
					text_size: DEFAULT_TEXT_SIZE + 2,
				},
			},
		},
		Links: {
			createWidget(match) {
				const text = match[1].trim();
				const url = match[2].trim();
				QRCode_Style = this.Style.QRCode;
				console.log("layout:", JSON.stringify(ZMarkdown.layout));
				const { width, height } = hmUI.getTextLayout(text, {
					text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
					text_width: ZMarkdown.layout.w,
				});

				const link_text = hmUI.createWidget(hmUI.widget.TEXT, {
					x: ZMarkdown.layout.x,
					y: ZMarkdown.layout.y + ZMarkdown.layout.offset,
					w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
					h: height,
					color: ZMarkdown.style.color || 0x58a6ff,
					text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
					align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
					align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
					text_style:
						ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
					text: text,
				});
				link_text.addEventListener(hmUI.event.CLICK_DOWN, function () {
					zosPage.setScrollLock({
						lock: true,
					});

					const QRCode = hmUI.createWidget(hmUI.widget.QRCODE, {
						...QRCode_Style,
						y: QRCode_Style.y - zosPage.getScrollTop(),
						bg_y: QRCode_Style.bg_y - zosPage.getScrollTop(),
						content: url,
					});
					QRCode.addEventListener(hmUI.event.CLICK_DOWN, function () {
						zosPage.setScrollLock({
							lock: false,
						});

						hmUI.deleteWidget(QRCode);
					});
					console.log(url);
				});
				ZMarkdown.layout.offset += height;
			},
			Pattern: /\[(.*?)\]\((.*?)\)/,
			Style: {
				color: 0x58a6ff,
				QRCode: {
					content: "",
					x: px(140),
					y: px(140),
					w: px(200),
					h: px(200),
					bg_x: px(0),
					bg_y: px(0),
					bg_w: px(480),
					bg_h: px(480),
					bg_radius: px(10),
				},
			},
		},
		Bold: {
			createWidget(match) {
				const text = match[1].trim();
				const { width, height } = hmUI.getTextLayout(text, {
					text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
					text_width: ZMarkdown.layout.w,
				});
				hmUI.createWidget(hmUI.widget.TEXT, {
					x: ZMarkdown.layout.x,
					y: ZMarkdown.layout.y + ZMarkdown.layout.offset,
					w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
					h: height,
					color: 0xffffff,
					text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
					align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
					align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
					text_style:
						ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
					text: text,
				});
				ZMarkdown.layout.offset += height;
			},
			Pattern: /(?:\*([^*]+)\*|_([^_]+)_)/,
			Style: {
				color: 0xffffff,
			},
		},
		BlockQuotes: {
			createWidget(match) {
				console.log("match BlockQuotes:", JSON.stringify(match));

				const level = match[1].length;
				const text = match[2].trim();
				const { width, height } = hmUI.getTextLayout(text, {
					text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
					text_width: ZMarkdown.layout.w,
				});
				for (let i = 0; i < level; i++) {
					hmUI.createWidget(hmUI.widget.FILL_RECT, {
						x: ZMarkdown.layout.x + i * this.Style.x_offset,
						y: ZMarkdown.layout.y + ZMarkdown.layout.offset + 5,
						w: 4,
						h: height - 10,
						radius: 0,
						color: this.Style.color,
					});
				}
				hmUI.createWidget(hmUI.widget.TEXT, {
					x: ZMarkdown.layout.x + level * this.Style.x_offset,
					y: ZMarkdown.layout.y + ZMarkdown.layout.offset,
					w: ZMarkdown.layout.getMaxWidth(
						ZMarkdown.layout.x + level * this.Style.x_offset,
						width
					),
					h: height,
					color: this.Style.text_color,
					text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
					align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
					align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
					text_style:
						ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
					text: text,
				});

				ZMarkdown.layout.offset += height;
			},
			Pattern: /^(>+)\s*(.*)$/,
			Style: {
				color: 0x30363d,
				text_color: 0x8b949e,
				x_offset: px(20),
			},
		},
		HorizontalRules: {
			createWidget(match) {
				hmUI.createWidget(hmUI.widget.FILL_RECT, {
					...this.Style,
					x: ZMarkdown.layout.x + 5,
					y: ZMarkdown.layout.y + ZMarkdown.layout.offset + 5,
					w: ZMarkdown.layout.w - 10,
				});
				ZMarkdown.layout.offset += 15;
			},
			Pattern: /^\s*([-*_])\1{2,}\s*$/,
			Style: {
				h: px(5),
				radius: 3,
				color: 0x30363d,
			},
		},
		UnorderedLists: {
			createWidget(match) {
				const indent = match[1]; // 获取缩进部分
				const symbol = match[2]; // 项目符号
				const text = match[3].trim(); // 项目内容，去掉前后的空白

				// 计算层级，假设每两个空格表示一个层级
				const level = indent.length / 2;
				console.log("level:", level, "text:", text);
				const { width, height } = hmUI.getTextLayout(text, {
					text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
					text_width: ZMarkdown.layout.w,
				});
				hmUI.createWidget(hmUI.widget.FILL_RECT, {
					x: ZMarkdown.layout.x + level * 20,
					y:
						ZMarkdown.layout.y +
						ZMarkdown.layout.offset +
						(height - 5) / 2,
					w: 5,
					h: 5,
					radius: 3,
					color: 0xffffff,
				});
				hmUI.createWidget(hmUI.widget.TEXT, {
					x: ZMarkdown.layout.x + level * 20 + 10,
					y: ZMarkdown.layout.y + ZMarkdown.layout.offset,
					w: ZMarkdown.layout.getMaxWidth(
						ZMarkdown.layout.x + level * 20 + 10,
						width
					),
					h: height,
					color: 0xffffff,
					text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
					align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
					align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
					text_style:
						ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
					text: text,
				});
				ZMarkdown.layout.offset += height;
			},
			Pattern: /^(\s*)([*+\-])\s+(.*)$/,
			Style: {
				color: 0xffffff,
			},
		},
	};
}
