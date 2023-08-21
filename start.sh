#!/bin/bash

pushd frontend
yarn install
yarn build
popd

pushd backend
yarn install
yarn start
popd


