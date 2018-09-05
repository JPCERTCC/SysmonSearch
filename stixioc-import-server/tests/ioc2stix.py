#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import traceback
import io
from io import BytesIO

from mixbox import idgen, namespaces

from openioc2stix.translate import to_stix

def read2str(fname):
    in_xml = None
    try:
        with io.open(fname, "rb") as f:
            in_xml = f.read()
    except:
        print traceback.format_exc().decode('utf-8')

    return in_xml

def write2file(fname, out_str):
    with open(fname, "w") as f:
        f.write(out_str)

def ioc2stix():
    try:
        data_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data'))

        in_xml = read2str(data_dir + '/stuxnet.ioc.xml')

        # Set the namespace to be used in the STIX Package
        ns = namespaces.Namespace("http://openioc.org/openioc", "openioc", "")
        idgen.set_id_namespace(ns)

        stix_package = to_stix(BytesIO(in_xml))

#        print stix_package.to_xml()
        out_fname = './stuxnet.xml'
        write2file(out_fname, stix_package.to_xml())

    except:
        print traceback.format_exc().decode('utf-8')


if __name__ == "__main__":
     ioc2stix()

