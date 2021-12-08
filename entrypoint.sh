#!/bin/sh -l

mkdir image-src
cp -r /github/image-src .

cd image-src

npm ci
npm run build
node dist/index.js
