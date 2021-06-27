require("dotenv").config();
const axios = require("axios");
const s3FolderUpload = require("s3-folder-upload");
const { readdirSync, unlinkSync } = require("fs");

const Telegram = axios.create({
  baseURL: `https://api.telegram.org/bot${process.env.telegramApiKey}/`,
});

async function sendTelegram(msg) {
  await Telegram.post("SendMessage", {
    text: `${process.env.cliente} ${msg}`,
    chat_id: process.env.chatId,
    parse_mode: "html",
  })
    .then((res) => {})
    .catch((err) => {
      console.log(err);
    });
}

const folderBkp = process.env.folderBkp
  ? process.env.folderBkp
  : __dirname + "/backups";

const bkp = readdirSync(folderBkp);

const credentials = {
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region,
  bucket: process.env.bucket,
};

const options = {
  useFoldersForFileTypes: false,
  useIAMRoleCredentials: false,
};

if (bkp.length >= 1) {
  const upload = new Promise((resolve, reject) => {
    resolve(s3FolderUpload(folderBkp, credentials, options));
  });

  upload
    .then((res) => {})
    .then((res) => {
      bkp.forEach((file) => {
        unlinkSync(`${folderBkp}/${file}`);
        if (process.env.sendTelegram === "S") {
          sendTelegram(`Arquivo enviado ${file}`);
        }
      });
    });
} else {
  console.log("nenhum arquivo para upload");
}
