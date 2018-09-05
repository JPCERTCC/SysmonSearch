#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests

HOSTNAME='127.0.0.1'
PORT=56020
EP='http://' + HOSTNAME + ':' + str(PORT) + '/convert/stix/v2'

files = {
  'file': ('stixv2.json', open('../data/stixv2.json', 'r'), 'application/json')
}

res = requests.post(EP, files=files)

print res.status_code
print res.text
