const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/learningData.json');
const content = fs.readFileSync(filePath, 'utf8');

function decodeCP1252ToUTF8(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code < 0x80) {
            bytes.push(code);
        } else if (code >= 0xA0 && code <= 0xFF) {
            bytes.push(code);
        } else {
            switch (code) {
                case 0x20AC: bytes.push(0x80); break;
                case 0x201A: bytes.push(0x82); break;
                case 0x0192: bytes.push(0x83); break;
                case 0x201E: bytes.push(0x84); break;
                case 0x2026: bytes.push(0x85); break;
                case 0x2020: bytes.push(0x86); break;
                case 0x2021: bytes.push(0x87); break;
                case 0x02C6: bytes.push(0x88); break;
                case 0x2030: bytes.push(0x89); break;
                case 0x0160: bytes.push(0x8A); break;
                case 0x2039: bytes.push(0x8B); break;
                case 0x0152: bytes.push(0x8C); break;
                case 0x017D: bytes.push(0x8E); break;
                case 0x2018: bytes.push(0x91); break;
                case 0x2019: bytes.push(0x92); break;
                case 0x201C: bytes.push(0x93); break;
                case 0x201D: bytes.push(0x94); break;
                case 0x2022: bytes.push(0x95); break;
                case 0x2013: bytes.push(0x96); break;
                case 0x2014: bytes.push(0x97); break;
                case 0x02DC: bytes.push(0x98); break;
                case 0x2122: bytes.push(0x99); break;
                case 0x0161: bytes.push(0x9A); break;
                case 0x203A: bytes.push(0x9B); break;
                case 0x0153: bytes.push(0x9C); break;
                case 0x017E: bytes.push(0x9E); break;
                case 0x0178: bytes.push(0x9F); break;
                default:
                    if (code <= 0xFF) {
                        bytes.push(code);
                    } else {
                        const buf = Buffer.from(String.fromCharCode(code), 'utf8');
                        for (const b of buf) {
                            bytes.push(b);
                        }
                    }
            }
        }
    }
    return Buffer.from(bytes).toString('utf8');
}

const cleanedContent = decodeCP1252ToUTF8(content);

// Let's write the cleaned content back
fs.writeFileSync(filePath, cleanedContent, 'utf8');
console.log('Successfully cleaned and saved learningData.json!');
