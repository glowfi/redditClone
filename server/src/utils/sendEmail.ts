import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
    // let testAccount = await nodemailer.createTestAccount();
    // console.log(testAccount);

    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'jeml3lpqb35tla47@ethereal.email',
            pass: 'TEEPSuE3j34BeQB2Ep'
        }
    });

    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>',
        to: to,
        subject: 'Hello ✔',
        html: html
    });

    console.log('Message sent: %s', info.messageId);

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
