import app from './app';
import mongoose from 'mongoose';
import mailer from './services/mail.service';

mongoose
    .connect(process.env.MONGO_URL!)
    .then(() => {
        console.log('Connected to Database!');

        mailer.init();
        console.log('Initialized Nodemailer!');
        app.listen(process.env.PORT, () =>
            console.log('Started server on port', process.env.PORT)
        );
    })
    .catch((err) => console.error('Error connecting to database!', err));
