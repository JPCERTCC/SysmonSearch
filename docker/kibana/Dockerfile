FROM docker.elastic.co/kibana/kibana:6.2.3

USER root
RUN mkdir rule_files
RUN mkdir log
RUN mkdir /tmp/sysmon_search_plugin

RUN yum -y update && yum -y install wget gcc make zlib-devel openssl-devel

WORKDIR /root/
ENV PYTHON_VERSION 2.7.15
RUN wget https://www.python.org/ftp/python/$PYTHON_VERSION/Python-$PYTHON_VERSION.tgz \
    && tar zxf Python-$PYTHON_VERSION.tgz \
    && cd Python-$PYTHON_VERSION \
    && ./configure \
    && make altinstall
ENV PYTHONIOENCODING "utf-8"
RUN ln -s /usr/local/bin/python2.7 /usr/local/bin/python

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python get-pip.py

RUN pip install elasticsearch
RUN pip install elasticsearch_dsl

ADD ./sysmon_search_plugin /usr/share/kibana/plugins/sysmon_search_plugin
COPY ./docker-config/sysmon_search_plugin/conf.js /usr/share/kibana/plugins/sysmon_search_plugin/conf.js

RUN chown -R kibana:kibana /usr/share/kibana/plugins/sysmon_search_plugin
RUN chown -R kibana:kibana /usr/share/kibana/rule_files
RUN chown -R kibana:kibana /usr/share/kibana/log
RUN rm -rf /usr/share/kibana/optimize/*

RUN mkdir /root/script
ADD ./script /root/script
WORKDIR /root/script/
RUN mkdir logs
COPY ./docker-config/script/collection_alert_data_setting.py collection_alert_data_setting.py
COPY ./docker-config/script/collection_statistical_data_setting.py collection_statistical_data_setting.py
