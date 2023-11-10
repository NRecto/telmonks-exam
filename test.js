const https = require('https');
const http = require('http');

const url = 'https://time.com'; 

const extractContent = (html, tag, className) => {
	const tagStart = `<${tag} class="${className}"`;
	const tagEnd = `</${tag}>`;

	const startIndex = html.indexOf(tagStart);
	const endIndex = html.indexOf(tagEnd, startIndex);

	if (startIndex !== -1 && endIndex !== -1) {
		return html.substring(startIndex, endIndex + tagEnd.length); 
	} else {
		return null;
	}
};

const extractLiElementsFromUl = ulContent => {
	const liElements = [];
	const liStart = '<li';
	const liEnd = '</li>';

	let currentIndex = 0;

	while (true) {
		const liStartIndex = ulContent.indexOf(liStart, currentIndex);
		const liEndIndex = ulContent.indexOf(liEnd, liStartIndex);

		if (liStartIndex === -1 || liEndIndex === -1) {
			break; 
		}

		const liContent = ulContent.substring(liStartIndex, liEndIndex + liEnd.length);
		liElements.push(liContent);

		currentIndex = liEndIndex + liEnd.length;
	}
	return liElements;
};

const extracth3 = html => {
	const tagStart = `<h3 class="latest-stories__item-headline">`;
	const tagEnd = `</h3>`;

	let startIndex = html.indexOf(tagStart);
	let endIndex = html.indexOf(tagEnd, startIndex);
	if (html.includes('strong')) {
		startIndex += 8;
		endIndex -= 9;
		console.log('has string');
	}
	if (startIndex !== -1 && endIndex !== -1) {
		return html.substring(startIndex + tagStart.length, endIndex);
	} else {
		return null;
	}
};

const extractATag = html => {
	const tagStart = `<a href="`;
	const tagEnd = `">`;

	const startIndex = html.indexOf(tagStart);
	const endIndex = html.indexOf(tagEnd, startIndex);

	if (startIndex !== -1 && endIndex !== -1) {
		return html.substring(startIndex + tagStart.length, endIndex);
	} else {
		return null;
	}
};

const server = http.createServer((req, res) => {
	res.setHeader('Content-Type', 'application/json');
  
	if (req.method === 'GET' && req.url === '/api/data') {
	  
	  https.get(url, response => {
		let htmlData = '';

		response.on('data', chunk => {
			htmlData += chunk;
		});

		response.on('end', () => {
			const divHtml = extractContent(htmlData, 'div', 'partial latest-stories');

			const LiData = extractLiElementsFromUl(divHtml);

			let data = [];
			for (const li of LiData) {
				const liItem = extractContent(li, 'h3', 'latest-stories__item-headline');

				const title = extracth3(liItem);
				const link = extractATag(li);
				data.push({ title, link: `https://time.com${link}` });
			}
			console.log({ data });
			res.end(JSON.stringify({
				data
			}));
	
		});
	}).on('error', error => {
		console.error('Error:', error);
	});
	 
	} else {
	  res.statusCode = 404;
	  res.end(JSON.stringify({ error: 'Not Found' }));
	}
  });
const PORT = 3000
  server.listen(PORT, () => {
	console.log(`Server running at https://localhost:${PORT}`);
  });

