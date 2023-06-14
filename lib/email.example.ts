import email from 'nodemailer'
import '@io/lib/node'
//
Promise.try(async function () {
    const smtp = email.createTransport({
        service: 'gmail',
        //pool: true,
        auth: {// https://nodemailer.com/usage/using-gmail/
            user: 'user-to-login',
            pass: 'password',
        },
    });
    await smtp.sendMail({
        from: '<replaced-by-gmail>',
        to: 'user@gmail.com',
        subject: '[Test]',
        text: 'Hello world',
        html: '<b>Hello world</b>',
    });
}).catch(console.error);