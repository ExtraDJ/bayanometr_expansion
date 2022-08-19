var $options = {};

const request = function(formData, callback) {
	fetch('https://bayanometr.cc/get/search/', {
		method: 'POST',
		body: formData
	}).then(response => response.json()).then(function(response) {
		// exec display
		show(response.get);
		if (typeof callback == 'function') { callback(); }
	});
}
const search = function(url) {
	// image -> blob
	fetch(url).then(response => response.blob()).then(function(blob) {
		// forming post data
		const formData = new FormData();
		// image
		formData.append('files[0]', blob, url);
		// xtag
		formData.append('xtag', $options.xtag);
		// requset
		request(formData);
	});
}
const position = function() {
	// all blocks with search result
	const items = Object.entries(document.getElementsByClassName('bayanometr-ext'));
	for (const [key, item] of items) {
		let offset = 10;
		for (const [k, i] of items) {
			if (key > k) { offset += i.offsetHeight+10; }
		}
		item.style.bottom = offset+'px';
	}
}
const show = function(data) {
	// error handler 
	if (Object.keys(data.error).length > 0) {
		for (var i in data.error) {
			let container = document.createElement('div');
			container.classList.add('error');

			// error message
			let error = document.createElement('span');
			error.textContent = `${i}: ${data.error[i]}`;
			container.appendChild(error);

			let close = document.createElement('div');
			close.classList.add('close');
			close.textContent = '×';
			close.addEventListener('click', function() {
				this.parentNode.remove();
				position(); // result block position
			});

			// pack all to result block
			let item = document.createElement('div');
			item.classList.add('bayanometr-ext');
			item.appendChild(container);
			item.appendChild(close);

			// add to body
			document.getElementsByTagName('body')[0].appendChild(item);
		}
	}
	// create result
	if (data.result.length > 0) {
		for (var i in data.result) {
			let list = document.createElement('ul');

			// source image
			let src = document.createElement('li');
			src.setAttribute('data-name', 'Исходная');

			let img = document.createElement('img');
			img.setAttribute('src', `https://bayanometr.cc/files/temp/${data.result[i].filename}`);

			src.appendChild(img);
			list.appendChild(src);

			// search result
			for (var q in data.result[i].result) {
				let res = document.createElement('li');
				res.setAttribute('data-name', `Пост ${data.result[i].result[q].post_id}`);

				// if have result
				if (parseInt(data.result[i].result[q].post_id) > 0) {
					// result link
					let link = document.createElement('a');
					link.setAttribute('href', `https://joyreactor.cc/post/${data.result[i].result[q].post_id}`);

					// result preview
					let img = document.createElement('img');
					img.setAttribute('src', `https://img10.reactor.cc/pics/post/image-${data.result[i].result[q].image_id}.img`);

					link.appendChild(img);
					res.appendChild(link);
				} else {
					// xtag
					if (data.result[i].result[q].post_xtag == 'yes') {
						res.classList.add('xfiles');
					} else { // no result
						res.classList.add('noresult');
					}
				}

				list.appendChild(res);
			}

			// close button
			let close = document.createElement('div');
			close.classList.add('close');
			close.textContent = '×';
			close.addEventListener('click', function() {
				this.parentNode.remove();
				position(); // result block position
			});

			// pack all to result block
			let item = document.createElement('div');
			item.classList.add('bayanometr-ext');
			item.setAttribute('data-id', data.result[i].filename);
			item.appendChild(list);
			item.appendChild(close);

			// add to body
			document.getElementsByTagName('body')[0].appendChild(item);
		}
	}

	position(); // result block position
};
const formHandler = function() {
	// allow only for reactor
	if (!window.location.hostname.match(/[a-zA-Z0-9-.]*(reactor|jr-proxy|jrproxy)[a-z.]+/))
		return false;

	var verified = false;

	// form
	const form = document.getElementById('add_post');
	if (!form) // page without form
		return false;

	document.getElementsByClassName('addpost_submit_wr')[0].style.width = 'auto';

	// important inputs
	const inputs = Object.entries(form.querySelectorAll('input[name="picture"], input[name="picture_url"], textarea[name="text"]'));
	for (const [key, item] of inputs) {
		// on change
		item.addEventListener('change', function() {
			// goto re-verify
			verified = false;
			button.value = 'Проверить';
		});
	}

	// submit button
	const button = form.querySelector('input#submit_button');
	// disable submit
	button.setAttribute('type', 'button');
	// submit click
	button.addEventListener('click', function() {
		if (!verified) {
			// links list
			let urls = '';

			const formData = new FormData();
			for (const [i, item] of inputs) {
				let name = item.getAttribute('name');
				// file
				if (name == 'picture') {
					formData.append('files[0]', item.files[0], item.files[0].name);
				} else { // links
					let images = item.value.matchAll(/(http|https|ftp):\/\/([a-zA-Zа-я0-9\-_.?/%+~=&]+)/g);
					for (const match of images) {
						urls += match[0]+"\n";
					}
				}
			}
			// fully links list
			formData.append('urls', urls);
			// check all
			request(formData, function() {
				// set as verified
				verified = true;
				// enable submit button
				button.value = 'Отправить';
				button.setAttribute('type', 'submit');
			});
		}
	});
};
// recive message from script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	sendResponse(true);

	// if have data - search
	if (request.data) {
		search(request.data);
	} else { // only options
		$options = request.options;
		if ($options.form) {
			formHandler();
		}
	}
});

// start to recive options
chrome.runtime.sendMessage({action: 'start'});