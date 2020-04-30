import { resolve } from 'path';
import sysmon_search_Route from './server/routes/sysmon_search';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'sysmon_search_visual',
    uiExports: {
      app: {
        title: 'SysmonSearch',
        description: 'sample SysmonSearch plugin',
        main: 'plugins/sysmon_search_visual/app'
      },
    },
    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },
    init(server, options) {
      sysmon_search_Route(server);
    }
  });
};
