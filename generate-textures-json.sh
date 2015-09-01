#!/usr/bin/env bash

cd www/textures

echo [ >.t
for f in *.png *.jpg; do
    echo \"$f\", >>.t;
done

cat .t | sed '$ s/.$//' > ../textures.json
echo ] >> ../textures.json

rm .t

