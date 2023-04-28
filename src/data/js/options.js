document.addEventListener('DOMContentLoaded', async function() {
	// get current options
	const options = (await chrome.storage.sync.get({
		options: {
			xtag: 0,
			form: 0
		}
	})).options;
	
	// display current options
	for (const [key, value] of Object.entries(options)) {
		switch (key) {
			case 'xtag':
			case 'form':
				document.querySelector(`[name="${key}"][value="${value}"]`).click();
				break;
		}
	}

	// when any change
	document.addEventListener('input', async function(event) {
		let key = event.target.getAttribute('name');
		let value = event.target.value;

		switch (key) {
			case 'xtag':
			case 'form':
				options[key] = parseInt(value);
				break;
		}

		// save
		await chrome.storage.sync.set({options: options});
	});

});

