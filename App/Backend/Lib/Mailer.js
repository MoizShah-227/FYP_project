import nodemailer from "nodemailer";
import fs from "fs";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendAnnouncementEmail = async (to, message, imagePath = null) => {

  let htmlTemplate = fs.readFileSync("templates/announcement.html", "utf-8");

  htmlTemplate = htmlTemplate
    .replace("{{ANNOUNCEMENT_TEXT}}", message)
    .replace("{{YEAR}}", new Date().getFullYear())
    .replace(
      "{{IMAGE_SECTION}}",
      imagePath
        ? `<div style="margin-top:20px; text-align:center;">
             <img src="cid:announcementImage" style="max-width:100%; border-radius:8px;" />
           </div>`
        : ""
    );

  const mailOptions = {
    from: `"Faculty Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Faculty Announcement",
    html: htmlTemplate,
    attachments: imagePath
      ? [
          {
            filename: "announcement.png",
            path: imagePath,
            cid: "announcementImage"
          }
        ]
      : []
  };




  await transporter.sendMail(mailOptions);
};


export const sendMessageEmail = async (to ,message) => {
  let htmlTemplate = fs.readFileSync("templates/message.html", "utf-8");

  htmlTemplate = htmlTemplate
    .replace("{{MESSAGE_TEXT}}", `Your teacher sent you a message on Wishora App: "${message}"`)
    .replace("{{YEAR}}", new Date().getFullYear());

  const mailOptions = {
    from: `"Wishora App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "New Message from Your Teacher",
    html: htmlTemplate
  };
  
  await transporter.sendMail(mailOptions);
  return mailOptions;
};