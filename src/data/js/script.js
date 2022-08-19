var $options = {};

async function getOptions() {
	// get options with default data
	const options = (await chrome.storage.sync.get({
		options: {
			xtag: 0,
			form: 0
		}
	})).options;

	return options;
} 
// create contextMenus
chrome.contextMenus.create({
	id: 'JoyReactor Bayanometr',
	title: 'Bayanometr Search',
	contexts: ['image'],
});
// get messages from content
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
	sendResponse(true);

	// permanently save to ram
	if (Object.keys($options).length == 0)
		$options = await getOptions();

	switch (request.action) {
		case 'start':
			chrome.tabs.sendMessage(sender.tab.id, {options: $options});
			break;
	}
});
// on click contextMenus
chrome.contextMenus.onClicked.addListener(async function(data, tab) {
	chrome.tabs.sendMessage(tab.id, {data: data.srcUrl});
});
// options change
chrome.storage.sync.onChanged.addListener(async function() {
	$options = await getOptions();
});