build:
	./node_modules/.bin/browserify-server \
		--bundle=index.js -o ./static/bundle.js

server:
	./node_modules/.bin/browserify-server \
		--server=./static --port=9476

watch:
	./node_modules/.bin/wr "make build" .

live-reload:
	./node_modules/.bin/live-reload --port=9474

open:
	google-chrome localhost:9476

all:
	make build
	make server &
	make live-reload &
	make watch
