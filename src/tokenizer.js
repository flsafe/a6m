
var Tokenizer = module.exports = function() {
  
};

Tokenizer.PHONE_REGEX = /[0-9]{3}.{0,3}[0-9]{3}.?[0-9]{4}/g;

(function () {
	var self = this;

	self.toTokens = function(documentString) {
		var phones = self.pluckPhoneNumbers(documentString);
		var tokens = self.pluckWordTokens(documentString);
		tokens = tokens.concat(phones);
		return tokens;
	}

	self.pluckWordTokens = function(documentString) {
		return documentString.split(/\s+/)
		                     .map(self.normalizeToken)
		                     .filter(self.isAphlaNum);
	};

	self.normalizeToken = function(token) {
		return token.trim().toLowerCase()
		                   .replace(/^\W/, '')
		                   .replace(/\W$/, '')
		                   .replace('http://', '')
		                   .replace('www.', '');
	};

	self.isAphlaNum = function(token) {
		return token !== '' && !token.match(/^\W$/);
	};

	self.pluckPhoneNumbers = function(documentString) {
		var phones = documentString.match(Tokenizer.PHONE_REGEX) || [];
		phones = phones.map(self.normalizePhone);
		phones = phones.reduce(function(acc, phone) {
			acc.push(phone, phone.substring(0, 3))
			return acc;
		},
		[]);
		return phones;
	};

	self.normalizePhone = function(token) {
		return token.replace(/\W/g, '');
	};
}).call(Tokenizer.prototype);