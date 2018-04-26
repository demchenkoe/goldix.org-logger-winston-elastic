
const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const {LoggerConsole} = require('@goldix.org/logger-console');


class LoggerWinstonElastic extends LoggerConsole {
  
  /**
   * @see https://github.com/vanthome/winston-elasticsearch
   *
   * @param options
   * @param options.level [info] Messages logged with a severity greater or equal to the given one are logged to ES; others are discarded.
   * @param options.levelindex [none] the index to be used. This option is mutually exclusive with indexPrefix.
   * @param options.levelindexPrefix [logs] the prefix to use to generate the index name according to the pattern <indexPrefix>-<indexSuffixPattern>.
   * @param options.levelindexSuffixPattern [YYYY.MM.DD] a Moment.js compatible date/ time pattern.
   * @param options.levelmessageType [log] the type (path segment after the index path) under which the messages are stored under the index.
   * @param options.leveltransformer [see below] a transformer function to transform logged data into a different message structure.
   * @param options.levelensureMappingTemplate [true] If set to true, the given mappingTemplate is checked/ uploaded to ES when the module is sending the fist log message to make sure the log messages are mapped in a sensible manner.
   * @param options.levelmappingTemplate [see file index-template-mapping.json file] the mapping template to be ensured as parsed JSON.
   * @param options.levelflushInterval [2000] distance between bulk writes in ms.
   * @param options.levelclient An elasticsearch client instance. If given, all following options are ignored.
   * @param options.levelclientOpts An object hash passed to the ES client. See its docs for supported options.
   * @param options.levelwaitForActiveShards [1] Sets the number of shard copies that must be active before proceeding with the bulk operation.
   * @param options.levelpipeline [none] Sets the pipeline id to pre-process incoming documents with. See the bulk API docs.
   */
  
  constructor(options) {
    super(options);
  }
  
  async init() {
    this._winston = new winston.Logger({
      transports: [
        new Elasticsearch(this.options)
      ]
    });
    return true;
  }
  
  getLevelInfo(level) {
    let levelNum = 7, method = 'log';
    switch (level) {
      case 'emerg':
        method = 'error';
        levelNum = 0;
        break;
      case 'alert':
        method = 'error';
        levelNum = 1;
        break;
      case 'crit':
        method = 'error';
        levelNum = 2;
        break;
      case 'error':
        method = 'error';
        levelNum = 3;
        break;
      case 'warn':
      case 'warning':
        method = 'warn';
        levelNum = 4;
        break;
      case 'log':
      case 'notice':
        method = 'log';
        levelNum = 5;
        break;
      case 'info':
      case 'verbose':
      case 'profiler':
        method = 'info';
        levelNum = 6;
        break;
      case 'debug':
      case 'silly':
        method = 'info';
        levelNum = 7;
        break;
      default:
        method = 'log';
        levelNum = 5;
        break;
    }
    
    return { method, level, levelNum };
  }
  
  async _writeMessage(transformedMessage) {
    let args = [transformedMessage.message];
    if(transformedMessage.payload) {
      args.push(transformedMessage.payload);
    }
    this._winston[transformedMessage.method].apply(this._winston, args);
    return true;
  }
}

module.exports = { LoggerWinstonElastic };