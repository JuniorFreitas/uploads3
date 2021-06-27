require("dotenv").config();
const { unlinkSync, existsSync, mkdirSync } = require("fs");
const mysqldump = require("mysqldump");
const axios = require("axios");
const s3FolderUpload = require("s3-folder-upload");
const moment = require("moment");
const tz = require("moment-timezone");

const { exec } = require("child_process");

const folderBkp = process.env.folderBkp
  ? process.env.folderBkp
  : __dirname + "/backup";

if (!existsSync(folderBkp)) {
  mkdirSync(folderBkp);
}

const nameUnique = moment().tz("America/Sao_Paulo").format("DDMMYYYY_HHmm");
const nameDump = `${folderBkp}/${process.env.database}-${nameUnique}.sql.gz`;

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

exec(
  `docker exec -t ${process.env.container_name} /usr/bin/mysqldump -u ${process.env.user} --password="${process.env.password}" ${process.env.database} | gzip > ${nameDump}`,
  (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
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
  }
);
