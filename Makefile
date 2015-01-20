REPORTER = nyan
TESTS = tests/*.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --harmony-generators \
	--reporter $(REPORTER) \
	$(TESTS) \

.PHONY: test
