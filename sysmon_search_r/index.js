import { resolve } from 'path';
import { existsSync } from 'fs';

//import Route from './server/routes/sysmon_search';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'sysmon_search_r',
    uiExports: {
      app: {
        title: 'SysmonSearch R',
        description: 'An awesome Kibana plugin',
        main: 'plugins/sysmon_search_r/app',
      },
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) { // eslint-disable-line no-unused-vars
      //Route(server);
    }
  });
}
