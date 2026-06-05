// build-css.js
const sass = require('sass');
const fs = require('fs');


try {
    const result = sass.compile("style.scss", {
        style: "compressed" 
    });


    fs.writeFileSync("style.css", result.css);
    
    console.log("Succès : style.css a été généré !");
} catch (err) {
    console.error("Aïe, erreur de compilation :", err.message);
}

//demande user name puis ca genere une qr code et mdp puis ca me rederige sur une autre page ou le qr code vais etre generer genere qr code pour 2FA 