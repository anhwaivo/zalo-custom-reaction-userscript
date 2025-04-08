// ==UserScript==
// @name         Zalo Custom Reactions with Text Input
// @namespace    https://e-z.bio/anhwaivo
// @version      1.5
// @description  Zalo web custom reaction with text input feature
// @author       Anhwaivo (improved)
// @match        https://*.zalo.me/*
// @match        https://chat.zalo.me/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
"use strict";
	const reactions = [
		{type: 100, icon: "👏", name: "clap", class: "emoji-sizer emoji-outer", bgPos: "80% 12.5%"},
		{type: 101, icon: "🎉", name: "huh", class: "emoji-sizer emoji-outer", bgPos: "74% 62.5%"},
    	{type: 102, icon: "text", name: "text", class: "emoji-sizer emoji-outer", bgPos: "84% 82.5%"}
	];

	const createTextInputPopup = () => {
		const popup = document.createElement("div");
		popup.id = "custom-text-reaction-popup";
		popup.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: white;
			border-radius: 8px;
			box-shadow: 0 2px 10px rgba(0,0,0,0.2);
			padding: 15px;
			z-index: 9999;
			display: none;
			flex-direction: column;
			gap: 10px;
			min-width: 250px;
		`;

		const title = document.createElement("div");
		title.textContent = "Nhập nội dung reaction";
		title.style.cssText = "font-weight: bold; margin-bottom: 5px;";

		const input = document.createElement("input");
		input.type = "text";
		input.id = "custom-text-reaction-input";
		input.placeholder = "Nhập nội dung reaction...";
		input.maxLength = 10;
		input.style.cssText = `
			padding: 8px;
			border: 1px solid #ddd;
			border-radius: 4px;
			width: 100%;
			box-sizing: border-box;
		`;

		const buttonContainer = document.createElement("div");
		buttonContainer.style.cssText = "display: flex; justify-content: flex-end; gap: 10px; margin-top: 5px;";

		const cancelButton = document.createElement("button");
		cancelButton.textContent = "Hủy";
		cancelButton.style.cssText = `
			padding: 6px 12px;
			border: none;
			border-radius: 4px;
			background-color: #e0e0e0;
			cursor: pointer;
		`;
		cancelButton.onclick = () => {
			popup.style.display = "none";
			document.body.removeChild(overlay);
		};

		const confirmButton = document.createElement("button");
		confirmButton.textContent = "OK";
		confirmButton.style.cssText = `
			padding: 6px 12px;
			border: none;
			border-radius: 4px;
			background-color: #2196F3;
			color: white;
			cursor: pointer;
		`;

		buttonContainer.appendChild(cancelButton);
		buttonContainer.appendChild(confirmButton);

		popup.appendChild(title);
		popup.appendChild(input);
		popup.appendChild(buttonContainer);

		document.body.appendChild(popup);

		// Add overlay
		const overlay = document.createElement("div");
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0,0,0,0.3);
			z-index: 9998;
			display: none;
		`;
		document.body.appendChild(overlay);

		return {
			popup,
			input,
			confirmButton,
			show: () => {
				popup.style.display = "flex";
				overlay.style.display = "block";
				input.value = "";
				input.focus();
			},
			hide: () => {
				popup.style.display = "none";
				overlay.style.display = "none";
			},
			overlay
		};
	};

	const observer = new MutationObserver(mutations => mutations.forEach(m => {
		if (m.type === "childList" && m.addedNodes.length > 0 && Array.from(m.addedNodes).some(n => n.querySelector?.(".reaction-emoji-list"))) {
			setTimeout(() => {
				document.querySelectorAll(".reaction-emoji-list").forEach(list => {
					if (list.getAttribute("data-extended") !== "true") {
						list.setAttribute("data-extended", "true");
						const wrapper = list.closest(".emoji-list-wrapper");
						if (wrapper) {
							const btn = wrapper.querySelector('[id^="reaction-btn-"]');
							const id = btn?.id.replace("reaction-btn-", "");
							reactions.forEach((react, idx) => {
								const div = document.createElement("div");
								const divEmoji = document.createElement("span");
								div.className = "reaction-emoji-icon";
								div.setAttribute("data-custom", "true");
								div.style.animationDelay = `${20 * (idx + 7)}ms`;

								if (react.name === "text") {
									divEmoji.innerText = "Aa";
									divEmoji.style.cssText = "margin: -1px; position: relative; top: 2px; font-size: 16px; font-weight: bold; color: #2196F3;";
								} else {
									divEmoji.innerText = react.icon;
									divEmoji.style.cssText = "margin: -1px; position: relative; top: 2px; font-size: 20px;";
								}

								div.appendChild(divEmoji);
								list.appendChild(div);
								div.addEventListener("click", e => {
									e.preventDefault();
									e.stopPropagation();

									if (react.name === "text") {
										if (!window.textInputPopup) {
											window.textInputPopup = createTextInputPopup();
										}

										window.textInputPopup.show();

										window.textInputPopup.confirmButton.onclick = () => {
											const customText = window.textInputPopup.input.value.trim();
											if (customText) {
												const customReaction = {
													...react,
													icon: customText,
													type: 103 // Unique type for custom text reactions
												};

												sendReaction(wrapper, id, customReaction);
												window.textInputPopup.hide();
											}
										};

										return;
									}

									// For non-text reactions
									sendReaction(wrapper, id, react);
								});
							});
						}
					}
				});
			}, 50);
		}
	}));

	function sendReaction(wrapper, id, react) {
		const getReactFiber = el => {
			for (const k in el) if (k.startsWith("__react")) return el[k];
			return null
		};

		let fiber = getReactFiber(wrapper);
		if (fiber) {
			while (fiber) {
				if (fiber.memoizedProps?.sendReaction) {
					fiber.memoizedProps.sendReaction({rType: react.type, rIcon: react.icon});
					id && updateBtn(id, react);
					break;
				}
				fiber = fiber.return;
			}
		}

		if (window.S?.default?.reactionMsgInfo) {
			const msg = wrapper.closest(".msg-item");
			const msgFiber = msg && getReactFiber(msg);
			msgFiber?.memoizedProps?.sendReaction({rType: react.type, rIcon: react.icon});
			id && updateBtn(id, react);
			wrapper.classList.add("hide-elist");
			wrapper.classList.remove("show-elist");
		}
	}

	function updateBtn(id, react) {
		const span = document.querySelector(`#reaction-btn-${id} span`);
		if (span) {
			span.innerHTML = "";

			// For text reactions, display the actual text
			if (react.name === "text" || typeof react.icon === "string" && react.icon.length > 2) {
				span.textContent = react.icon;
				span.style.cssText = `
					font-size: 12px;
					background-color: #e1f5fe;
					padding: 2px 6px;
					border-radius: 10px;
					color: #0288d1;
					font-weight: bold;
				`;
			} else {
				// For emoji reactions
				const emoji = document.createElement("span");
				emoji.className = react.class;
				emoji.style.cssText = `background: url("assets/emoji.1e7786c93c8a0c1773f165e2de2fd129.png?v=20180604") ${react.bgPos} / 5100% no-repeat; margin: -1px; position: relative; top: 2px`;
				span.appendChild(emoji);
			}
		}
	}

	function initReactions() {
		if (window.S?.default) {
			if (!window.S.default.reactionMsgInfo.some(r => r.rType >= 100)) {
				window.S.default.reactionMsgInfo = [...window.S.default.reactionMsgInfo, ...reactions.map(r => ({rType: r.type, rIcon: r.icon, name: r.name}))];
			}
		} else setTimeout(initReactions, 1000);
	}

	const style = document.createElement("style");
	style.textContent = `
		.reaction-emoji-list { display: flex !important; max-width: 300px !important; justify-content: center !important; }
		.emoji-list-wrapper { width: auto !important; transition: opacity 0.2s ease-in-out !important; }
		.reaction-emoji-icon:hover { transform: scale(1.2) !important; transition: transform 0.2s ease-in-out !important; }
		[data-custom="true"] { position: relative; }
		[data-custom="true"]::after { content: ''; position: absolute; bottom: -2px; right: -2px; width: 6px; height: 6px; background: #2196F3; border-radius: 50%; }
		.msg-reaction-icon span { display: flex; align-items: center; justify-content: center; }

		/* Text reaction styles */
		.text-reaction {
			background-color: #e3f2fd;
			border-radius: 12px;
			padding: 2px 8px;
			font-size: 12px;
			font-weight: 600;
			color: #1976d2;
			max-width: 60px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	`;
	document.head.appendChild(style);

	const init = () => {
		observer.observe(document.body, {childList: true, subtree: true});
		initReactions();
	};
	"loading" === document.readyState ? document.addEventListener("DOMContentLoaded", init) : init();
})();
