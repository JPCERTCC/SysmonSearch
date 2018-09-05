#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tornado.web

import logging
from tornado.log import gen_log
from tornado.log import app_log
logger = logging.getLogger('stixioc-import-server.' + __name__)

import traceback
import json

import stixmarx
from stix2slider.options import initialize_options
from stix2slider.convert_stix import convert_indicator

from base import BaseConvertHandler
import common

class StixV2ConvertHandler(BaseConvertHandler):

    def initialize(self):
        pass

    def post(self):

        def _get_stix_package(in_json):
            if in_json is not None and len(in_json) > 0:
                initialize_options()

                container = stixmarx.new()
                stix_package = container.package

                json_content = json.loads(in_json)
                if type(json_content) == list:
                    for json_data in json_content:
                        if "type" in json_data and json_data["type"] == "indicator":
                            indicator = convert_indicator(json_data)
                            stix_package.add_indicator(indicator)
                else:
                    if "type" in json_content and json_content["type"] == "bundle":
                        if "objects" in json_content and json_content["objects"] and type(json_content["objects"]) == list:
                            for json_data in json_content["objects"]:
                                if "type" in json_data and json_data["type"] == "indicator":
                                    indicator = convert_indicator(json_data)
                                    stix_package.add_indicator(indicator)

                    elif "type" in json_content and json_content["type"] == "indicator":
                        indicator = convert_indicator(json_content)
                        stix_package.add_indicator(indicator)

                container.flush()
                container = None

                return stix_package

            else:
                raise RuntimeError('request body is empty.')


        try:
            msg = None
            for field_name, files in self.request.files.items():
                for file in files:
                    filename, content_type = file['filename'], file['content_type']
                    body = file['body']

                    gen_log.debug('POST "%s" "%s" %d bytes', filename, content_type, len(body))
                    gen_log.debug('POST file body:\n"%s"', body)

                    stix_package = _get_stix_package(body)
                    if stix_package is not None:
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
