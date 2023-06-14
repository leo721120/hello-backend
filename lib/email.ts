import type { Options } from 'nodemailer/lib/smtp-transport'
import email from 'nodemailer'
export default {
    smtp(options: Options & {
    }) {
        return email.createTransport({
            ...options,
        });
    }
};