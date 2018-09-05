#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

import tornado.ioloop
import tornado.options

from tornado.options import define, options

from tornado.log import access_log
from tornado.log import app_log
from tornado.log import gen_log
from tornado.log import LogFormatter

import logging
import logging.handlers
logger = logging.getLogger('stixioc-import-server.' + __name__)

# Original Option Setting - server setting
define("port",     default=8000, help="run on the given port", type=int)
define("debug",    default=False, help="run in debug mode")

# Original Option Setting - API setting
define("addforce", default=True)

# CURRENT_PATH
define("CURRENT_PATH", os.path.dirname(os.path.abspath(__file__)))

# LOG_PATH
define("ACCESS_LOG", options.CURRENT_PATH+"/logs/access.log")
define("APPLICATION_LOG", options.CURRENT_PATH+"/logs/error.log")
define("GENERAL_LOG", options.CURRENT_PATH+"/logs/application.log")

tornado.options.parse_config_file(os.path.join(os.path.dirname(__file__), 'server.conf'))

fmt = LogFormatter(color=False,
                   fmt='%(color)s[%(levelname)1.1s %(asctime)s.%(msecs)03d %(module)s:%(lineno)d]%(end_color)s %(message)s',
                   datefmt='%Y-%m-%d %H:%M:%S',
                   colors={40: 1, 10: 4, 20: 2, 30: 3})

fh_access = logging.handlers.TimedRotatingFileHandler(filename=options.ACCESS_LOG, when='D')
fh_access.setFormatter(fmt)
access_log.addHandler( fh_access )

fh_app = logging.handlers.TimedRotatingFileHandler(filename=options.APPLICATION_LOG, when='D')
fh_app.setFormatter(fmt)
app_log.addHandler( fh_app )

fh_gen = logging.handlers.TimedRotatingFileHandler(filename=options.GENERAL_LOG, when='D')
fh_gen.setFormatter(fmt)
gen_log.addHandler( fh_gen )


from urls import url_patterns

application = tornado.web.Application(
    url_patterns,
    cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
    xsrf_cookies=False,
    debug=options.debug,
    )

if __name__ == "__main__":

    gen_log.info( ',[session_id:],server started. port:{0}'.format(options.port) )

    # Tornado Service Start
    try:
        application.listen(options.port)
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.instance().stop()
        gen_log.info( ',[session_id:],server stoped.' )
