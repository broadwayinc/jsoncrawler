import { jsonCrawler } from './jsoncrawler.js';

let jsonData = {
    singer: {
        female: ['DIA', 'UNE'],
        male: ['Joji', 'Sankanaction']
    },
    track: [
        {
            title: 'Paradise',
            artist: 'DIA',
            etc: {
                recording: {
                    studio: 'ACME Water Tower',
                    address: 'LA',
                    credit: ['Yakko', 'Wakko', ['Dot', 'Steven Spielberg']]
                }
            }
        },
        {
            title: 'Aussie Boy',
            artist: 'UNE',
            etc: {
                recording: {
                    studio: 'Ayers Rock',
                    address: 'Australia',
                    credit: ['Marceline', 'Finn', 'Jake']
                }
            }
        }
    ]
};
console.log(JSON.stringify(jsonData, null, 2));
console.log('\x1b[33m%s\x1b[0m', 'search "Steven Spielberg", and replace it with "Bong Joon Ho"');
console.log(jsonCrawler(jsonData, "Steven Spielberg", {
    replace: 'Bong Joon Ho'
}));
console.log('\x1b[32m%s\x1b[0m', JSON.stringify(jsonData, null, 2));

console.log('\x1b[33m%s\x1b[0m', 'search "Jake" and replace it to a new object {arrangers: [\'PRINCESS BUBBLE GUM\', \'FLAME PRINCESS\']');
console.log('\x1b[33m%s\x1b[0m', 'search "DIA" and replace it to "Baksa Gimm"');
console.log(jsonCrawler(jsonData, ["Jake", 'DIA'], {
    filter: 'singer',
    replace: [{ arrangers: ['PRINCESS BUBBLE GUM', 'FLAME PRINCESS'] }, 'Baksa Gimm'],
}));
console.log('\x1b[32m%s\x1b[0m', JSON.stringify(jsonData, null, 2));

let distro = ['Linux', {
    distro: [['Red Hat Enterprise Linux', 'Fedora', ['Debian', {
        base: 'Ubuntu',
        sub: ['Lubuntu', 'Xubuntu', 'Kubuntu', 'Linux'],
        os: 'Linux'
    }]]]
}, ['Manjaro', 'Arch Linux', 'Linux']];

console.log(JSON.stringify(distro, null, 2))
console.log('\x1b[33m%s\x1b[0m', 'search "Linux" and replace it to "Baksa Gimm"');
console.log(jsonCrawler(distro, "Linux", {
    filter: 'sub',
    replace: 'Mint'
}));
console.log('\x1b[32m%s\x1b[0m', JSON.stringify(distro, null, 2))