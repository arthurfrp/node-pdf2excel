const fs = require('fs'),
PDFParser = require("pdf2json");
const xl = require('excel4node');
const wb = new xl.Workbook();
const ws = wb.addWorksheet('Fatura FACS');

// Available foders at current directory

const folders = [
    "folder1",
    "folder2",
    "folder3",
];

// preparing data destiny
let pdfList = [];

// preparing erro handler
let logErro = []

// function to extract pdf information and save at excel file
async function extract () {

    const j = folders.length;
    // loading folders 
    console.log(`There are ${j} folders to be analysed`)
    
    // loop into folders
    for(let i = 0; i < j; i++) {
        const files = fs.readdirSync(folders[i]);    
    // loop into files
        await Promise.all(files.map(async (file) => {
            
            // console.log(`Abrindo pasta ${file} em ${folders[i]}`)
            // set up pdf parser
            let pdfParser = new PDFParser(this, 1);
    
            // load pdf document
            pdfParser.loadPDF(`${folders[i]}/${file}`);
    
            // parse folder
            let pdfFile = await new Promise(async (resolve, reject) => {
                // on data ready
                pdfParser.on("pdfParser_dataReady", (pdfData) => {
                    // the raw data in text format
                    const raw = pdfParser.getRawTextContent().replace(/\r\n/g," ");
                    // console.log(raw)
                    // return parse data
                    
                    if(/N° medidor -(.*?)Ciclo -/i.exec(raw)){
                        
                        resolve({
                        arquivo:`Pasta: ${folders[i]}, arquivo: ${file}`,
                        data:/regex syntax/i.exec(raw)[1].trim(),
                        })

                        console.log(`sucesso extração ${file} em ${folders[i]}`)

                    } else ( resolve({
                        dados: `erro na extração de ${file} em ${folders[i]}`
                    }),
                    // console.log(`erro no arquivo ${file} da pasta ${folders[i]}`),
                    logErro.push(`Na pasta ${folders[i]} aquivo com nome: ${file}`)
                    )
                    
                })
            })
            pdfList.push(pdfFile)
        }))
        // fs.writeFileSync('pdfFile.json', JSON.stringify(pdfList))
        // console.table(pdfList)
    }
        
        const headingColumnNames = [
            "Arquivo",
            "data",
        ]
        let headingColumnIndex = 1;
        let rowIndex = 2;
        
        //Write Column Title in Excel file
        headingColumnNames.forEach(heading => {
            ws.cell(1, headingColumnIndex++)
                .string(heading)
        });
        
        pdfList.push(logErro)

        //Write Data in Excel file
        pdfList.forEach( record => {
            let columnIndex = 1;
            Object.keys(record ).forEach(columnName =>{
                ws.cell(rowIndex,columnIndex++)
                    .string(record [columnName])
            });
            rowIndex++;
        }); 
        wb.write('excelFatura.xlsx');
        fs.writeFile("log erro leitura.json",JSON.stringify(logErro),function(err,logErro){
            return JSON.stringify(logErro)
        });
        console.log('Excel file sucessfully created!')
        console.log(`são ${logErro.length} erros de leitura de pdf`)

}

extract()


// TESTING OTHER LIBERIES AND FRAMEWORKS:
// ==========================================================================
// const files = "./file.pdf"

// const pdf2excel = require('pdf-to-excel');

// try {
//   const options = {
//     // when current pdf page number changes call this function(optional)
//     onProcess: (e) => console.warn(`${e.numPage} / ${e.numPages}`),
//     // pdf start page number you want to convert (optional, default 1)
//     start: 1,
//     // pdf end page number you want to convert (optional, default )
//     end: 1,
//   }

//   pdf2excel.genXlsx(files, 'file.xlsx', options);
// } catch (err) {
//   console.error(err);
// }


// let pdfParser = new PDFParser(this,1);

// pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
// pdfParser.on("pdfParser_dataReady", logErro => {
//     fs.writeFile("faturas.json",JSON.stringify(logErro),function(err,logErro){
//         return JSON.stringify(logErro)
//     });
//     JSON.stringify(logErro);
// });

// pdfParser.loadPDF("./file.pdf");


// // const file = []
// pdfParser = new PDFParser();
// pdfParser.loadPDF(files);
// pdfParser.on("pdfParser_dataReady", (logErro) => {
//     const raw = pdfParser.getRawTextContent()
//     console.log("done", raw)
// })
    
//     (async () => {
//         //     await Promise.all(files.map(async (file) => {
//     const faturas = await new Promise(async (resolve, reject) => {
//             })
// //     }))
// })();

// TESTING OTHER FRAMEWORK LIBRERY
// ===================================================
// 'use strict';

// const path = require('path');
// const fs = require('fs').promises;

// const libre = require('libreoffice-convert');
// libre.convertAsync = require('util').promisify(libre.convert);

// async function main() {
//     const ext = '.json'
//     const inputPath = path.join(__dirname, '/24171.pdf');
//     const outputPath = path.join(__dirname, `/fatura${ext}`);

//     // Read file
//     const docxBuf = await fs.readFile(inputPath);

//     // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
//     let pdfBuf = await libre.convertAsync(docxBuf, ext);
    
//     // Here in done you have pdf file which you can save or transfer in another stream
//     await fs.writeFile(outputPath, pdfBuf);
// }

// main().catch(function (err) {
//     console.log(`Error converting file: ${err}`);
// });

