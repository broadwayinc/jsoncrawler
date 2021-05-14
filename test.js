import {jsonCrawler} from './jsoncrawler.js';

let obj = {
    artist: "DIA",
    tracks: [
        "Paradise",
        {
            hidden: "Come On Down"
        }
    ]
};
let result = jsonCrawler(obj, ["Come On Down", "DIA"]);
console.log(result);

let ComeOnDown = obj;
result[1].path.map(p => {
    ComeOnDown = ComeOnDown[p];
});
ComeOnDown = ComeOnDown[result[1].key];

let DIA = obj;
result[0].path.map(p => {
    DIA = DIA[p];
});
DIA = DIA[result[0].key];

console.log({ComeOnDown, DIA});

let replace = ['Linux', 'Ubuntu', ['Mint', {mini: ['Lubuntu', 'linux']}]];
jsonCrawler(replace, ['Lubuntu', 'Linux'], {
    replace: ['Xubuntu', 'Linus'],
    filter: ['mini']
});
console.log(JSON.stringify(replace));

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
console.log('search "Steven Spielberg", and replace it with "Bong Joon Ho"');
console.log(jsonCrawler(jsonData, "Steven Spielberg", {
    replace: 'Bong Joon Ho'
}));

console.log('search "Jake" and replace it to a new object {arrangers: [\'PRINCESS BUBBLE GUM\', \'FLAME PRINCESS\']');
console.log('search "DIA" and replace it to "Baksa Gimm"');
console.log(jsonCrawler(jsonData, ["Jake", 'DIA'], {
    filter: 'singer',
    replace: [{arrangers: ['PRINCESS BUBBLE GUM', 'FLAME PRINCESS']}, 'Baksa Gimm'],
}));

console.log(JSON.stringify(jsonData, null, 2));

let distro = ['Linux', {
    distro: [['Red Hat Enterprise Linux', 'Fedora', ['Debian', {
        base: 'Ubuntu',
        sub: ['Lubuntu', 'Xubuntu', 'Kubuntu', 'Linux'],
        os: 'Linux'
    }]]]
}, ['Manjaro', 'Arch Linux', 'Linux']];

console.log('search "Linux" and replace it to "Baksa Gimm"');
console.log(jsonCrawler(distro, "Linux", {
    filter: 'sub',
    replace: 'Mint'
}));

console.log(JSON.stringify(distro, null, 2));