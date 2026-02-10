// src/config/i18n.js
const i18n = require('i18n')
const path = require('path')

i18n.configure({
  locales: ['en', 'rw', 'fr'],
  directory: path.join(__dirname, '../../locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',        // ?lang=rw
  header: 'accept-language',     // Accept-Language: rw
  cookie: 'lang',
  objectNotation: true
})

module.exports = i18n