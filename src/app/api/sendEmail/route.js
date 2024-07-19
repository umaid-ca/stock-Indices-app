import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  if (req.method === 'POST') {
    try {
      const { email, aboveThreshold, belowThreshold } = await req.json();

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Threshold Notification" <${process.env.EMAIL_USER}>`, 
        to: email, 
        subject: 'Your Threshold Data',
        text: `Your aboveThreshold value is ${aboveThreshold} and belowThreshold value is ${belowThreshold}.`, 
        html: `<p>Your <b>aboveThreshold</b> value is ${aboveThreshold} and <b>belowThreshold</b> value is ${belowThreshold}.</p>`, 
      };

      await transporter.sendMail(mailOptions);

      return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);

      return NextResponse.json({ error: 'Error sending email' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
}