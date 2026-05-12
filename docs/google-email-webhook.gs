function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var expectedSecret = PropertiesService.getScriptProperties().getProperty('EMAIL_WEBHOOK_SECRET');
    if (expectedSecret && data.secret !== expectedSecret) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Unauthorized email webhook request.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    MailApp.sendEmail({
      to: data.toEmail,
      subject: data.subject,
      htmlBody: data.message,
      name: data.fromName || 'Nintro'
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
