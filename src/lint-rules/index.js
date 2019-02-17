import _ from 'lodash';
import { ruleToLevel } from './helper/rule';

const PluginClasses = [
  require('./space-round-alphabet'),
  require('./space-round-number'),
  require('./no-empty-code-lang'),
  require('./no-empty-delete'),
  require('./no-empty-url'),
  require('./no-empty-list'),
  require('./no-empty-code'),
  require('./no-empty-inlinecode'),
  require('./no-empty-blockquote'),
  require('./no-special-characters'),
  require('./use-standard-ellipsis'),
  require('./no-fullwidth-number'),
  require('./no-space-in-emphasis'),
  require('./no-space-in-link'),
  require('./no-multiple-space-blockquote'),
  require('./no-space-in-inlinecode'),
  require('./no-trailing-punctuation'),
];



/**
 * 所有的 lint 规则，欢迎 pr 添加
 * @param throwError
 * @param rules
 * @returns {*[]}
 */
export default (throwError, rules) => {
  // 所有的插件的默认 rules
  const rulesConfig = {};

  _.forEach(PluginClasses, Plugin => {
    rulesConfig[Plugin.type] = {
      level: 2, // 默认都是 error
    };
  });

  // 用 rules 覆盖初始配置
  Object.keys(rules).forEach((rule) => {
    const [level, config] = [].concat(rules[rule]);
    rulesConfig[rule] = {
      level,
      config,
    };
  });

  // 配置为 0 的就是关闭，不启用插件！
  const Plugins = _.filter(PluginClasses, Plugin => rulesConfig[Plugin.type].level !== 0);

  // 初始化插件
  return _.map(Plugins, Plugin => {
    const level = ruleToLevel(rulesConfig[Plugin.type].level);

    // 重新包装一下 throw 方法，加入 level
    const throwErrorFunc = error => {
      error.level = level;
      error.type = Plugin.type;
      throwError(error);
    };

    return new Plugin({ throwError: throwErrorFunc, config: rulesConfig[Plugin.type].config });
  });
};
