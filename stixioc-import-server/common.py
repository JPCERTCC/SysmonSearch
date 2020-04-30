#!/usr/bin/env python
# -*- coding: utf-8 -*-

import traceback
import string

# stix.bindings packages
import stix.bindings.stix_core as stix

# cybox.bindings packages
from cybox.bindings.address_object import AddressObjectType
from cybox.bindings.file_object import FileObjectType
from cybox.bindings.process_object import ProcessObjectType
from cybox.bindings.win_registry_key_object import WindowsRegistryKeyObjectType
from cybox.bindings.hostname_object import HostnameObjectType
from cybox.bindings.port_object import PortObjectType
from cybox.bindings.socket_address_object import SocketAddressObjectType
from cybox.bindings.network_connection_object import NetworkConnectionObjectType
from cybox.bindings.url_history_object import URLHistoryObjectType

# stix.core packages
from stix.core import STIXPackage

# cybox.objects packages
from cybox.objects.address_object import Address
from cybox.objects.file_object import File
from cybox.objects.process_object import Process
from cybox.objects.win_registry_key_object import WinRegistryKey
from cybox.objects.hostname_object import Hostname
from cybox.objects.port_object import Port


def _add_search_item(patterns, key, value):
    u'''
    add search key/value item into the list 'patterns'
    in:
      - patterns
      - key
      - value
          type of list/str
    '''
    if type(value) == list:
        for v in value:
            pattern = {}
            pattern["key"] = key
            pattern["value"] = string.strip(v, "' ")
            patterns.append(pattern)
    else:
        pattern = {}
        pattern["key"] = key
        pattern["value"] = value #string.strip(value, "' ")
        patterns.append(pattern)



def _set_search_items_from_address_object(patterns, prop):
    u'''
    extract and set search key/value items from Cybox binding Address Object

    in:
      - patterns
         patterns
      - prop
    '''
    if prop is None or type(prop) != AddressObjectType:
        return
    # translate cybox.bindings object to cybox.objects object
    obj = Address.from_obj(prop)

    # IPv4, IPv6
    if obj.category == "ipv4-addr" or obj.category == "ipv6-addr":
        #address = unicode(obj.address_value)
        address = str(obj.address_value)

        if address[0] == '[' and address[len(address)-1] == ']':
              
            _add_search_item(patterns, u"IpAddress", address[1:len(address)-2].split(','))
        else:
            _add_search_item(patterns, u"IpAddress", address)


def _set_search_items_from_file_object(patterns, prop):
    u'''
    extract and set search key/value items from Cybox binding File Object
    '''
    if prop is None or type(prop) != FileObjectType:
        return
    # translate cybox.bindings object to cybox.objects object
    obj = File.from_obj(prop)

    # File Hash(md5/sha1/sha256)
    if obj.hashes is not None:
        for h in obj.hashes:
            if h.fuzzy_hash_value is not None:
                _add_search_item(patterns, u"Hash", str(h.fuzzy_hash_value))
            elif h.simple_hash_value is not None:
                hash = str(h.simple_hash_value)
                if hash[0] == '[' and hash[len(hash)-1] == ']':
                    _add_search_item(patterns, u"Hash", hash[1:len(hash)-2].split(','))
                else:
                    _add_search_item(patterns, u"Hash", hash)

    # File Name
    if obj.file_name is not None:
         filename = str(obj.file_name)
         if filename[0] == '[' and filename[len(filename)-1] == ']':
             for f in filename[1:len(filename)-2].split(','):
                 file = f
                 if obj.file_path is not None:
                     file = u"%s%s" % (obj.file_path, f)
                 _add_search_item(patterns, u"FileName", file)
         else:
             file = filename
             if obj.file_path is not None:
                 file = u"%s%s" % (obj.file_path, filename)
             _add_search_item(patterns, u"FileName", file)

    # File Path
#    elif obj.file_path is not None:
#        filepath = unicode(obj.file_path)
#        if filepath[0] == '[' and filepath[len(filepath)-1] == ']':
#            _add_search_item(patterns, u"FileName", filepath[1:len(filepath)-2].split(','))
#        else:
#            _add_search_item(patterns, u"FileName", filepath)


def _set_search_items_from_process_object(patterns, prop):
    u'''
    extract and set search key/value items from Cybox binding Process Object
    '''
    if prop is None or type(prop) != ProcessObjectType:
        return
    # translate cybox.bindings object to cybox.objects object
    obj = Process.from_obj(prop)

    # Process
    if obj.name is not None:
        process = str(obj.name)
        if process[0] == '[' and process[len(process)-1] == ']':
            _add_search_item(patterns, u"ProcessName", process[1:len(process)-2].split(','))
        else:
            _add_search_item(patterns, u"ProcessName", process)


def _set_search_items_from_win_registry_key_object(patterns, prop):
    u'''
    extract and set search key/value items from Cybox binding WindowsRegistryKey Object
    '''
    if prop is None or type(prop) != WindowsRegistryKeyObjectType:
        return
    # translate cybox.bindings object to cybox.objects object
    obj = WinRegistryKey.from_obj(prop)

    # Win Registry Key
    if obj.key is not None:
        keyname = str(obj.key)
        if keyname[0] == '[' and keyname[len(keyname)-1] == ']':
            for key in keyname[1:len(keyname)-2].split(','):
                if obj.hive is not None:
                    key = u"%s\\%s" % (obj.hive, key)
                _add_search_item(patterns, u"RegistryKey", key)

        else:
            key = keyname
            if obj.hive is not None:
                key = u"%s\\%s" % (obj.hive, key)
            _add_search_item(patterns, u"RegistryKey", key)
       
    # Win Registry Value
    if obj.values is not None:
        for value in obj.values:
            if value is not None:
                if value.data is not None:
                    value_data = str(value.data)
                    if value_data[0] == '[' and value_data[len(value_data)-1] == ']':
                        _add_search_item(patterns, u"RegistryValue", value_data[1:len(value_data)-2].split(','))
                    else:
                        _add_search_item(patterns, u"RegistryValue", value_data)


def _set_search_items_from_hostname_object(patterns, prop):
    u'''
    extract and set search key/value items from Cybox binding HostName Object
    '''
    if prop is None or type(prop) != HostnameObjectType:
        return
    # translate cybox.bindings object to cybox.objects object
    obj = Hostname.from_obj(prop)

    # Host Name
    if obj.hostname_value is not None:
        host = str(obj.hostname_value)
        if host[0] == '[' and host[len(host)-1] == ']':
            _add_search_item(patterns, u"HostName", host[1:len(host)-2].split(','))
        else:
            _add_search_item(patterns, u"HostName", host)


def _set_search_items_from_port_object(patterns, prop):
    u'''
    extract and set search key/value items from Cybox binding Port Object
    '''
    if prop is None or type(prop) != PortObjectType:
        return
    # translate cybox.bindings object to cybox.objects object
    obj = Port.from_obj(prop)

    # Port
    if obj.port_value is not None:
        #port = unicode(obj.port_value)
        port = str(obj.port_value)
        _add_search_item(patterns, u"Port", port)
    

def _set_search_items_from_socket_address_object(patterns, prop):
    u'''
    extract and set search key/value items from Cybox binding SocketAddress Object
    '''
    if prop is None or type(prop) != SocketAddressObjectType:
        return

    _set_search_items_from_hostname_object(patterns, prop.get_Hostname())
    _set_search_items_from_address_object(patterns, prop.get_IP_Address())
    _set_search_items_from_port_object(patterns, prop.get_Port())


def _set_search_items_from_network_connection_object(patterns, prop):
    u'''
    extract and set search key/value items from Cybox binding NetworkConnection Object
    '''
    if prop is None or type(prop) != NetworkConnectionObjectType:
        return 

    _set_search_items_from_socket_address_object(patterns, prop.get_Destination_Socket_Address())


def _set_search_items_from_url_history_object(patterns, prop):
    u'''
    extract and set search key/value items from Cybox binding URLHistory Object
    '''
    if prop is None or type(prop) != URLHistoryObjectType:
        return 

    if prop.get_URL_History_Entry() is not None:
        entries = prop.get_URL_History_Entry()
        for entry in entries:
            _set_search_items_from_hostname_object(patterns, entry.get_Hostname())


def _get_search_items_in_observable(observable):
    u'''
    '''

    patterns = []

    if observable is None:
        return

    if observable.get_Observable_Composition() is not None:
        observable_composition = observable.get_Observable_Composition()
        observables = observable_composition.get_Observable()
        for obs in observables:
            patterns2 = _get_search_items_in_observable(obs)
            if patterns2 is not None:
                patterns += patterns2
 
    else:
        obj = observable.get_Object()
        if obj is None or obj.get_Properties() is None:
            return

        properties = obj.get_Properties()

        if type(properties) == AddressObjectType:
            _set_search_items_from_address_object(patterns, properties)

        elif type(properties) == PortObjectType:
            _set_search_items_from_port_object(patterns, properties)

        elif type(properties) == HostnameObjectType:
            _set_search_items_from_hostname_object(patterns, properties)

        elif type(properties) == ProcessObjectType:
            _set_search_items_from_process_object(patterns, properties)

        elif type(properties) == FileObjectType:
            _set_search_items_from_file_object(patterns, properties)

        elif type(properties) == WindowsRegistryKeyObjectType:
            _set_search_items_from_win_registry_key_object(patterns, properties)

        elif type(properties) == SocketAddressObjectType:
            _set_search_items_from_socket_address_object(patterns, properties)

        elif type(properties) == NetworkConnectionObjectType:
            _set_search_items_from_network_connection_object(patterns, properties)

        elif type(properties) == URLHistoryObjectType:
            _set_search_items_from_url_history_object(patterns, properties)

    return patterns



def get_search_items(stix_package):
    u'''
    extract search key/value from Cybox Observables using STIX/Cybox bindings

    in:
      - stix_package: STIX Package object(stix.core.STIXPackage/stix.bindings.stix_core)
    out:
      - search key/value items from Cybox Observables
    '''

    pkg = stix_package

    if type(stix_package) == STIXPackage:
        xml = stix_package.to_xml(encoding=None)
        print(xml)
        #pkg = stix.parseString(stix_package.to_xml())
        pkg = stix.parseString(xml)


    patterns = []

    if pkg.get_Indicators() is None:
        return patterns

    indicators = pkg.get_Indicators().get_Indicator()
    for indicator in indicators:
        observable = indicator.get_Observable()
        if observable is None:
            pass
        patterns2 = _get_search_items_in_observable(observable)
        if patterns2 is not None:
            patterns += patterns2

    return patterns

