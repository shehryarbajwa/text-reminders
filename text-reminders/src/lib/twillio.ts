import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendReminder = async (phoneNumber: string, todoText: string) => {
  try {
    await twilioClient.messages.create({
      body: `Reminder: Your task "${todoText}" is due. Reply COMPLETED if you've finished it.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  } catch (error) {
    console.error('Error sending Twilio message:', error);
    throw error;
  }
};