function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Convert rows to JSON
  var keys = data[0];
  var result = [];
  
  for(var i = 1; i < data.length; i++){
    var obj = {};
    for(var j = 0; j < keys.length; j++){
      obj[keys[j]] = data[i][j];
    }
    result.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    var data = JSON.parse(e.postData.contents);
    // Append the new row matching headers: [Date, Context, Source, Verdict, Confidence]
    sheet.appendRow([
      data.date,
      data.context,
      data.source,
      data.verdict,
      data.confidence
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// SETUP INSTRUCTIONS:
// 1. In your Google Sheet with the 100 articles, make sure Row 1 has headers exactly like this:
//    content | source | verdict
//    (If your sheet has different headers, adjust them so we can map them correctly)
// 2. Go to Extensions > Apps Script
// 3. Paste this code.
// 4. Click Deploy > New Deployment
// 5. Select type "Web app"
// 6. Execute as "Me", Who has access: "Anyone"
// 7. Click Deploy, authorize permissions, and copy the Web App URL!
