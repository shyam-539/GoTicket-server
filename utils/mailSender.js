import nodemailer from "nodemailer";

const sendEmail = async (to, subject, message, htmlContent = null) => {
  try {
    // Ensure environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables.");
      return false;
    }

    // Creating a transporter using Gmail's SMTP service
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
      ...(htmlContent && { html: htmlContent }), // Adds HTML email support
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return false;
  }
};

export default sendEmail;
