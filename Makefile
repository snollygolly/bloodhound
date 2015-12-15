REPORTER = nyan
TESTS = tests/*.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	$(TESTS) \

install:
	curl -X PUT http://127.0.0.1:5984/users && \
	curl -X PUT http://127.0.0.1:5984/index && \
	curl -X PUT http://127.0.0.1:5984/shows && \
	curl -X PUT http://127.0.0.1:5984/searches && \
	curl -X PUT http://127.0.0.1:5984/listings && \
	curl -X PUT http://127.0.0.1:5984/downloads \

clear-db:
	curl -X DELETE http://127.0.0.1:5984/users && \
	curl -X DELETE http://127.0.0.1:5984/index && \
	curl -X DELETE http://127.0.0.1:5984/shows && \
	curl -X DELETE http://127.0.0.1:5984/searches && \
	curl -X DELETE http://127.0.0.1:5984/listings && \
	curl -X DELETE http://127.0.0.1:5984/downloads \

.PHONY: test
