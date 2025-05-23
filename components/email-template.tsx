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

export interface ReferralEmailProps {
  patientName: string;
  referringDoctorName: string;
  referredDoctorName: string;
  referredDepartment: string;
  referralType: string;
  urgency: string;
  reasonForReferral: string;
  referralNumber: string;
  appointmentInstructions?: string;
}

export interface DoctorWelcomeEmailProps {
  doctorName: string;
  doctorEmail: string;
  password: string;
  adminName: string;
  specialization: string;
  department: string;
  licenseNumber: string;
  workSchedule: Array<{
    day: string;
    start_time?: string;
    close_time?: string;
  }>;
}

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

export const ReferralEmail: React.FC<ReferralEmailProps> = ({
  patientName,
  referringDoctorName,
  referredDoctorName,
  referredDepartment,
  referralType,
  urgency,
  reasonForReferral,
  referralNumber,
  appointmentInstructions,
}) => {
  return (
    <Html>
      <Head />
      <Preview>You have been referred to a specialist</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.header}>Medical Referral Notification</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Dear {patientName},</Text>
            <Text style={styles.text}>
              Dr. {referringDoctorName} has referred you to a specialist for further evaluation and care.
            </Text>
            
            <Section style={styles.detailsSection}>
              <Text style={styles.detailsHeading}>Referral Details:</Text>
              <Text style={styles.detailsText}>• <strong>Referral Number:</strong> {referralNumber}</Text>
              <Text style={styles.detailsText}>• <strong>Referred to:</strong> Dr. {referredDoctorName}</Text>
              <Text style={styles.detailsText}>• <strong>Department:</strong> {referredDepartment}</Text>
              <Text style={styles.detailsText}>• <strong>Referral Type:</strong> {referralType}</Text>
              <Text style={styles.detailsText}>• <strong>Urgency Level:</strong> {urgency}</Text>
              <Text style={styles.detailsText}>• <strong>Reason:</strong> {reasonForReferral}</Text>
            </Section>
            
            <Text style={styles.text}>
              {appointmentInstructions || 
                "Please contact the specialist's office to schedule your appointment. They will be expecting your call and have received your referral information."
              }
            </Text>
            
            <Text style={styles.text}>
              <strong>Important:</strong> Please bring this referral number ({referralNumber}) when you visit the specialist, along with your insurance card and any relevant medical records.
            </Text>
            
            <Button style={styles.button} href="https://medix-final.vercel.app/">
              Schedule Your Appointment
            </Button>
            
            <Text style={styles.text}>
            If you have any questions about this referral, please contact Dr. {referringDoctorName}&apos;s office.
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

export const DoctorWelcomeEmail: React.FC<DoctorWelcomeEmailProps> = ({
  doctorName,
  doctorEmail,
  password,
  adminName,
  specialization,
  department,
  licenseNumber,
  workSchedule,
}) => {
  const formatWorkSchedule = () => {
    return workSchedule.map(schedule => {
      const timeRange = schedule.start_time && schedule.close_time 
        ? `${schedule.start_time} - ${schedule.close_time}`
        : 'Full Day';
      return `${schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)}: ${timeRange}`;
    }).join('\n');
  };

  return (
    <Html>
      <Head />
      <Preview>Welcome to MEDIX IHMS - Your account has been created</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={{...styles.header, color: '#059669'}}>Welcome to MEDIX IHMS</Heading>
          <Section style={styles.section}>
            <Text style={styles.text}>Dear Dr. {doctorName},</Text>
            <Text style={styles.text}>
              Welcome to the MEDIX Integrated Hospital Management System! Your account has been successfully created by <strong>{adminName}</strong>.
            </Text>
            
            <Section style={styles.detailsSection}>
              <Text style={styles.detailsHeading}>Your Account Details:</Text>
              <Text style={styles.detailsText}>• <strong>Email:</strong> {doctorEmail}</Text>
              <Text style={styles.detailsText}>• <strong>Password:</strong> {password}</Text>
              <Text style={styles.detailsText}>• <strong>Specialization:</strong> {specialization}</Text>
              <Text style={styles.detailsText}>• <strong>Department:</strong> {department}</Text>
              <Text style={styles.detailsText}>• <strong>License Number:</strong> {licenseNumber}</Text>
            </Section>

            {workSchedule.length > 0 && (
              <Section style={styles.detailsSection}>
                <Text style={styles.detailsHeading}>Your Work Schedule:</Text>
                <Text style={{...styles.detailsText, whiteSpace: 'pre-line', fontFamily: 'monospace'}}>
                  {formatWorkSchedule()}
                </Text>
              </Section>
            )}
            
            <Text style={styles.text}>
              <strong>Important Security Notice:</strong> For your security, please change your password after your first login. You can do this by accessing your profile settings.
            </Text>
            
            <Button style={{...styles.button, backgroundColor: '#059669'}} href="https://medix-final.vercel.app/">
              Access MEDIX System
            </Button>
            
            <Text style={styles.text}>
              <strong>Getting Started:</strong>
            </Text>
            <Text style={styles.text}>
              1. Click the button above to access the system<br />
              2. Log in using your credentials<br />
              3. Complete your profile information<br />
              4. Change your default password<br />
              5. Familiarize yourself with the dashboard
            </Text>
            
            <Text style={styles.text}>
            If you have any questions or need assistance getting started, please don&apos;t hesitate to contact the system administrator or IT support team.
            </Text>
            
            <Text style={styles.text}>
              Best regards,<br />
              The MEDIX IHMS Team<br />
              Administrator: {adminName}
            </Text>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            © {new Date().getFullYear()} MEDIX IHMS. All rights reserved.<br />
            This is an automated message. Please do not reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};