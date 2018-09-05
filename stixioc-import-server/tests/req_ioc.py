#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests

HOSTNAME='127.0.0.1'
PORT=56020
EP='http://' + HOSTNAME + ':' + str(PORT) + '/convert/ioc'

files = {
  'file': ('stuxnet.ioc.xml', open('../data/stuxnet.ioc.xml', 'r'), 'application/xml')
}

res = requests.post(EP, files=files)

print res.status_code
print res.text
