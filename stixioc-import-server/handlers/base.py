# # -*- coding: utf-8 -*-

import tornado.web
from tornado.web import HTTPError

import logging
from tornado.log import app_log, gen_log
logger = logging.getLogger('stixioc-import-server.' + __name__)

import traceback
import json

class BaseConvertHandler(tornado.web.RequestHandler):
    u'''
    '''

    def write_error(self, status_code, **kwargs):
        u'''
        Override RequestHandler.write_error() function.
        '''
        self.set_header('Content-Type', 'application/json')

        if self.settings.get("serve_traceback") and "exc_info" in kwargs:
            # in debug mode, try to send a traceback
            lines = []
            traceback_str = ""
            for line in traceback.format_exception(*kwargs["exc_info"]):
                lines.append(line)

            self.finish(json.dumps({
                'error': {
                    'code': status_code,
                    'message': self._reason,
#                    'traceback': lines,
                    'traceback': lines[len(lines)-1],
                }
            }))
        else:
            self.finish(json.dumps({
                'error': {
                    'code': status_code,
                    'message': self._reason,
                }
            }))


    def http_error(self, status_code, reason=None, msg=None):
        u'''
        '''
        self.set_status(status_code, reason)
#        self.write_error(status_code)
        raise HTTPError(status_code=status_code, reason=reason, log_message=msg)


    def http_normal(self, status_code=None, msg=None):
        u'''
        '''
        if status_code is not None:
            self.set_status(status_code)
        self.write(msg if msg is not None else u'')

        gen_log.info('Response status:"%d"/message:"%s"', status_code, msg);

        self.finish()

    def out_gen_log():
        u'''
        '''
        pass
