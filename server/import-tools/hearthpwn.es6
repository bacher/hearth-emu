
function parseHearthPwd(html) {
    const deckName = html.match(/<h2 class="deck-title tip" title="([^"]+)">/)[1];
    const deckClas = html.match(/<span class="class class-([a-z]+)"><\/span>/)[1];

    const tBodyIndex = html.indexOf('<tbody>');

    html = html.substr(tBodyIndex + 7);

    const tBodyEndIndex = html.indexOf('</tbody>');

    const classCards = parseTable(html.substr(0, tBodyEndIndex));


    html = html.substr(tBodyEndIndex + 7);

    const tBodyIndex2 = html.indexOf('<tbody>');

    html = html.substr(tBodyIndex2 + 7);

    const tBodyEndIndex2 = html.indexOf('</tbody>');

    const neutralCards = parseTable(html.substr(0, tBodyEndIndex2));

    return {
        name: deckName,
        clas: deckClas,
        cards: classCards.concat(neutralCards)
    };
}

function parseTable(html) {
    html = html.replace(/[\r\n]/g, '');

    const match = html.match(/<tr.+?<\/tr>/g);

    const lines = [];

    match.forEach(line => {
        line = line.replace(/<[^>]+>/g, ' ').trim().replace(/\s+/g, ' ');

        const parts = line.split(' × ');

        lines.push({
            name: parts[0],
            count: Number(parts[1].split(' ')[0])
        });
    });

    return lines;
}

exports.parse = parseHearthPwd;
