import { writeFileSync, readFileSync } from 'fs';
import { maxHeaderSize } from 'http';

const wordlist = JSON.parse(readFileSync('wordlist.json', 'utf8'));

function logWord(word) {
    const indexPadded = ('000000' + wordlist.indexOf(word)).slice(-6);
    const url = `https://wordlegame.org/de?challenge=${Buffer.from(word).toString('base64')}`;
    lines.push(`${indexPadded}: ${word} -> ${url}`);
}

function findAndLogWords(finder) {
    const words = finder();
    lines.push('```');
    words.sort((a, b) => (a.length > b.length ? -1 : 1));
    words.forEach(logWord);
    lines.push('```');
}

let lines = [];
lines.push('# Best Words:');
lines.push(`## Total Words: ${wordlist.length}`);

// find words without vocal
findAndLogWords(() => {
    let numberWithoutVocal = 0;
    let withoutVocal = [];
    for (const word of wordlist) {
        let condition = true;
        for (const c of word) {
            if ('aeiouäöü'.indexOf(c) !== -1) {
                condition = false;
            }
        }
        if (condition) {
            withoutVocal.push(word);
            numberWithoutVocal++;
        }
    }

    lines.push(`### Total Found Words Without Vocals: ${numberWithoutVocal}`);
    return withoutVocal;
});
// find words with least different letters
findAndLogWords(() => {
    let lowestDifferentLetters = Infinity;
    let words = {};
    for (const word of wordlist) {
        let differentLetters = '';
        for (const c of word) {
            if (differentLetters.indexOf(c) === -1) {
                differentLetters += c;
            }
        }
        const differentLetterCount = differentLetters.length;
        lowestDifferentLetters = Math.min(lowestDifferentLetters, differentLetterCount);
        words[differentLetterCount] == undefined
            ? (words[differentLetterCount] = [word])
            : words[differentLetterCount].push(word);
    }
    lines.push('|Different Letters|Count|');
    lines.push('|:-:|-:|');
    for (const key in words) {
        lines.push(`|${key}|${words[key].length}|`);
    }
    console.log(lowestDifferentLetters);
    console.log(words);
    lines.push(
        `### Total Found Words With ${lowestDifferentLetters} different letters: ${words[lowestDifferentLetters].length}`
    );
    return words[lowestDifferentLetters];
});

writeFileSync('bestwordslist.md', lines.join('\n'));
