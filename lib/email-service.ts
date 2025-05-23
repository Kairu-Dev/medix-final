import nodemailer from 'nodemailer';
import { CancelledAppointmentEmail, ScheduledAppointmentEmail, AppointmentEmailProps, DoctorWelcomeEmailProps, DoctorWelcomeEmail } from '@/components/email-template';
import { renderAsync } from '@react-email/components';
import React from 'react';
import { ReferralEmail, ReferralEmailProps } from '@/components/email-template';

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail app password, not your regular password
  },
});

export async function sendAppointmentEmail(
  to: string,
  emailType: 'SCHEDULED' | 'CANCELLED',
  appointmentData: AppointmentEmailProps
) {
  try {
    // Create the email component with React.createElement to avoid TypeScript errors
    const emailComponent = emailType === 'SCHEDULED'
      ? React.createElement(ScheduledAppointmentEmail, appointmentData)
      : React.createElement(CancelledAppointmentEmail, appointmentData);

    // Render the React component to HTML
    const html = await renderAsync(emailComponent);

    // Set the subject based on the email type
    const subject = emailType === 'SCHEDULED' 
      ? 'Your Appointment Has Been Scheduled' 
      : 'Your Appointment Has Been Cancelled';

    // Send the email using Nodemailer with to as an array like in Resend
    const info = await transporter.sendMail({
      from: '"Medix - Centro Medico" <' + process.env.GMAIL_USER + '>', // Use the same email from env
      to: [to], // Use array format like in the Resend implementation
      subject,
      html,
      headers: {
    'X-Priority': '1', // High priority
    'Importance': 'high',
    'X-MSMail-Priority': 'High'
  }
    });

    // Enhanced logging to see more details about the email delivery
    console.log('Email sent successfully:');
    console.log('- Message ID:', info.messageId);
    console.log('- Accepted recipients:', info.accepted);
    console.log('- Response:', info.response);

    return { success: true, data: info };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

export async function sendReferralEmail(
  patientEmail: string,
  referralData: ReferralEmailProps
) {
  try {
    // Create the referral email component
    const emailComponent = React.createElement(ReferralEmail, referralData);

    // Render the React component to HTML
    const html = await renderAsync(emailComponent);

    // Send the email using Nodemailer
    const info = await transporter.sendMail({
      from: '"Medix - Centro Medico" <' + process.env.GMAIL_USER + '>',
      to: [patientEmail],
      subject: `Medical Referral - ${referralData.referralNumber}`,
      html,
      headers: {
        'X-Priority': '1', // High priority
        'Importance': 'high',
        'X-MSMail-Priority': 'High'
      }
    });

    console.log('Referral email sent successfully:');
    console.log('- Message ID:', info.messageId);
    console.log('- Accepted recipients:', info.accepted);
    console.log('- Response:', info.response);

    return { success: true, data: info };
  } catch (error) {
    console.error('Referral email service error:', error);
    return { success: false, error };
  }
}

export async function sendDoctorWelcomeEmail(
  to: string,
  doctorData: DoctorWelcomeEmailProps
) {
  try {
    // Create the email component with React.createElement
    const emailComponent = React.createElement(DoctorWelcomeEmail, doctorData);

    // Render the React component to HTML
    const html = await renderAsync(emailComponent);

    // Send the email using Nodemailer
    const info = await transporter.sendMail({
      from: '"MEDIX IHMS - Admin" <' + process.env.GMAIL_USER + '>',
      to: [to],
      subject: 'Welcome to MEDIX IHMS - Your Account Credentials',
      html,
      headers: {
        'X-Priority': '1', // High priority
        'Importance': 'high',
        'X-MSMail-Priority': 'High'
      }
    });

    // Enhanced logging
    console.log('Doctor welcome email sent successfully:');
    console.log('- Message ID:', info.messageId);
    console.log('- Accepted recipients:', info.accepted);
    console.log('- Response:', info.response);

    return { success: true, data: info };
  } catch (error) {
    console.error('Doctor welcome email service error:', error);
    return { success: false, error };
  }
}


{/*// lib/email-service.ts
import { Resend } from 'resend';
import { CancelledAppointmentEmail, ScheduledAppointmentEmail, AppointmentEmailProps } from '@/components/email-template';
import { renderAsync } from '@react-email/components';
import React from 'react';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentEmail(
  to: string,
  emailType: 'SCHEDULED' | 'CANCELLED',
  appointmentData: AppointmentEmailProps
) {
  try {
    // Create the email component with React.createElement to avoid TypeScript errors
    const emailComponent = emailType === 'SCHEDULED'
      ? React.createElement(ScheduledAppointmentEmail, appointmentData)
      : React.createElement(CancelledAppointmentEmail, appointmentData);

    // Render the React component to HTML
    const html = await renderAsync(emailComponent);

    // Set the subject based on the email type
    const subject = emailType === 'SCHEDULED' 
      ? 'Your Appointment Has Been Scheduled' 
      : 'Your Appointment Has Been Cancelled';

    const { data, error } = await resend.emails.send({
      from: 'Medix - Centro Medico <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}
  */}