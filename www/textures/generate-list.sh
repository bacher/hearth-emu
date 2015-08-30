#!/usr/bin/env bash

echo [ >textures.json
for f in *.png *.jpg; do
    echo \"$f\", >>textures.json;
done
echo \"\" >>textures.json
echo ] >>textures.json
