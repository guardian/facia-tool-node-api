var path = require('path');

module.exports = function (req, res, next) {
	var wrapper = {
		send: function (data, links) {
			res.charSet('utf-8');
			res.send({
				data: data,
				links: wrapper.links(links)
			});
			next();
		},
		links: function (handlers) {
			if (handlers) {
				var links = [],
					serverAddress = 'http://' + req.headers.host;

				Object.keys(handlers).forEach(function (rel) {
					var link = path.join(req.url, rel);
					var href = serverAddress + link;
					var handler = handlers[rel];

					if (handler.append) {
						href += handler.append;
					}

					links.push({
						rel: rel,
						href: href
					});
				});

				return links;
			}
		}
	};

	return wrapper;
};
