/**
 * Created by heyangyang on 2015/4/27.
 */
'use strict';

var path = require('path');
var fs = require('fs');
var moment = require('moment-timezone');
var i18n = require('i18n');
var crypto = require('crypto');
var config = require('../config');

var emailRegExp  = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

module.exports = {
  splice: splice,
  isEmail: isEmail,
  clone: clone,
  mkdirsSync: mkdirsSync,
  mkEmptyFileSync: mkEmptyFileSync,
  formatEventLocation: formatEventLocation,
  getTimeZoneFromName: getTimeZoneFromName,
  geti18nValue:geti18nValue,
  encrypt3DES: encrypt3DES,
  decrypt3DES: decrypt3DES
};
/**
 * 取国际化内容
 * @param key 数据字典key
 * @param value value
 * @param language 语言
 * @returns {string} 国际化内容
 */
function geti18nValue (key,value,language) {
    if( key==null||value==null){
        return "";
    }else if(language!=null){
        var  str = i18n.__({phrase: 'MASTER_DATA.'+key+'.'+value, locale: language});
        return  str === 'MASTER_DATA.'+key+'.'+"NULL" ? "" : str;
    }else{
        var str = i18n.__( 'MASTER_DATA.'+key+'.'+value);
        return  str === 'MASTER_DATA.'+key+'.'+"NULL" ? "" : str;
    }
};


/**
 * splice方法扩展,从数组中移除元素
 * @param arrays 数组对象
 * @param options 参数
 * @param obj 替换对象
 * @returns {*} 移除的对象
 */
function splice(arrays, options, obj) {
  if(!arrays || !arrays.length) {
    return null;
  }
  if(typeof options !== 'object') return null;
  var index = [];
  for(var i = arrays.length - 1; i >= 0; i--) {
    var flag = true;
    for(var prop in options) {
      if(options.hasOwnProperty(prop)) {
        if(arrays[i][prop] !== options[prop]) {
          flag = false;
          break;
        }
      }
    }
    if(flag) {
      index.push(i);
    }
  }
  index.forEach(function(_i) {
    if(obj) {
      arrays.splice(_i,1, obj);
    } else {
      arrays.splice(_i,1);
    }
  });
}

/**
 * 是否为邮箱
 */
function isEmail(str) {
  //if(typeof str !== 'undefined' && str) {
  //  return str.indexOf('@') > 0;
  //}
  //return false;
  return emailRegExp.test(str);
}

//创建多层文件夹 同步
function mkdirsSync(dirpath, mode) {
  dirpath = path.normalize(dirpath);
  if (fs.existsSync(dirpath)) {
    //如果目标文件夹已经存在，则不用重复创建
    return;
  }
  var parent = path.dirname(dirpath);
  if (!fs.existsSync(parent)) {
    //如果父文件夹不存在，则先递归创建父文件夹
    mkdirsSync(parent, mode);
  }
  //然后创建目标文件夹
  fs.mkdirSync(dirpath, mode);
}

function mkEmptyFileSync(pathname, options) {
  if(!fs.existsSync(pathname)) {
    mkdirsSync(path.dirname(pathname));
    fs.writeFileSync(pathname, '', options);
  }
};

function getTimeZoneFromName(zoneName, year, month, date){
  var dt = new Date(year, month, date);
  var nowmoment  = new moment(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(),dt.getUTCMinutes()));
  return nowmoment.tz(zoneName).format('Z');
};

/**
 * 格式化会议Location
 * @param room
 */
function formatEventLocation(room) {
  var roomNum = parseInt(room, 10);
  if(!isNaN(roomNum)) {
    roomNum += 1000;
    return 'VR' + roomNum.toString();
  }
  return room;
}

function clone(param, deepFlag) {
  var type = typeof(param);
  switch (type) {
    case 'object':
      if(param.length === undefined) {
        var newObj = {};
        for(var i in param) {
          if(deepFlag && (typeof(param[i]) == 'object' || typeof(param[i]) == 'function')) {
            newObj[i] = clone(param[i]);
          } else{
            newObj[i] = param[i];
          }
        }
        return newObj;
      } else {
        var newArray = [];
        for(var i = 0; i < param.length; i++) {
          if(deepFlag && (typeof(param[i]) === 'object' || typeof(param[i]) === 'function')) {
            newArray[i] = clone(param[i]);
          } else{
            newArray[i] = param[i];
          }
        }
        return newArray;
      }
    case 'function':
      var that = param;
      var newFunc = function() {
        return that.apply(param, arguments);
      };
      for(var i in param) {
        newFunc[i] = param[i];
      }
      return newFunc;
  }
}

//encrypt
function encrypt3DES(plaintext, input_encoding, output_encoding) {
  input_encoding = input_encoding || 'utf8';
  output_encoding = output_encoding || 'hex';
  var key = new Buffer(config.encrypt_3des_key);
  var iv = new Buffer(config.encrypt_3des_iv);
  var cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
  cipher.setAutoPadding(true);
  var ciph = cipher.update(plaintext, input_encoding, output_encoding);
  ciph += cipher.final(output_encoding);
  return ciph;
}

//decrypt
function decrypt3DES(encryptText, input_encoding, output_encoding) {
  input_encoding = input_encoding || 'hex';
  output_encoding = output_encoding || 'utf8';
  var key = new Buffer(config.encrypt_3des_key);
  var iv = new Buffer(config.encrypt_3des_iv);
  var decipher = crypto.createDecipheriv('des-ede3-cbc', key, iv);
  decipher.setAutoPadding(true);
  var txt = decipher.update(encryptText, input_encoding, output_encoding);
  txt += decipher.final(output_encoding);
  return txt;
}