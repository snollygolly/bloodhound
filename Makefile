REPORTER = nyan
TESTS = tests/*.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --harmony-generators \
	--reporter $(REPORTER) \
	$(TESTS) \

install:
	curl -X PUT http://127.0.0.1:5984/users && \
	curl -X PUT http://127.0.0.1:5984/index && \
	curl -X PUT http://127.0.0.1:5984/shows && \
	curl -X PUT http://127.0.0.1:5984/searches && \
	curl -X PUT http://127.0.0.1:5984/listings \

.PHONY: test
