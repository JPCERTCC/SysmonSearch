#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tornado.web

import logging
from tornado.log import gen_log
from tornado.log import app_log
logger = logging.getLogger('stixioc-import-server.' + __name__)

import traceback
from io import StringIO

import stix.bindings.stix_core as stix
from stix.core import STIXPackage as STIXPackage_v1

from .base import BaseConvertHandler
import common

class StixV1ConvertHandler(BaseConvertHandler):

    def initialize(self):
        pass

    def post(self):

        try:
            msg = None
            for field_name, files in self.request.files.items():
                for file in files:
                    filename, content_type = file['filename'], file['content_type']
                    body = file['body']

                    gen_log.info('POST "%s" "%s" %d bytes', filename, content_type, len(body))
                    gen_log.info('POST file body:\n"%s"', body)

                    stix_package = stix.parseString(body.decode())

                    patterns = common.get_search_items(stix_package)
                    msg = {'fields' : patterns}

            self.http_normal(200, msg=msg if msg is not None else u'OK')

        except:
            trace_msg = traceback.format_exc().decode('utf-8')
            emsg = u'request_msg:{0} {1}'.format(self.request.body, trace_msg)
            gen_log.error(u',[session-id:{0}],{1}'.format(None, emsg))
            self.http_error(400, msg=trace_msg)


    def get(self):
        raise tornado.web.HTTPError(405, u'Method Not Allowed')

    def delete(self):
        raise tornado.web.HTTPError(405, u'Method Not Allowed')
