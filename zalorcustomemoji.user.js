// ==UserScript==
// @name         Zalo Custom Reactions with Text Input
// @version      1.6
// @description  Zalo web custom reaction with improved UI for text input
// @author       Anhwaivo (improved) , Meohunter ( text Box )
// @match        https://*.zalo.me/*
// @match        https://chat.zalo.me/*
// @grant        none
// @run-at       document-idle
// @downloadURL  https://github.com/anhwaivo/zalo-custom-reaction-userscript/raw/refs/heads/main/zalorcustomemoji.user.js
// ==/UserScript==

(function() {
"use strict";
	const reactions = [
		{type: 100, icon: "👏", name: "clap", class: "emoji-sizer emoji-outer", bgPos: "80% 12.5%"},
		{type: 101, icon: "🎉", name: "huh", class: "emoji-sizer emoji-outer", bgPos: "74% 62.5%"},
		{type: 102, icon: "💬", name: "text", class: "emoji-sizer emoji-outer", bgPos: "84% 82.5%"}
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
			border-radius: 12px;
			box-shadow: 0 4px 20px rgba(0,0,0,0.25);
			padding: 20px;
			z-index: 9999;
			display: none;
			flex-direction: column;
			gap: 15px;
			min-width: 300px;
			font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
			animation: fadeIn 0.2s ease-out;
		`;
		
		const title = document.createElement("div");
		title.textContent = "Tùy chỉnh reaction";
		title.style.cssText = "font-weight: bold; font-size: 16px; color: #333; margin-bottom: 5px;";
		
		const inputContainer = document.createElement("div");
		inputContainer.style.cssText = "position: relative;";
		
		const input = document.createElement("input");
		input.type = "text";
		input.id = "custom-text-reaction-input";
		input.placeholder = "Nhập nội dung reaction...";
		input.maxLength = 15; 
		input.style.cssText = `
			padding: 10px 12px;
			border: 2px solid #e0e0e0;
			border-radius: 8px;
			width: 100%;
			box-sizing: border-box;
			font-size: 14px;
			transition: border-color 0.2s;
			outline: none;
		`;
		input.addEventListener("focus", () => {
			input.style.borderColor = "#2196F3";
		});
		input.addEventListener("blur", () => {
			input.style.borderColor = "#e0e0e0";
		});
		
		const charCounter = document.createElement("div");
		charCounter.style.cssText = "position: absolute; right: 10px; bottom: -18px; font-size: 11px; color: #999;";
		charCounter.textContent = "0/15";
		
		input.addEventListener("input", () => {
			charCounter.textContent = `${input.value.length}/15`;
		});
		
		inputContainer.appendChild(input);
		inputContainer.appendChild(charCounter);
		
		const buttonContainer = document.createElement("div");
		buttonContainer.style.cssText = "display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;";
		
		const cancelButton = document.createElement("button");
		cancelButton.textContent = "Hủy";
		cancelButton.style.cssText = `
			padding: 8px 16px;
			border: none;
			border-radius: 6px;
			background-color: #f5f5f5;
			color: #333;
			font-weight: 500;
			cursor: pointer;
			transition: background-color 0.2s;
		`;
		cancelButton.onmouseover = () => {
			cancelButton.style.backgroundColor = "#e0e0e0";
		};
		cancelButton.onmouseout = () => {
			cancelButton.style.backgroundColor = "#f5f5f5";
		};
		cancelButton.onclick = () => {
			hidePopup();
		};
		
		const confirmButton = document.createElement("button");
		confirmButton.textContent = "Gửi";
		confirmButton.style.cssText = `
			padding: 8px 16px;
			border: none;
			border-radius: 6px;
			background-color: #2196F3;
			color: white;
			font-weight: 500;
			cursor: pointer;
			transition: background-color 0.2s;
		`;
		confirmButton.onmouseover = () => {
			confirmButton.style.backgroundColor = "#1976D2";
		};
		confirmButton.onmouseout = () => {
			confirmButton.style.backgroundColor = "#2196F3";
		};
		
		buttonContainer.appendChild(cancelButton);
		buttonContainer.appendChild(confirmButton);
		
		popup.appendChild(title);
		popup.appendChild(inputContainer);
		popup.appendChild(buttonContainer);
		
		// Add overlay
		const overlay = document.createElement("div");
		overlay.id = "custom-reaction-overlay";
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0,0,0,0.4);
			z-index: 9998;
			display: none;
			animation: fadeIn 0.2s ease-out;
		`;
		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) {
				hidePopup();
			}
		});
		
		const hidePopup = () => {
			popup.style.display = "none";
			overlay.style.display = "none";
		};
		
		document.body.appendChild(popup);
		document.body.appendChild(overlay);
		
		return {
			popup, 
			input, 
			confirmButton, 
			show: () => {
				popup.style.display = "flex";
				overlay.style.display = "block";
				input.value = "";
				charCounter.textContent = "0/15";
				input.focus();
			},
			hide: hidePopup,
			overlay
		};
	};

	const enhanceReactionPanel = () => {
		const style = document.createElement("style");
		style.textContent = `
			.reaction-emoji-list {
				display: flex !important;
				max-width: 350px !important; /* Wider emoji list */
				justify-content: center !important;
				padding: 8px 10px !important;
				gap: 8px !important;
				border-radius: 24px !important;
				background-color: white !important;
				box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
			}
			
			.reaction-emoji-icon {
				display: flex !important;
				align-items: center !important;
				justify-content: center !important;
				width: 34px !important;
				height: 34px !important;
				border-radius: 50% !important;
				cursor: pointer !important;
				background-color: rgba(240, 240, 240, 0.5) !important;
				transition: transform 0.2s, background-color 0.2s !important;
			}
			
			.reaction-emoji-icon:hover {
				transform: scale(1.15) !important;
				background-color: #e3f2fd !important;
			}
			
			.emoji-list-wrapper {
				padding: 3px !important;
			}
			
			@keyframes fadeIn {
				from { opacity: 0; }
				to { opacity: 1; }
			}
			
			@keyframes popIn {
				0% { transform: scale(0.8); opacity: 0; }
				70% { transform: scale(1.05); opacity: 1; }
				100% { transform: scale(1); opacity: 1; }
			}
		`;
		document.head.appendChild(style);
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
							
							list.style.animation = "popIn 0.3s ease-out forwards";
							
							reactions.forEach((react, idx) => {
								const div = document.createElement("div");
								const divEmoji = document.createElement("span");
								div.className = "reaction-emoji-icon";
								div.setAttribute("data-custom", "true");
								div.style.animationDelay = `${50 * (idx + 7)}ms`;
								
								if (react.name === "text") {
									divEmoji.innerText = react.icon;
									divEmoji.style.cssText = "font-size: 18px;";
									div.title = "Tạo reaction tùy chỉnh";
								} else {
									divEmoji.innerText = react.icon;
									divEmoji.style.cssText = "font-size: 20px;";
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
										
										window.currentReactionContext = { wrapper, id };
										
										window.textInputPopup.confirmButton.onclick = () => {
											const customText = window.textInputPopup.input.value.trim();
											if (customText) {
												const customReaction = {
													...react,
													icon: customText,
													type: 103 
												};
												
												sendReaction(wrapper, id, customReaction);
												window.textInputPopup.hide();
											}
										};
										
										return;
									}
									
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
			
			if (react.name === "text" || typeof react.icon === "string" && react.icon.length > 2) {
				const textContainer = document.createElement("div");
				textContainer.className = "text-reaction";
				textContainer.textContent = react.icon;
				span.appendChild(textContainer);
			} else {
				const emoji = document.createElement("span");
				if (react.class) {
					emoji.className = react.class;
					emoji.style.cssText = `background: url("assets/emoji.1e7786c93c8a0c1773f165e2de2fd129.png?v=20180604") ${react.bgPos} / 5100% no-repeat; margin: -1px; position: relative; top: 2px`;
				} else {
					emoji.textContent = react.icon;
					emoji.style.fontSize = "20px";
				}
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
		[data-custom="true"] { position: relative; }
		[data-custom="true"]::after { 
			content: ''; 
			position: absolute; 
			bottom: -2px; 
			right: -2px; 
			width: 6px; 
			height: 6px; 
			background: #2196F3; 
			border-radius: 50%; 
		}
		.msg-reaction-icon span { 
			display: flex; 
			align-items: center; 
			justify-content: center; 
		}
		
		/* Text reaction styles */
		.text-reaction {
			background-color: #e3f2fd;
			border-radius: 12px;
			padding: 3px 10px;
			font-size: 12px;
			font-weight: 600;
			color: #1976d2;
			max-width: 120px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		}
		
		/* Hover tooltips */
		[data-custom="true"] {
			position: relative;
		}
		
		[data-custom="true"]:hover::before {
			content: attr(title);
			position: absolute;
			top: -30px;
			left: 50%;
			transform: translateX(-50%);
			background-color: rgba(0,0,0,0.7);
			color: white;
			padding: 4px 8px;
			border-radius: 4px;
			font-size: 12px;
			white-space: nowrap;
			pointer-events: none;
			opacity: 0;
			animation: fadeIn 0.2s forwards;
		}
	`;
	document.head.appendChild(style);

	const init = () => {
		observer.observe(document.body, {childList: true, subtree: true});
		initReactions();
		enhanceReactionPanel();
	};
	"loading" === document.readyState ? document.addEventListener("DOMContentLoaded", init) : init();
})();
