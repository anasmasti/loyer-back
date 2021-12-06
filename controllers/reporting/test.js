// const htmlPdf = require('html-pdf');
// const fs = require('fs');
var fs = require('fs');
var pdf = require('html-pdf');
var html = fs.readFileSync('./templates/reporting/test.html', 'utf8');
var options = { format: 'Letter' };

function generatePdf(){

    pdf.create(html, options).toFile('../../testreporting.pdf', function(err, res) {
        if (err) return console.log(err);
        console.log(res); // { filename: '/app/businesscard.pdf' }
      });

    // try {
    //     let HtmlFilePath = `${filePath}`;

    //     if(!fs.existsSync(HtmlFilePath)){
    //         console.log('File Doesmt Exists');
    //     }

    //     typeOfFile === "PNG"? toBeGenFileName += ".png": toBeGenFileName += ".pdf"

    //     const HtmlContent = fs.readFileSync(HtmlFilePath, 'utf-8')
    //     const HtmlToPdfOptions = {
    //         "type": typeOfFile,
    //         "height": "650px",
    //         "width": "850px",
    //         "renderDelay": 2000,
    //     } 

    //     htmlPdf.create(HtmlContent, HtmlToPdfOptions)
    //     .toFile(toBeGenFileName, function(error, result) {
    //         if (error) {console.log(error)};
    //         download(result)
    //     });
    // } catch (error) {
    //     console.log('error while converting html to pdf', error);
    // }
}





generatePdf('PDF', '../../templates/reporting/test.html', 'test.html', 'testPdf')



