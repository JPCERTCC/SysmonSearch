var conf = {
    //elasticsearch server URL
    "elasticsearch_url": "localhost",
    //elasticsearch server Port
    "elasticsearch_port": "9200",
    //monitor rule file path
    "savepath": "/tmp/rule_files",
    //stixioc import server URL
    "import_server_url": "localhost",
    //stixioc import server port
    "import_server_port": "56020",
    //internal time (hour)
    "refine_time_range": "1",
    //maximum object number
    "max_object_num": "30",
    "elasticsearch_user": "elastic",
    "elasticsearch_password": "changeme",
};
exports.conf = conf;
