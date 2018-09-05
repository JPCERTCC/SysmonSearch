FROM ubuntu:16.04

RUN apt-get update -y && apt-get install -yq wget build-essential gcc zlib1g-dev curl libssl-dev vim default-jre unzip libbz2-dev
RUN apt-get install -yq git

ENV LANG ja_JP.UTF-8

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

RUN pip install virtualenv
RUN pip install virtualenvwrapper
RUN pip install tornado
RUN pip install openioc-to-stix
RUN pip install git+https://github.com/oasis-open/cti-stix-slider.git
RUN echo 'source /usr/local/bin/virtualenvwrapper.sh' >> ~/.bashrc
RUN echo 'export WORKON_HOME=~/.virtualenvs' >> ~/.bashrc

RUN mkdir /root/stixioc-import-server
WORKDIR /root/stixioc-import-server/
ADD ./stixioc-import-server /root/stixioc-import-server
RUN mkdir logs
RUN virtualenv .env
RUN . .env/bin/activate
