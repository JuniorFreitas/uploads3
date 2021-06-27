require("dotenv").config();
const s3FolderUpload = require("s3-folder-upload");
const { readdirSync, unlinkSync } = require("fs");

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
        console.log(`Arquivo removido ${file}`);
      });
    });
} else {
  console.log("nenhum arquivo para upload");
}
