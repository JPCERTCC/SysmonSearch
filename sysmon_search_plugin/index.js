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
      
      translations: [
        resolve(__dirname, './translations/es.json')
      ]
    },
    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },
    init(server, options) {
      // Add server routes and initialize the plugin here
      sysmon_search_Route(server);
    }
  });
};
