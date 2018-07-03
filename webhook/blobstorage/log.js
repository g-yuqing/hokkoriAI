'use strict'
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load()
}

const path = require('path')
const args = require('yargs').argv
const storage = require('azure-storage')

const containerName = 'test-container'
const sourceFilePath = path.resolve('./example.txt')
const blobName = path.basename(sourceFilePath, path.extname(sourceFilePath))

export default class BlobLog {
  constructor() {
    this.blobService = storage.createBlobService()
  }
  createContainer() {
    return new Promise((resolve, reject) => {
      this.blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, err => {
        if(err) {
          reject(err)
        }
        else {
          resolve({ message: `Container '${containerName}' created` })
        }
      })
    })
  }
  uploadFile() {
    return new Promise((resolve, reject) => {
      this.blobService.createBlockBlobFromLocalFile(containerName, blobName, sourceFilePath, err => {
        if (err) {
          reject(err)
        }
        else{
          resolve({ message: `Upload of '${blobName}' complete` })
        }
      })
    })
  }
}
