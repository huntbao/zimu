/**
 * Created by huntbao on 16/11/6.
 */
'use strict'
let fs = require('fs')
let request = require('request')
let crypto = require('crypto')
let glob = require("glob")
let parseArgs = require('minimist')

const BLOCKSIZE = 4096

function downloadSubtitle(filename, cb) {
    function getMd5Hash() {
        let fd = fs.openSync(filename, 'r')
        let md5 = (position) => {
            let buffer = new Buffer(BLOCKSIZE)
            fs.readSync(fd, buffer, 0, BLOCKSIZE, position)
            let fsHash = crypto.createHash('md5')
            fsHash.update(buffer)
            return fsHash.digest('hex')
        }
        const stats = fs.statSync(filename)
        const fileSize = stats.size
        let md5s = []
        let offsets = [BLOCKSIZE, parseInt(fileSize / 3) * 2, parseInt(fileSize / 3), fileSize - BLOCKSIZE * 2]
        offsets.forEach((offset) => {
            md5s.push(md5(offset))
        })
        const hash = md5s.join(';')
        fs.closeSync(fd)
        return hash
    }

    let form = {
        filehash: getMd5Hash(filename),
        pathinfo: '',
        format: 'json',
        lang: 'Chn'
    }
    request.post({
        url: 'https://shooter.cn/api/subapi.php',
        form: form
    }, (err, httpResponse, body) => {
        if (err) {
            cb()
            return console.error(`Server error: ${err}`)
        }
        let files
        try {
            files = JSON.parse(body)
        } catch (e) {
            cb()
            return console.error(`Server response error: ${e}`)
        }
        files.forEach((file, idx) => {
            if (file.Delay) {
                let fn = `${filename}.chn${idx || ''}.delay`
                console.log(`Creating file: ${fn}`)
                fs.writeFileSync(fn, file.Delay)
            }
            if (!file.Files.length) {
                console.log(`No link error: ${filename}`)
                return cb()
            }
            console.log(file.Files[0].Link)
            request({
                url: file.Files[0].Link,
                encoding: null
            }, (error, data, body) => {
                let fn = `${filename}.chn${idx || ''}.${file.Files[0].Ext}`
                console.log(`Creating file: ${fn}`)
                fs.writeFileSync(fn, body)
                if (idx == files.length - 1) {
                    console.log(`Done: ${filename}`)
                    cb()
                }
            })
        })
    })
}

let argv = parseArgs(process.argv.slice(2))
let dir = argv.p || process.cwd()
let videoType = argv.t || 'mkv'
let videoTypes = ''
videoType.split(',').forEach((type) => {
    if (videoTypes) {
        videoTypes += '|'
    }
    videoTypes += `*.${type}`
})

glob(`${dir}/(${videoTypes})`, function (er, files) {
    let start = () => {
        if (files.length) {
            downloadSubtitle(files[0], () => {
                files.shift()
                start()
            })
        }
    }
    start()
});