const crypto = require('crypto');
const fs = require('fs');
const rl = require('readline-sync');
const os = require('os');

console.log("Program Başlatılıyor...");
console.log("Github: github.com/fastuptime");

const algorithm = 'aes-256-cbc';
const path = rl.question('Dosyalarin bulundugu klasorun yolu: ');
const doEncrypt = rl.keyInYN('Sifrelemek istiyor musunuz? Y = Evet, N = Hayir: ');

function encryptFolder(folderPath, key, iv) {
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    if (fs.lstatSync(`${folderPath}/${file}`).isDirectory()) {
      encryptFolder(`${folderPath}/${file}`, key, iv);
      continue;
    } else {
        const filePath = `${folderPath}/${file}`;
        try {
            const data = fs.readFileSync(filePath);

            const cipher = crypto.createCipheriv(algorithm, key, iv);
            let encrypted = cipher.update(data);
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            fs.writeFileSync(filePath, encrypted);
            console.log(`Şifrelenen dosya: ${filePath}`);
        } catch (e) {
            console.log(`Şifrelenemedi: ${filePath}`);
        }
    }
  }
}

function decryptFolder(folderPath, key, iv) {
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    if (fs.lstatSync(`${folderPath}/${file}`).isDirectory()) {
      decryptFolder(`${folderPath}/${file}`, key, iv);
      continue;
    } else {
        const filePath = `${folderPath}/${file}`;
        try {
            const data = fs.readFileSync(filePath);

            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(data);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            fs.writeFileSync(filePath, decrypted);
            console.log(`Şifresi çözülen dosya: ${filePath}`);
        } catch (e) {
            console.log(`Şifresi çözülemedi: ${filePath}`);
        }
    }
  }
}


if (doEncrypt === true) {
  let key = crypto.randomBytes(32);
  let iv = crypto.randomBytes(16);
  console.log('Key:', key.toString('hex'));
  console.log('IV:', iv.toString('hex'));
  console.log('Bu verileri saklayin. Kaybolursa dosyalarinizi geri alamayacaksiniz.');
  let d = {
    key: key.toString('hex'),
    iv: iv.toString('hex'),
    pc: os.hostname()
  }
 fs.writeFileSync('key.txt', JSON.stringify(d));
  encryptFolder(path, key, iv);
} else {
    if (!fs.existsSync('key.txt')) {
        console.log('key.txt dosyasi bulunamadi. Daha hızlı işlem yapmak için key.txt dosyaniz var ise dosyanizin bulundugu dizine koyunuz.');
        let key = rl.question('Key: ');
        let iv = rl.question('IV: ');
        key = Buffer.from(key, 'hex');
        iv = Buffer.from(iv, 'hex');
        decryptFolder(path, key, iv);
    } else {
        fs.readFile('key.txt', (err, data) => {
            if (err) throw err;
            let d = JSON.parse(data);
            let key = Buffer.from(d.key, 'hex');
            let iv = Buffer.from(d.iv, 'hex');
            decryptFolder(path, key, iv);
        });
    }
}