# -*- coding: utf-8 -*-

from handlers.stixv1  import StixV1ConvertHandler
from handlers.stixv2  import StixV2ConvertHandler
from handlers.ioc     import IoCConvertHandler

url_patterns = [
    (r'/convert/stix/v1', StixV1ConvertHandler),
    (r'/convert/stix/v2', StixV2ConvertHandler),
    (r'/convert/ioc',     IoCConvertHandler),
]

