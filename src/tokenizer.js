
var Tokenizer = module.exports = function() {

};

Tokenizer.PHONE_REGEX = /[0-9]{3}.{0,3}[0-9]{3}.?[0-9]{4}/g;

Tokenizer.prototype.toTokens = function (documentString) {
	var phoneTokens = this.pluckPhoneTokens(documentString);
	var wordTokens = this.pluckWordTokens(documentString);
	wordTokens = wordTokens.concat(phoneTokens);
	return wordTokens;
};

Tokenizer.prototype.pluckWordTokens = function (documentString) {
	return documentString.split(/\s+/)
	                     .map(this.normalizeToken)
	                     .filter(this.isAphlaNum);
};

Tokenizer.prototype.normalizeToken = function (token) {
	return token.trim()
	            .toLowerCase()
	            .replace(/^\W/, '')
	            .replace(/\W$/, '')
	            .replace('http://', '')
	            .replace('www.', '');
};

Tokenizer.prototype.isAphlaNum = function (token) {
	return token !== '' && !token.match(/^\W$/);
};

Tokenizer.prototype.pluckPhoneTokens = function (documentString) {
	var phones = documentString.match(Tokenizer.PHONE_REGEX) || [];
	return phones.map(this.normalizePhone)
		         .reduce(function(acc, phone) {
        					acc.push(phone, phone.substring(0, 3));
        					return acc;
        				  },
        			     []);
};

Tokenizer.prototype.normalizePhone = function (token) {
	return token.replace(/\W/g, '');
};
