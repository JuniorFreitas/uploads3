require("dotenv").config();
const { unlinkSync, existsSync, mkdirSync } = require("fs");
const mysqldump = require("mysqldump");
const axios = require("axios");
const s3FolderUpload = require("s3-folder-upload");
const moment = require("moment");

const folderBkp = process.env.folderBkp
  ? process.env.folderBkp
  : __dirname + "/backup";

if (!existsSync(folderBkp)) {
  mkdirSync(folderBkp);
}

async function sendTelegram(msg) {
  await axios
    .post(
      `https://api.telegram.org/bot${process.env.telegramApiKey}/SendMessage`,
      {
        text: `${process.env.cliente} ${msg}`,
        chat_id: process.env.chatId,
        parse_mode: "html",
      }
    )
    .then((res) => {})
    .catch((err) => {
      console.log(err);
    });
}

(async function dump() {
  const nameUnique = moment().format("DDMMYYYY_hhmm");
  const nameDump = `${folderBkp}/${process.env.database}-${nameUnique}.sql.gz`;
  await mysqldump({
    connection: {
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database,
    },
    dumpToFile: nameDump,
    compressFile: true,
  }).then((res) => {
    const upload = new Promise((resolve, reject) => {
      resolve(
        s3FolderUpload(
          folderBkp,
          {
            accessKeyId: process.env.accessKeyId,
            secretAccessKey: process.env.secretAccessKey,
            region: process.env.region,
            bucket: process.env.bucket,
          },
          {
            useFoldersForFileTypes: false,
            useIAMRoleCredentials: false,
          }
        )
      );
    })
      .then((res) => {
        unlinkSync(nameDump);
        if (process.env.sendTelegram === "S") {
          sendTelegram(
            `DUMP no s3 ${process.env.database}-${nameUnique}.sql.gz`
          );
        }
      })
      .catch((err) => {
        console.log(err);
        if (process.env.sendTelegram === "S") {
          sendTelegram(
            `Erro no dump do cliente ${process.env.cliente} - ${err}`
          );
        }
      });
  });
})();
