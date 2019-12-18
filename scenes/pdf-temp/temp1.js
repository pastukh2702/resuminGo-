const PDFDocument = require('pdfkit');
var fs = require('fs');

var Temp1 = {
    create: function (data, ctx, imageLoad) {
        var doc = new PDFDocument();

        let icons = {
            phone: 'scenes/pdf-temp/icons/phone.jpg',
            email: 'scenes/pdf-temp/icons/email.jpg',
            telegram: 'scenes/pdf-temp/icons/telegram.jpg',
            linkedin: 'scenes/pdf-temp/icons/linkedin.jpg',
            star: 'scenes/pdf-temp/icons/star.jpg',
            deviantart: 'scenes/pdf-temp/icons/deviantart.jpg'
        }


        doc.pipe(fs.createWriteStream(`${ctx.from.id}.pdf`));

        let prev = 0;
        let lastPrev = 0
        let lineStart = 33;
        
        //WRAP MODULE
        let chPrev = (s, l) => {
            lastPrev = l;
            prev += s;
            return prev
        }
        
        //TEXT MODULE
        let textG = (text, size, y, x, width, weight) => {
            return doc.font(`scenes/pdf-temp/fonts/Montserrat-${weight}.ttf`).fontSize(size).text(text, y, x, {
                lineBreak: false,
                width: width,
            });
            
        }
        
        //LEFT LINE
        doc.lineCap('butt')
            .moveTo(lineStart, chPrev(15, 15))
            .lineTo(579, prev)
            .stroke();
        
        //PHOTO BOX
        
        if(imageLoad){
            doc.image(`${ctx.update.message.from.id}.jpg`, lineStart, chPrev(lastPrev, 150), {fit: [150, 150], align: 'center', valign: 'center'})
        }else{
            doc.image(`scenes/pdf-temp/icons/head.jpg`, lineStart, chPrev(lastPrev, 150), {fit: [150, 150], align: 'center', valign: 'center'})
        }

        
        
        //CONTACTS
        if(data.contacts.length){
            //CONTACT LABEL
            textG('CONTACTS', 13, lineStart, chPrev(lastPrev, 40)+20, 120, 'Medium')
            doc.lineCap('butt')
                .moveTo(lineStart, chPrev(lastPrev, 15))
                .lineTo(183, prev)
                .stroke();

            data.contacts.forEach((con) => {
        
                doc.image(icons[con.type], lineStart, chPrev(lastPrev, 0), {fit: [22, 22], align: 'center', valign:
                    'center'})

                if(con.value.length > 22 && con.value.length < 35){
            
                    textG(con.caption, 12, lineStart+30, chPrev(lastPrev, 15), 120, 'Medium')
                    textG(con.value, 10, lineStart+30, chPrev(lastPrev, 30), 120, 'Regular')
                    
                }else if(con.value.length > 34){
            
                    textG(con.caption, 12, lineStart+30, chPrev(lastPrev, 15), 120, 'Medium')
                    textG(con.value, 10, lineStart+30, chPrev(lastPrev, 40), 120, 'Regular')
                    
                }else{
            
                    textG(con.caption, 12, lineStart+30, chPrev(lastPrev, 15), 120, 'Medium')
                    textG(con.value, 10, lineStart+30, chPrev(lastPrev, 20), 120, 'Regular')
            
                }
                
            })
        }
        
        
        
        
        //PROSKILLS
        if(data.proskills.length){
            //PROSKILLS LABEL
            textG('PROSKILLS', 13, lineStart, chPrev(lastPrev-10, 40)+20,120 ,'Medium')
            doc.lineCap('butt')
                .moveTo(lineStart, chPrev(lastPrev, 15))
                .lineTo(183, prev)
                .stroke();

            data.proskills.forEach((pro) => {

                doc.image(icons.star, lineStart, chPrev(lastPrev, 0), {fit: [10, 10], align: 'center', valign:
                    'center'})
                 
                if(pro.length > 14 && pro.length < 30){
            
                    textG(pro, 12, lineStart+20, chPrev(lastPrev, 35)-3, 120,'Medium')
                    
                }else if(pro.length > 29){
            
                    textG(pro, 12, lineStart+20, chPrev(lastPrev, 45)-3, 120,'Medium')     
                    
                }else{
            
                    textG(pro, 12, lineStart+20, chPrev(lastPrev, 20)-3, 120,'Medium')
            
                } 
            })
        }
        
        
        
        
        //LANGUAGES
        if(data.languages.length){

            //LANGUAGES LABEL
            textG('LANGUAGES', 13, lineStart, chPrev(lastPrev-10, 40)+20, 100, 'Medium')
            doc.lineCap('butt')
                .moveTo(lineStart, chPrev(lastPrev, 15))
                .lineTo(183, prev)
                .stroke();

            data.languages.forEach((lang) => {
                
                doc.image(icons.deviantart, lineStart, chPrev(lastPrev, 0), {fit: [10, 10], align: 'center', valign:
                    'center'})
                 
                if (lang.length > 14 && lang.length < 30){
                    
                    textG(lang, 12, lineStart+20, chPrev(lastPrev, 35)-3, 120, 'Medium')
            
                } else if (lang.length > 29){
            
                    textG(lang, 12, lineStart+20, chPrev(lastPrev, 45)-3, 120, 'Medium')         
                    
                } else {
            
                    textG(lang, 12, lineStart+20, chPrev(lastPrev, 20)-3, 120, 'Medium')       
            
                }
            })
        }
        
        
        //BOTTOM LINE
        doc.lineCap('butt')
            .moveTo(lineStart, 777)
            .lineTo(579, 777)
            .stroke();
        
        //CENTER LINE
        doc.lineCap('butt')
            .moveTo(200, 762)
            .lineTo(200, 30)
            .stroke();
        
        //CLEAN VARIABLES
        lastPrev = 30;
        lineStart_2 = 215
        prev = 0;
        
        //NAME
        textG(data.firstName, 25, lineStart_2, chPrev(lastPrev, 30), 360, 'Medium')
        textG(data.lastName, 25, lineStart_2, chPrev(lastPrev, 35), 360 ,'Medium')
        //WORKNAME
        textG(data.workName, 13, lineStart_2, chPrev(lastPrev, 25), 360, 'Regular')
        //ABOUT
        if(data.about !== null){
            if(data.about.length > 420){
                textG(data.about, 10, lineStart_2, chPrev(lastPrev, 100), 360, 'Regular')
            } else {
                textG(data.about, 10, lineStart_2, chPrev(lastPrev, 70), 360, 'Regular')
            }
        }


        //EDUCATION
        if(data.education.length){

            //EDUCATION LABEL
            textG('EDUCATION', 13, lineStart_2, chPrev(lastPrev-10, 40)+20, 120, 'Medium')
            doc.lineCap('butt')
                .moveTo(lineStart_2, chPrev(lastPrev, 15))
                .lineTo(579, prev)
                .stroke();
            
            data.education.forEach((ed) => {
                
                textG(ed.timeFrom + '-' + ed.timeTo, 12, lineStart_2, chPrev(lastPrev, 20), 120, 'Medium')
                textG(ed.city + ', ' + ed.country, 10, lineStart_2, chPrev(lastPrev, 35), 120 , 'Regular')
                
                if(ed.workName.length > 31){
            
                    textG(ed.workName, 13, lineStart_2+150, chPrev(lastPrev, 14)-55, 220 , 'Medium')
            
                    doc.circle(lineStart_2+100, chPrev(lastPrev, 0)-50, 4)
                        .fillOpacity(1)
                        .fillAndStroke("black")
                
                    doc.lineCap('butt')
                        .moveTo(lineStart_2+100, chPrev(lastPrev, 0)-80)
                        .lineTo(lineStart_2+100, chPrev(lastPrev, 0)-10)
                        .stroke();
                
                } else {
            
                    textG(ed.workName, 13, lineStart_2+150, chPrev(lastPrev, 0)-55, 220, 'Medium')
                
                    doc.circle(lineStart_2+100, chPrev(lastPrev, 0)-40, 4)
                        .fillOpacity(1)
                        .fillAndStroke("black")
                
                    doc.lineCap('butt')
                        .moveTo(lineStart_2+100, chPrev(lastPrev, 0)-70)
                        .lineTo(lineStart_2+100, chPrev(lastPrev, 0)-15)
                        .stroke();
                
                }
                
                if(ed.univerName.length > 29){
            
                    textG(ed.univerName, 12, lineStart_2+150, chPrev(lastPrev, 0)-35, 220, 'Regular')
            
                } else {
            
                    textG(ed.univerName, 12, lineStart_2+150, chPrev(lastPrev, -10)-35, 220, 'Regular')
            
                } 
            })
        }
       
        
        if(data.experience.length){
            //EXPERIENCE LABEL
            textG('EXPERIENCE', 13, lineStart_2, chPrev(lastPrev-10, 40)+20, 100, 'Medium')
            doc.lineCap('butt')
                .moveTo(lineStart_2, chPrev(lastPrev, 15))
                .lineTo(579, prev)
                .stroke();

            //EXPERIENCE
            data.experience.forEach((exp) => {
                
                textG(exp.timeFrom + '-' + exp.timeTo, 12, lineStart_2, chPrev(lastPrev, 20), 120, 'Medium')
                textG(exp.city + ', ' + exp.country, 10, lineStart_2, chPrev(lastPrev, 35), 120, 'Regular')
                
                if(exp.workName.length > 32){

                    textG(exp.workName, 13, lineStart_2+150, chPrev(lastPrev, 14)-55, 220, 'Medium')

                    doc.circle(lineStart_2+100, chPrev(lastPrev, 0)-50, 4)
                        .fillOpacity(1)
                        .fillAndStroke("black")
                
                    doc.lineCap('butt')
                        .moveTo(lineStart_2+100, chPrev(lastPrev, 0)-70)
                        .lineTo(lineStart_2+100, chPrev(lastPrev, 0)-15)
                        .stroke();
                
                } else {

                    textG(exp.workName, 13, lineStart_2+150, chPrev(lastPrev, 0)-55, 220, 'Medium')
                
                    doc.circle(lineStart_2+100, chPrev(lastPrev, 0)-40, 4)
                        .fillOpacity(1)
                        .fillAndStroke("black")
                
                    doc.lineCap('butt')
                        .moveTo(lineStart_2+100, chPrev(lastPrev, 0)-70)
                        .lineTo(lineStart_2+100, chPrev(lastPrev, 0)-15)
                        .stroke();
                
                }
                
                if(exp.companyName.length > 29){

                    textG(exp.companyName, 12, lineStart_2+150, chPrev(lastPrev, 0)-35, 220, 'Regular')

                }else{

                    textG(exp.companyName, 12, lineStart_2+150, chPrev(lastPrev, -10)-35, 220, 'Regular')

                }
            })
        }

         //ACHIEVEMENTS
         if(data.achievements.length){

            //ACHIEVEMENTS LABEL
            
            textG('ACHIEVEMENTS', 13, lineStart_2, chPrev(lastPrev-10, 40)+20, 200, 'Medium')
            doc.lineCap('butt')
                .moveTo(lineStart_2, chPrev(lastPrev, 15))
                .lineTo(579, prev)
                .stroke();

            data.achievements.forEach((achv) => {

                doc.circle(lineStart_2+2, chPrev(lastPrev+10, 0), 3)
                    .fillOpacity(1)
                    .fillAndStroke("black")

                    textG(achv.name, 12, lineStart_2+20, chPrev(lastPrev-7, 25)-3, 220, 'Medium')
                    textG(achv.about, 10, lineStart_2+20, chPrev(lastPrev-7, 20)-3, 220, 'Regular')      
            
                
            })
        }
        

        doc.end();
         
    //END CREATE
    }
}

module.exports = Temp1;



