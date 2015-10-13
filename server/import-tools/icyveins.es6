
function parse(html) {
    const deckName = html.match(/<title>([^<]+?) - Icy Veins<\/title>/)[1];
    const deckClas = html.match(/<th><span class="([^"]+)">[^<]+<\/span> Cards<\/th>/)[1];

    const tBodyIndex = html.indexOf('class="deck_card_list"');

    html = html.substr(tBodyIndex);

    const tBodyEndIndex = html.indexOf('</table>');

    const classCards = parseTable(html.substr(0, tBodyEndIndex));

    return {
        name: deckName,
        clas: deckClas,
        cards: classCards
    };
}

function parseTable(html) {
    html = html.replace(/[\r\n]/g, '');

    // <li>2x <a class="hearthstone_tooltip_link q1" data-tooltip-href="..." href="...">Arcane Intellect</a></li>

    const match = html.match(/<li>.+?<\/li>/g);

    const lines = [];

    match.forEach(line => {
        const parts = line.match(/<li>(\d).+?>([^>]+?)<\/a>.*?<\/li>/);

        lines.push({
            name: parts[2],
            count: Number(parts[1])
        });
    });

    return lines;
}

exports.parse = parse;
