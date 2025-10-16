document.addEventListener("DOMContentLoaded", () => {
	const skipLink			= document.getElementById("skipLink");
	const mainSection		= document.getElementById("main");
	const servicesLink		= document.getElementById("servicesLink");
	const servicesSection	= document.getElementById("services");
	const footerLogo		= document.getElementById("footerLogo");
	const dateYear			= document.getElementById("dateYear");

	if (skipLink && mainSection) {
		skipLink.addEventListener("click", (e) => {
			e.preventDefault();
			mainSection.scrollIntoView({ behavior: "smooth" });
			mainSection.focus({ preventScroll: true });
		});
	}

	if (servicesLink && servicesSection) {
		servicesLink.addEventListener("click", (e) => {
			e.preventDefault();
			servicesSection.scrollIntoView({ behavior: "smooth" });
		});
	}

	if (footerLogo) {
		footerLogo.addEventListener("click", (e) => {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: "smooth" });
		});
	}

	if (dateYear) {
		dateYear.textContent = new Date().getFullYear();
	}

	const body	= document.body;
	const modal	= document.querySelector('.modal');
	if (!modal) return;

	const panel	= modal.querySelector('.content');

	const modalTitle	= panel.querySelector('.fixed h2');
	const modalSubmit	= panel.querySelector('form button[type="submit"]');
	const modalInput	= panel.querySelector('form input[name="Inquiry"]');

	const form			= panel.querySelector('#contact');
	const scrollSection	= panel.querySelector('.scroll');
	const statusSection	= panel.querySelector('.status');
	const statusMessage	= panel.querySelector('#status');
	const setExpanded	= (el, v) => el && el.setAttribute('aria-expanded', v ? 'true' : 'false');
	const resyncFilled = () => {
		if (!form) return;
		form.querySelectorAll('.field .input').forEach(el => {
			el.closest('.field')?.classList.toggle('filled', el.value.trim() !== '');
		});
	};
	
	let opener = null;
	let last = null;

	function open() {
		last = document.activeElement;
		setExpanded(opener, true);
		body.classList.add('overlay');
		modal.hidden = false;
		
		resyncFilled();
		
		const focusable = modal.querySelectorAll('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
		(focusable[0] || modal).focus({ preventScroll: true });
	}

	function close() {
		setExpanded(opener, false);
		body.classList.remove('overlay');
		modal.hidden = true; 
		if (last) last.focus();

		if (form) form.reset();

		if (scrollSection) scrollSection.style.display = "block";
		if (statusSection) statusSection.style.display = "none";
		if (statusMessage) {
			statusMessage.textContent = "";
			statusMessage.removeAttribute('tabindex');
		}
	}

	document.addEventListener('click', (e) => {
		const t = e.target.closest('.trigger');
		
		if (t) {
			e.preventDefault();

			const isOpen = body.classList.contains('overlay');
			if (!isOpen && t.classList.contains('contact')) {
				opener = t;
			}

			const { title, button, type } = t.dataset;
			if (modalTitle && title) modalTitle.textContent = title;
			if (modalSubmit && button) modalSubmit.textContent = button;
			if (modalInput && type) modalInput.value = type;

			isOpen ? close() : open();
		}

		// if (e.target === modal) close();
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') close();
		if (!body.classList.contains('overlay')) return;
		if (e.key !== 'Tab') return;

		const focusable = modal.querySelectorAll(
			'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
		);
		const first = focusable[0];
		const lastEl = focusable[focusable.length - 1];
		if (!first || !lastEl) return;

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			lastEl.focus();
		}
		
		else if (!e.shiftKey && document.activeElement === lastEl) {
			e.preventDefault();
			first.focus();
		}
	});

	if (form) {
		form.addEventListener('submit', async (event) => {
			event.preventDefault();

			// Faux Form Submit Actions - Remove When Your Endpoint/Service Has Been Updated
			const actionAttr = form.getAttribute('action');
			const isDemo = !actionAttr || actionAttr.trim() === '' || actionAttr.trim() === '#';
			if (isDemo) {
				if (scrollSection) scrollSection.style.display = "none";
				if (statusSection) statusSection.style.display = "block";
				if (statusMessage) {
					statusMessage.textContent = "Thanks! This demo form isn't wired to a backend. Replace the form action with your endpoint.";
					statusMessage.setAttribute('tabindex','-1'); statusMessage.focus();
				}
				form.reset();
				return;
			}
			// End of Faux Form Submit Actions

			const data = new FormData(event.target);

			try {
				const response = await fetch(event.target.action, {
					method: form.method,
					body: data,
					headers: { 'Accept': 'application/json' }
				});

				if (scrollSection) scrollSection.style.display = "none";
				if (statusSection) statusSection.style.display = "block";

				if (response.ok) {
					if (statusMessage) statusMessage.textContent = "YOUR SUCCESS MESSAGE GOES HERE";
					form.reset();
					if (statusMessage) {
						statusMessage.setAttribute('tabindex','-1'); statusMessage.focus();
					}
				}

				else {
					let msg = "YOUR ERROR MESSAGE GOES HERE";
					try {
						const json = await response.json();
						if (json && json.errors) {
							msg = json.errors.map(e => e.message).join(", ");
						}
					}
					
					catch(_) {}

					if (statusMessage) {
						statusMessage.textContent = msg; statusMessage.setAttribute('tabindex','-1'); statusMessage.focus();
					}
				}
			}

			catch (_) {
				if (scrollSection) scrollSection.style.display = "none";
				if (statusSection) statusSection.style.display = "block";
				if (statusMessage) {
					statusMessage.textContent = "YOUR ERROR MESSAGE GOES HERE";
					statusMessage.setAttribute('tabindex','-1');
					statusMessage.focus();
				}
			}
		});

		form.addEventListener('reset', () => {
			requestAnimationFrame(() => {
				form.querySelectorAll('.field').forEach(f => f.classList.remove('filled'));
			});
		});
	}

	document.querySelectorAll('.form .field .input').forEach(el => {
		const field	= el.closest('.field');
		const toggle = () => field.classList.toggle('filled', el.value.trim() !== '');

		el.addEventListener('input', toggle);
		el.addEventListener('blur', toggle);
		toggle();
	});
});
