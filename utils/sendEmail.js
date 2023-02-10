import { createTransport } from 'nodemailer';


export const sendEmail = async (to,subject,text)=>{
    const transport = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

    await transport.sendMail({
        to,subject,text
    })
}