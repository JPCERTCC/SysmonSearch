#!/bin/bash

# * set siva install folder path
export SCRIPT_HOME=/root/script
export SCRIPTPATH=$SCRIPT_HOME/collection_statistical_data.py
OUT_LOG=$SCRIPT_HOME/logs/collection_statistical_data.log

init_env() {
    source $SCRIPT_HOME/.env/bin/activate
}

start() {
    #nohup python $SCRIPTPATH >> $OUT_LOG 2>&1 &
    python $SCRIPTPATH $1
}

echo -n "Starting collection_statistical_data.py: "
echo
#init_env
start $1

exit $?
