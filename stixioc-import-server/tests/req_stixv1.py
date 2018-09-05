#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests

HOSTNAME='127.0.0.1'
PORT=56020
EP='http://' + HOSTNAME + ':' + str(PORT) + '/convert/stix/v1'

files = {
  'file': ('stuxnet.stix.xml', open('../data/stuxnet.stix.xml', 'r'), 'application/xml')
}

res = requests.post(EP, files=files)

print res.status_code
print res.text
