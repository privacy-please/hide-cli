#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const cipher = require('./lib/cipher');
const { v4: uuid } = require('uuid');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
    { name: 'key', alias: 'k', type: String },
    { name: 'target', alias: 't', type: String, defaultOption: true },
    { name: 'hide', alias: 'h', type: Boolean },
    { name: 'show', alias: 's', type: Boolean },
]
let { key, target, hide, show } = commandLineArgs(optionDefinitions);
if (!key) key = path.resolve(target);

// #region [helpers]
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isGuid = (str) => guidRegex.test(str)
const encode = (str) => cipher.keyRotate(str, key);
const decode = (str) => cipher.keyRotate(str, key, true);
const createRecord = (name) => ({
    guid: uuid(),
    name,
    encodedName: encode(name)
});
// #endregion

const processEncoding = async (shouldEncode, files) => {
    records = (await fs.readFile(path.join(target, 'records'), { flag: 'a+', encoding: 'utf-8' }))
        .split('\n')
        .filter(x => x)
        .map(x => {
            const [guid, encodedName] = x.split('\t')
            const name = decode(encodedName)
            return { guid, name, encodedName }
        })

    for(let {dir, base} of files){
        const currentFilePath = path.join(dir, base)

        const isEncoded = isGuid(base)
        if (shouldEncode && isEncoded) continue
        if (!shouldEncode && !isEncoded) continue

        let record = records.find(x => base === (isEncoded ? x.guid : x.name))
        if (!record) {
            record = createRecord(base)
            records.push(record)
        }

        const newFileName = shouldEncode ? record.guid : record.name

        const newFilePath = path.join(dir, newFileName)

        await fs.rename(currentFilePath, newFilePath)
    }

    await fs.writeFile(path.join(target, 'records'), records.map(x => `${x.guid}\t${x.encodedName}`).join('\n'), 'utf-8')
}

async function getFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(dirents.map(async (dirent) => {
        const filePath = path.resolve(dir, dirent.name)
        return dirent.isDirectory() ? [...(await getFiles(filePath)), {filePath, isDir: true}] : {filePath}
    }))
    return Array.prototype.concat(...files)
}

(async (target) => {
    const files = (await getFiles(target)).map(({filePath, isDir}) => ({...path.parse(filePath), isDir})).filter(({name}) => name != 'records')
    const hasDecodedFiles = files.some(({ name }) => !isGuid(name))

    const shouldEncode = show !== true && (hide || hasDecodedFiles);
    await processEncoding(shouldEncode, files);

    console.log(shouldEncode ? 'Encoded': 'Decoded');
})(target)