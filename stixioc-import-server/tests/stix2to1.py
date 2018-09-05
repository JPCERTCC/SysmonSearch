#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import traceback
import io
import json

import stixmarx

from stix2slider.options import initialize_options
from stix2slider.convert_stix import convert_indicator

def read2str(fname):
    in_str = None
    try:
        with io.open(fname, "r") as f:
            in_str = f.read()
    except:
        print traceback.format_exc().decode('utf-8')

    return in_str

def write2file(fname, out_str):
    with open(fname, "w") as f:
        f.write(out_str)

def stix2to1():
    try:
        data_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data'))

        in_str = read2str(data_dir + '/stixv2.json')

        initialize_options()

        container = stixmarx.new()
        stix_package = container.package

        json_content = json.loads(in_str)
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

#        print stix_package.to_xml()
        out_fname = './stixv2.xml'
        write2file(out_fname, stix_package.to_xml())

    except:
        print traceback.format_exc().decode('utf-8')


if __name__ == "__main__":
     stix2to1()

