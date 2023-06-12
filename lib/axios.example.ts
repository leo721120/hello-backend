import axios from '@io/lib/axios'
import fs from 'node:fs'
import '@io/lib/node'
//
Promise.try(async function() {
    const fetch = axios();
    const image = fs.createReadStream(`${__dirname}/example.01.jpg`);
    const res = await fetch.postForm('http://172.22.24.111:8012/api/predict/QRmPG9kJ', {
        image,
    });

    console.log(res.data);
}).catch(console.error);