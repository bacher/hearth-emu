
const fs = require('fs');

function parse(html) {
    const deckName = html.match(/<title>([^<]+) - Hearthstone Top Decks<\/title>/)[1];
    const deckClas = html.match(/<a href="https?:\/\/www\.hearthstonetopdecks\.com\/deck-category\/deck-class\/([a-z]+)\/">/)[1];

    const tBodyIndex = html.indexOf('"deck-class"');

    html = html.substr(tBodyIndex + 7);

    const tBodyEndIndex = html.indexOf('"deck-class neutral-cards"');

    const classCards = parseTable(html.substr(0, tBodyEndIndex));


    html = html.substr(tBodyEndIndex + 26);

    const tBodyEndIndex2 = html.indexOf('"rating-box"');

    const neutralCards = parseTable(html.substr(0, tBodyEndIndex2));

    return {
        name: deckName,
        clas: deckClas,
        cards: classCards.concat(neutralCards)
    };
}

function parseTable(html) {
    html = html.replace(/[\r\n]/g, '');

    const match = html.match(/<span class="card-name">[^<]+<\/span>\s*<span class="card-count">\d+<\/span>/g);

    const lines = [];

    match.forEach(line => {
        line = line.replace(/<[^>]+>/g, ' ').trim().replace(/\s+/g, ' ');

        const match = line.match(/^(.+) (\d+)/);

        lines.push({
            name: match[1],
            count: Number(match[2])
        });
    });

    return lines;
}

exports.parse = parse;
