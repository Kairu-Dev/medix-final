// components/email-template.tsx
import React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
  Button,

} from '@react-email/components';

export interface AppointmentEmailProps {
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: string;
  reason?: string;
}

// Template for when an appointment is scheduled
export const ScheduledAppointmentEmail: React.FC<AppointmentEmailProps> = ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  reason,
}) => {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Your appointment has been scheduled</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.header}>Appointment Confirmation</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Dear {patientName},</Text>
            <Text style={styles.text}>
              We&apos;re pleased to inform you that your appointment has been <strong>scheduled</strong> with Dr. {doctorName}.
            </Text>
            
            <Section style={styles.detailsSection}>
              <Text style={styles.detailsHeading}>Appointment Details:</Text>
              <Text style={styles.detailsText}>• <strong>Date:</strong> {formattedDate}</Text>
              <Text style={styles.detailsText}>• <strong>Time:</strong> {appointmentTime}</Text>
              <Text style={styles.detailsText}>• <strong>Type:</strong> {appointmentType}</Text>
              {reason && <Text style={styles.detailsText}>• <strong>Notes:</strong> {reason}</Text>}
            </Section>
            
            <Text style={styles.text}>
              Please arrive 15 minutes before your scheduled appointment time. If you need to reschedule or cancel, please contact us at least 24 hours in advance.
            </Text>
            
            <Button style={styles.button} href="https://medix-final.vercel.app/">
              View Your Appointments
            </Button>
            
            <Text style={styles.text}>
              If you have any questions, please don&apos;t hesitate to contact us.
            </Text>
            
            <Text style={styles.text}>
              Best regards,<br />
              The Medical Team
            </Text>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            © {new Date().getFullYear()} MEDIX IHMS. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Template for when an appointment is cancelled
export const CancelledAppointmentEmail: React.FC<AppointmentEmailProps> = ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  reason,
}) => {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Your appointment has been cancelled</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={{...styles.header, color: '#b91c1c'}}>Appointment Cancellation</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Dear {patientName},</Text>
            <Text style={styles.text}>
              We regret to inform you that your appointment with Dr. {doctorName} has been <strong>cancelled</strong>.
            </Text>
            
            <Section style={styles.detailsSection}>
              <Text style={styles.detailsHeading}>Appointment Details:</Text>
              <Text style={styles.detailsText}>• <strong>Date:</strong> {formattedDate}</Text>
              <Text style={styles.detailsText}>• <strong>Time:</strong> {appointmentTime}</Text>
              <Text style={styles.detailsText}>• <strong>Type:</strong> {appointmentType}</Text>
              {reason && (
                <Text style={styles.detailsText}>
                  • <strong>Reason for cancellation:</strong> {reason}
                </Text>
              )}
            </Section>
            
            <Text style={styles.text}>
              We apologize for any inconvenience this may cause. Please click the button below to reschedule your appointment at a more convenient time.
            </Text>
            
            <Button style={{...styles.button, backgroundColor: '#b91c1c'}} href="https://medix-final.vercel.app/">
              Reschedule Appointment
            </Button>
            
            <Text style={styles.text}>
              If you have any questions or need further assistance, please don&apos;t hesitate to contact our office.
            </Text>
            
            <Text style={styles.text}>
              Best regards,<br />
              The Medical Team
            </Text>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            © {new Date().getFullYear()} Your Medical Clinic. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  container: {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
  },
  header: {
    color: '#0e1833',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e0e0e0',
  },
  detailsSection: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '5px',
    margin: '20px 0',
    border: '1px solid #eaeaea',
  },
  detailsHeading: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  detailsText: {
    fontSize: '15px',
    margin: '5px 0',
    lineHeight: '1.5',
  },
  text: {
    color: '#444',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 20px',
    margin: '25px auto',
    width: '220px',
  },
  hr: {
    borderColor: '#e6e6e6',
    margin: '30px 0',
  },
  footer: {
    color: '#8898aa',
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '20px 0',
  },
};