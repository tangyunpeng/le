/**
 * Created by heyangyang on 2015/4/13.
 */
var log4js = require('log4js');
var config = require('../config');

require('./CommonUtil').mkEmptyFileSync(config.logfile);

log4js.configure({
  appenders: [
    {
      type: 'console'
    },{
      type: 'file',
      filename: config.logfile,
      maxLogSize: config.maxLogSize,
      backups:10, // 默认为5，指定了pattern之后backups参数无效了，不指定pattern时备份的文件是在文件名后面加'.n'的数字，n从1开始自增
      // pattern: '.yyyy-MM-dd', // 指定pattern后无限备份
      // alwaysIncludePattern: false, // 不指定pattern时若为true会使用默认值'.yyyy-MM-dd'
      category: ['normal','console']
    },{
      type: 'file',
      filename: config.logfile + '.batch',
      maxLogSize: config.maxLogSize,
      backups:10, // 默认为5，指定了pattern之后backups参数无效了，不指定pattern时备份的文件是在文件名后面加'.n'的数字，n从1开始自增
      // pattern: '.yyyy-MM-dd', // 指定pattern后无限备份
      // alwaysIncludePattern: false, // 不指定pattern时若为true会使用默认值'.yyyy-MM-dd'
      category: 'batch'
    }
  ],
  levels: {
    normal: config.logLevel.toUpperCase(),
    batch: config.logLevel.toUpperCase()
  },
  replaceConsole: true //让所有console输出到日志中
});

module.exports = log4js;