import {jsonCrawler} from './jsoncrawler.js';

let jsonData = {
    year: 3000,
    singer: {
        female: ['DIA', 'UNE', 'Aimyon'],
        male: ['No Rome', 'Sankanaction', 'Dean']
    },
    track: [
        {
            title: 'Paradise',
            artist: 'DIA',
            track: 3000,
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
            track: 1,
            etc: {
                recording: {
                    studio: 'Ayers Rock',
                    address: 'Australia',
                    credit: ['Marceline', 'Finn', 'Jake']
                }
            }
        },
        {
            title: 'Shin Takara Jima',
            artist: 'Sankanaction',
            track: 1,
            etc: {
                recording: {
                    studio: 'Turtle Power',
                    address: 'New York, Brooklyn',
                    credit: ['April', 'Splinter', 'Shredder', 'Rock Steady']
                }
            }
        },
    ]
};

console.log(jsonCrawler(jsonData, "Steven Spielberg", {
    replace: 'Bong Joon Ho'
}));

console.log(jsonCrawler(jsonData, ["Jake", 'DIA'], {
    filter: 'singer',
    replace: [{arrangers: ['PRINCESS BUBBLE GUM', 'FLAME PRINCESS']}, 'Baksa Gimm'],
}));

console.log(JSON.stringify(jsonData, null, 2));

console.log('-');
console.log('-');
console.log('-');
console.log('-');

let distro = ['Linux', {
    distro: [['Red Hat Enterprise Linux', 'Fedora', ['Debian', {
        base: 'Ubuntu',
        sub: ['Lubuntu', 'Xubuntu', 'Kubuntu', 'Linux'],
        os: 'Linux'
    }]]]
}, ['Manjaro', 'Arch Linux', 'Linux']];

console.log(jsonCrawler(distro, "Linux", {
    filter: 'sub',
    replace: 'Mint'
}));

console.log(JSON.stringify(distro, null, 2));